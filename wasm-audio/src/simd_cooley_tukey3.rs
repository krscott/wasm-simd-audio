#[cfg(target_arch = "wasm32")]
use crate::cooley_tukey::{bit_reverse_copy, numbits};
use core::f32::consts::PI;
use rustfft::num_complex::Complex;
use std::{
    arch::wasm32::*,
    ops::{Add, Mul, Sub},
};

#[target_feature(enable = "simd128")]
pub fn simd_cooley_tukey_fft3(input: &[Complex<f32>], output: &mut [Complex<f32>]) {
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
        let wm = Complex {
            re: theta.cos(),
            im: theta.sin(),
        };

        (0..n).step_by(m).for_each(|k| {
            if mdiv2 >= 4 {
                // Parallel (x4) operations

                let (mut w, wm) = init_w_x4(wm);

                (0..mdiv2).step_by(4).for_each(|j| {
                    let i_e = k + j;
                    let i_o = i_e + mdiv2;

                    let t: Complex4 = w * output[i_o..i_o + 4].into();
                    let u: Complex4 = output[i_e..i_e + 4].into();
                    (u + t).assign_lanes(&mut output[i_e..i_e + 4]);
                    (u - t).assign_lanes(&mut output[i_o..i_o + 4]);
                    w = w * wm;
                });
            } else {
                // TODO: x2 branch?
                // Serial (x1) operations

                let mut w = Complex::new(1., 0.);

                (0..mdiv2).for_each(|j| {
                    let t = w * output[k + j + mdiv2];
                    let u = output[k + j];
                    output[k + j] = u + t;
                    output[k + j + mdiv2] = u - t;
                    w *= wm;
                });
            }
        });
    });
}

#[derive(Clone, Copy)]
struct Complex4 {
    re: v128,
    im: v128,
}

impl Complex4 {
    fn extract_lane<const N: usize>(&self) -> Complex<f32> {
        Complex {
            re: f32x4_extract_lane::<N>(self.re),
            im: f32x4_extract_lane::<N>(self.im),
        }
    }

    /// Panics if a.len() < 4
    fn assign_lanes(&self, arr: &mut [Complex<f32>]) {
        arr[0] = self.extract_lane::<0>();
        arr[1] = self.extract_lane::<1>();
        arr[2] = self.extract_lane::<2>();
        arr[3] = self.extract_lane::<3>();
    }
}

impl From<&[Complex<f32>]> for Complex4 {
    fn from(arr: &[Complex<f32>]) -> Self {
        // This will panic if a.len() < 4
        Self {
            re: f32x4(arr[0].re, arr[1].re, arr[2].re, arr[3].re),
            im: f32x4(arr[0].im, arr[1].im, arr[2].im, arr[3].im),
        }
    }
}

impl Mul for Complex4 {
    type Output = Self;

    fn mul(self, rhs: Self) -> Self::Output {
        let ac = f32x4_mul(self.re, rhs.re);
        let bd = f32x4_mul(self.re, rhs.im);
        let bc = f32x4_mul(self.re, rhs.re);
        let ad = f32x4_mul(self.re, rhs.im);

        Self {
            re: f32x4_sub(ac, bd),
            im: f32x4_add(bc, ad),
        }
    }
}

impl Add for Complex4 {
    type Output = Self;

    fn add(self, rhs: Self) -> Self::Output {
        Self {
            re: f32x4_add(self.re, rhs.re),
            im: f32x4_add(self.im, rhs.im),
        }
    }
}

impl Sub for Complex4 {
    type Output = Self;

    fn sub(self, rhs: Self) -> Self::Output {
        Self {
            re: f32x4_sub(self.re, rhs.re),
            im: f32x4_sub(self.im, rhs.im),
        }
    }
}

/// Get real and imag vectors of (wm^0, wm^1, wm^2, wm^3), and (wm^4, wm^4, wm^4, wm^4)
fn init_w_x4(wm: Complex<f32>) -> (Complex4, Complex4) {
    // let ident = Complex { re: 1., im: 0. };
    // let wm2 = wm * wm;
    // let wm3 = wm2 * wm;
    // let wm4 = wm3 * wm;
    // (
    //     (&[ident, wm, wm2, wm3][0..]).into(),
    //     (&[wm4, wm4, wm4, wm4][0..]).into(),
    // )

    let a = wm.re;
    let b = wm.im;
    let a2 = a * a;
    let b2 = b * b;
    let a3 = a2 * a;
    let b3 = b2 * b;
    let a4 = a3 * a;
    let b4 = b3 * b;

    (
        Complex4 {
            re: f32x4(1., a, a2 - b2, a3 - 3. * a * b2),
            im: f32x4(0., b, 2. * a * b, 3. * a2 * b - b3),
        },
        Complex4 {
            re: f32x4_splat(a4 - 6. * a2 * b2 + b4),
            im: f32x4_splat(4. * (a3 * b - a * b3)),
        },
    )
}
