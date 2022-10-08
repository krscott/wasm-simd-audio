#[cfg(target_arch = "wasm32")]
use crate::cooley_tukey::{bit_reverse_copy, numbits};
use core::f32::consts::PI;
use rustfft::num_complex::Complex;
use std::{
    arch::wasm32::*,
    ops::{Add, Sub},
};

#[target_feature(enable = "simd128")]
pub fn simd_cooley_tukey_fft3(input: &[Complex4], output: &mut [Complex4]) {
    assert_eq!(input.len(), output.len());
    assert!(crate::is_power_of_2(input.len()));

    const TWO_PI: f32 = 2.0 * PI;

    let n = input.len();

    bit_reverse_copy(input, output);

    // let n = output.len();
    let n_log2 = numbits(n) - 1;

    (1..=n_log2).for_each(|s| {
        let m: usize = 1 << s;
        let mdiv2 = m >> 1;
        let theta = -TWO_PI / m as f32;
        let wm = Complex4::new(theta.cos(), theta.sin());

        (0..n).step_by(m).for_each(|k| {
            let mut w = Complex4::one();

            (0..mdiv2).for_each(|j| {
                // let t = w * output[k + j + mdiv2];
                // w *= wm;
                let t;
                (t, w) = mul_parallel(w, output[k + j + mdiv2], w, wm);

                let u = output[k + j];

                output[k + j] = u + t;
                output[k + j + mdiv2] = u - t;
            })
        })
    })
}

/// [`v128`] wrapper around complex `a + jb` of the form `a | b | X | X`
#[derive(Clone, Copy)]
pub struct Complex4(v128);

impl Complex4 {
    #[target_feature(enable = "simd128")]
    pub fn new(re: f32, im: f32) -> Self {
        Self(f32x4(re, im, 0., 0.))
    }

    #[target_feature(enable = "simd128")]
    pub fn real(re: f32) -> Self {
        Self(f32x4(re, 0., 0., 0.))
    }

    #[target_feature(enable = "simd128")]
    pub const fn one() -> Self {
        Self(f32x4(1., 0., 0., 0.))
    }

    #[target_feature(enable = "simd128")]
    pub const fn zero() -> Self {
        Self(f32x4(0., 0., 0., 0.))
    }

    #[target_feature(enable = "simd128")]
    pub fn norm(&self) -> f32 {
        let a = f32x4_extract_lane::<0>(self.0);
        let b = f32x4_extract_lane::<1>(self.0);

        (a * a + b * b).sqrt()
    }
}

impl Add for Complex4 {
    type Output = Self;

    #[target_feature(enable = "simd128")]
    fn add(self, rhs: Self) -> Self::Output {
        Self(f32x4_add(self.0, rhs.0))
    }
}

impl Sub for Complex4 {
    type Output = Self;

    #[target_feature(enable = "simd128")]
    fn sub(self, rhs: Self) -> Self::Output {
        Self(f32x4_sub(self.0, rhs.0))
    }
}

impl From<Complex<f32>> for Complex4 {
    #[target_feature(enable = "simd128")]
    fn from(x: Complex<f32>) -> Self {
        Self(f32x4(x.re, x.im, 0., 0.))
    }
}

impl From<Complex4> for Complex<f32> {
    #[target_feature(enable = "simd128")]
    fn from(x: Complex4) -> Self {
        Complex {
            re: f32x4_extract_lane::<0>(x.0),
            im: f32x4_extract_lane::<1>(x.0),
        }
    }
}

/// Calculate `left0 * right0` and `left1 * right1` in parallel using SIMD.
#[target_feature(enable = "simd128")]
fn mul_parallel(
    left0: Complex4,
    right0: Complex4,
    left1: Complex4,
    right1: Complex4,
) -> (Complex4, Complex4) {
    // In all calculations, both pairs will do the same operations.
    // So, we only need to reason about the first 2 lanes as if they were f32x2:
    //   (a + ib)*(c + id) = (ac - bd) + i(bc + ad)

    const A0: usize = 0;
    const B0: usize = 1;
    const A1: usize = 4;
    const B1: usize = 5;

    // repeated for convenience for right* inputs
    const C0: usize = A0;
    const D0: usize = B0;
    const C1: usize = A1;
    const D1: usize = B1;

    // a | b
    let a_b = u32x4_shuffle::<A0, B0, A1, B1>(left0.0, left1.0);
    // c | c
    let c_c = u32x4_shuffle::<C0, C0, C1, C1>(right0.0, right1.0);
    // d | d
    let d_d = u32x4_shuffle::<D0, D0, D1, D1>(right0.0, right1.0);

    // b | a
    let b_a = u32x4_shuffle::<1, 0, 3, 2>(a_b, a_b);

    // ac | bc
    let ac_bc = f32x4_mul(a_b, c_c);
    // bd | ad
    let bd_ad = f32x4_mul(b_a, d_d);

    // ac-bd |        - Real output
    let acmbd_bcmad = f32x4_sub(ac_bc, bd_ad);
    //       | bc+ad  - Imaginary output
    let acpbd_bcpad = f32x4_add(ac_bc, bd_ad);

    let out_left = u32x4_shuffle::<0, 5, 0, 0>(acmbd_bcmad, acpbd_bcpad);
    let out_right = u32x4_shuffle::<2, 7, 0, 0>(acmbd_bcmad, acpbd_bcpad);

    (Complex4(out_left), Complex4(out_right))
}

// fn log_vector(msg: &str, v: v128) {
//     use wasm_bindgen::JsValue;
//     use web_sys::console;
//     console::log_5(
//         &JsValue::from_str(msg),
//         &JsValue::from_f64(f32x4_extract_lane::<0>(v) as f64),
//         &JsValue::from_f64(f32x4_extract_lane::<1>(v) as f64),
//         &JsValue::from_f64(f32x4_extract_lane::<2>(v) as f64),
//         &JsValue::from_f64(f32x4_extract_lane::<3>(v) as f64),
//     )
// }

pub fn test_mul_parallel() {
    use approx::assert_abs_diff_eq;

    let a = Complex { re: 1.23, im: 2.34 };
    let b = Complex { re: 0.56, im: 1.11 };

    let (out0, out1) = mul_parallel(a.into(), b.into(), a.into(), b.into());

    assert_abs_diff_eq!(out0.norm(), out1.norm());
    assert_abs_diff_eq!((a * b).norm(), out0.norm());
}
