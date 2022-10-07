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

/// Calculate `left0 * right0` and `left1 * right1` in parallel using SIMD.
#[target_feature(enable = "simd128")]
fn simd_complex_mul(
    left0: Complex<f32>,
    right0: Complex<f32>,
    left1: Complex<f32>,
    right1: Complex<f32>,
) -> (Complex<f32>, Complex<f32>) {
    // In all calculations, both pairs will do the same operations.
    // So, we only need to reason about the first 2 lanes as if they were f32x2:
    //   (a + ib)*(c + id) = (ac - bd) + i(bc + ad)

    // a | b
    let a_b = f32x4(left0.re, left0.im, left1.re, left1.im);
    // c | c
    let c_c = f32x4(right0.re, right0.re, right1.re, right1.re);
    // d | d
    let d_d = f32x4(right0.im, right0.im, right1.im, right1.im);

    // b | a - Get by swapping lanes of a_b (second parameter is not used)
    let b_a = u32x4_shuffle::<1, 0, 3, 2>(a_b, a_b);

    // ac | bc
    let ac_bc = f32x4_mul(a_b, c_c);
    // bd | ad
    let bd_ad = f32x4_mul(b_a, d_d);

    // ac-bd |        - Real output
    let acmbd_bcmad = f32x4_sub(ac_bc, bd_ad);
    //       | bc+ad  - Imaginary output
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
