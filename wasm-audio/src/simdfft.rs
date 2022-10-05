#[cfg(target_arch = "wasm32")]
use crate::fft::{bit_reverse_copy, numbits};
use core::f32::consts::PI;
use rustfft::num_complex::Complex;

#[target_feature(enable = "simd128")]
pub fn fft_simd(input: &[Complex<f32>], output: &mut [Complex<f32>]) {
    // use std::arch::wasm32::*;

    const TWO_PI: f32 = 2.0 * PI;

    // const NTWO_PI_I: Complex<f32> = Complex {
    //     re: 0.,
    //     im: -2.0 * PI,
    // };

    assert_eq!(input.len(), output.len());
    assert!(crate::is_power_of_2(input.len()));

    let n = input.len();

    bit_reverse_copy(input, output);

    // let n = output.len();
    let n_log2 = numbits(n) - 1;

    (1..=n_log2).for_each(|s| {
        let m: usize = 1 << s;
        let mdiv2 = m >> 1;
        // let wm = Complex::exp(NTWO_PI_I / m as f32);
        let theta = -TWO_PI / m as f32;
        let wm = Complex {
            re: theta.cos(),
            im: theta.sin(),
        };

        (0..n).step_by(m).for_each(|k| {
            let mut w = Complex::new(1., 0.);

            (0..mdiv2).for_each(|j| {
                let idx_left = j + k;
                let idx_right = idx_left + mdiv2;

                let right = output[idx_right];

                // let t = w * right;
                let t = Complex {
                    re: w.re * right.re - w.im * right.im,
                    im: w.re * right.im + w.im * right.re,
                };
                let u = output[idx_left];

                output[idx_left].re = u.re + t.re;
                output[idx_left].im = u.im + t.im;

                output[idx_right].re = u.re - t.re;
                output[idx_right].im = u.im - t.im;

                // w *= wm;
                w = Complex {
                    re: w.re * wm.re - w.im * wm.im,
                    im: w.re * wm.im + w.im * wm.re,
                };
            })
        })
    })
}
