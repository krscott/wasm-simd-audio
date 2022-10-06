#[cfg(target_arch = "wasm32")]
use crate::fft::{bit_reverse_copy, numbits};
use core::f32::consts::PI;
use rustfft::num_complex::Complex;
use std::arch::wasm32::*;

#[target_feature(enable = "simd128")]
pub fn fft_simd(input: &[Complex<f32>], output: &mut [Complex<f32>]) {
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

        // Check if there are 4 or more steps
        if m * 4 <= n {
            let m2 = m << 1;
            let m3 = m2 + m;

            let wm_re_x4 = f32x4_splat(wm.re);
            let wm_im_x4 = f32x4_splat(wm.im);

            (0..n).step_by(m * 4).for_each(|k| {
                let mut w_re_x4 = f32x4_splat(1.);
                let mut w_im_x4 = f32x4_splat(0.);

                (0..mdiv2).for_each(|j| {
                    let idx_left_0 = k + j;
                    let idx_right_0 = idx_left_0 + mdiv2;

                    let (right_re_x4, right_im_x4) = complex_to_f32x4(
                        &output[idx_right_0],
                        &output[idx_right_0 + m],
                        &output[idx_right_0 + m2],
                        &output[idx_right_0 + m3],
                    );

                    // let t = w * output[k + j + mdiv2];
                    let t_re_x4 = f32x4_sub(
                        f32x4_mul(w_re_x4, right_re_x4),
                        f32x4_mul(w_im_x4, right_im_x4),
                    );
                    let t_im_x4 = f32x4_add(
                        f32x4_mul(w_re_x4, right_im_x4),
                        f32x4_mul(w_im_x4, right_re_x4),
                    );

                    // let u = output[k + j];
                    let (u_re_x4, u_im_x4) = complex_to_f32x4(
                        &output[idx_left_0],
                        &output[idx_left_0 + m],
                        &output[idx_left_0 + m2],
                        &output[idx_left_0 + m3],
                    );

                    // output[k + j] = u + t;
                    // output[k + j + mdiv2] = u - t;
                    let output_left_re_x4 = f32x4_add(u_re_x4, t_re_x4);
                    let output_left_im_x4 = f32x4_add(u_im_x4, t_im_x4);
                    let output_right_re_x4 = f32x4_sub(u_re_x4, t_re_x4);
                    let output_right_im_x4 = f32x4_sub(u_im_x4, t_im_x4);

                    (
                        output[idx_left_0],
                        output[idx_left_0 + m],
                        output[idx_left_0 + m2],
                        output[idx_left_0 + m3],
                    ) = complex_from_f32x4(output_left_re_x4, output_left_im_x4);
                    (
                        output[idx_right_0],
                        output[idx_right_0 + m],
                        output[idx_right_0 + m2],
                        output[idx_right_0 + m3],
                    ) = complex_from_f32x4(output_right_re_x4, output_right_im_x4);

                    // w *= wm;
                    let tmp_w_im =
                        f32x4_add(f32x4_mul(w_re_x4, wm_im_x4), f32x4_mul(w_im_x4, wm_re_x4));
                    w_re_x4 = f32x4_sub(f32x4_mul(w_re_x4, wm_re_x4), f32x4_mul(w_im_x4, wm_im_x4));
                    w_im_x4 = tmp_w_im;
                })
            })
        } else {
            // Only need to do 1 or 2 steps
            (0..n).step_by(m).for_each(|k| {
                let mut w = Complex::new(1., 0.);

                (0..mdiv2).for_each(|j| {
                    let t = w * output[k + j + mdiv2];
                    let u = output[k + j];
                    output[k + j] = u + t;
                    output[k + j + mdiv2] = u - t;
                    w *= wm;
                })
            })
        }
    })
}

fn complex_to_f32x4(
    c0: &Complex<f32>,
    c1: &Complex<f32>,
    c2: &Complex<f32>,
    c3: &Complex<f32>,
) -> (v128, v128) {
    let re_x4 = f32x4(c0.re, c1.re, c2.re, c3.re);
    let im_x4 = f32x4(c0.im, c1.im, c2.im, c3.im);

    (re_x4, im_x4)
}

fn complex_from_f32x4(
    re_x4: v128,
    im_x4: v128,
) -> (Complex<f32>, Complex<f32>, Complex<f32>, Complex<f32>) {
    (
        Complex {
            re: f32x4_extract_lane::<0>(re_x4),
            im: f32x4_extract_lane::<0>(im_x4),
        },
        Complex {
            re: f32x4_extract_lane::<1>(re_x4),
            im: f32x4_extract_lane::<1>(im_x4),
        },
        Complex {
            re: f32x4_extract_lane::<2>(re_x4),
            im: f32x4_extract_lane::<2>(im_x4),
        },
        Complex {
            re: f32x4_extract_lane::<3>(re_x4),
            im: f32x4_extract_lane::<3>(im_x4),
        },
    )
}
