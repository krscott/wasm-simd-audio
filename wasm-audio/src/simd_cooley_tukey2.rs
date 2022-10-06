#[cfg(target_arch = "wasm32")]
use crate::cooley_tukey::{bit_reverse_copy, numbits};
use core::f32::consts::PI;
use rustfft::num_complex::Complex;
use std::arch::wasm32::*;

#[target_feature(enable = "simd128")]
pub fn simd_cooley_tukey_fft2(input: &[Complex<f32>], output: &mut [Complex<f32>]) {
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
            let mut w = Complex::new(1., 0.);

            (0..mdiv2).for_each(|j| {
                // let t = w * output[k + j + mdiv2];
                // w *= wm;
                let t;
                (t, w) = simd_complex_mul(w, output[k + j + mdiv2], w, wm);

                let u = output[k + j];

                output[k + j] = u + t;
                output[k + j + mdiv2] = u - t;
            })
        })
    })
}

#[target_feature(enable = "simd128")]
fn simd_complex_mul(
    op0_a: Complex<f32>,
    op0_b: Complex<f32>,
    op1_a: Complex<f32>,
    op1_b: Complex<f32>,
) -> (Complex<f32>, Complex<f32>) {
    let a_b = f32x4(op0_a.re, op0_a.im, op1_a.re, op1_a.im);
    let c_c = f32x4(op0_b.re, op0_b.re, op1_b.re, op1_b.re);
    let d_d = f32x4(op0_b.im, op0_b.im, op1_b.im, op1_b.im);

    // Second parameter is not used
    let b_a = u32x4_shuffle::<1, 0, 3, 2>(a_b, a_b);

    let ac_bc = f32x4_mul(a_b, c_c);
    let bd_ad = f32x4_mul(b_a, d_d);

    let acmbd_bcmad = f32x4_sub(ac_bc, bd_ad);
    let acpbd_bcpad = f32x4_add(ac_bc, bd_ad);

    (
        Complex {
            re: f32x4_extract_lane::<0>(acmbd_bcmad),
            im: f32x4_extract_lane::<1>(acpbd_bcpad),
        },
        Complex {
            re: f32x4_extract_lane::<2>(acmbd_bcmad),
            im: f32x4_extract_lane::<3>(acpbd_bcpad),
        },
    )
}
