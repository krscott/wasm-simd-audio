#[cfg(target_arch = "wasm32")]
use crate::fft::{bit_reverse_copy, numbits};
use core::f32::consts::PI;
use rustfft::num_complex::Complex;

#[target_feature(enable = "simd128")]
pub fn fft_simd(input: &[Complex<f32>], output: &mut [Complex<f32>]) {
    use std::arch::wasm32::*;

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

        let wm_re_x4 = f32x4_splat(wm.re);
        let wm_im_x4 = f32x4_splat(wm.im);

        let m2 = m << 1;
        let m3 = m2 + m;

        let mut k = 0;
        loop {
            let next_k = k + m * 4;
            if next_k >= n {
                break;
            }

            // SIMD section
            {
                let mut w_re_x4 = f32x4_splat(1.);
                let mut w_im_x4 = f32x4_splat(0.);

                (0..mdiv2).for_each(|j| {
                    let idx_left_0 = k + j;
                    let idx_right_0 = idx_left_0 + mdiv2;

                    let right_re_x4 = f32x4(
                        output[idx_right_0].re,
                        output[idx_right_0 + m].re,
                        output[idx_right_0 + m2].re,
                        output[idx_right_0 + m3].re,
                    );
                    let right_im_x4 = f32x4(
                        output[idx_right_0].im,
                        output[idx_right_0 + m].im,
                        output[idx_right_0 + m2].im,
                        output[idx_right_0 + m3].im,
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
                    let u_re_x4 = f32x4(
                        output[idx_left_0].re,
                        output[idx_left_0 + m].re,
                        output[idx_left_0 + m2].re,
                        output[idx_left_0 + m3].re,
                    );
                    let u_im_x4 = f32x4(
                        output[idx_left_0].im,
                        output[idx_left_0 + m].im,
                        output[idx_left_0 + m2].im,
                        output[idx_left_0 + m3].im,
                    );

                    // output[k + j] = u + t;
                    // output[k + j + mdiv2] = u - t;
                    let output_left_re = f32x4_add(u_re_x4, t_re_x4);
                    let output_left_im = f32x4_add(u_im_x4, t_im_x4);
                    let output_right_re = f32x4_sub(u_re_x4, t_re_x4);
                    let output_right_im = f32x4_sub(u_im_x4, t_im_x4);

                    output[idx_left_0].re = f32x4_extract_lane::<0>(output_left_re);
                    output[idx_left_0 + m].re = f32x4_extract_lane::<1>(output_left_re);
                    output[idx_left_0 + m2].re = f32x4_extract_lane::<2>(output_left_re);
                    output[idx_left_0 + m3].re = f32x4_extract_lane::<3>(output_left_re);
                    output[idx_left_0].im = f32x4_extract_lane::<0>(output_left_im);
                    output[idx_left_0 + m].im = f32x4_extract_lane::<1>(output_left_im);
                    output[idx_left_0 + m2].im = f32x4_extract_lane::<2>(output_left_im);
                    output[idx_left_0 + m3].im = f32x4_extract_lane::<3>(output_left_im);

                    output[idx_right_0].re = f32x4_extract_lane::<0>(output_right_re);
                    output[idx_right_0 + m].re = f32x4_extract_lane::<1>(output_right_re);
                    output[idx_right_0 + m2].re = f32x4_extract_lane::<2>(output_right_re);
                    output[idx_right_0 + m3].re = f32x4_extract_lane::<3>(output_right_re);
                    output[idx_right_0].im = f32x4_extract_lane::<0>(output_right_im);
                    output[idx_right_0 + m].im = f32x4_extract_lane::<1>(output_right_im);
                    output[idx_right_0 + m2].im = f32x4_extract_lane::<2>(output_right_im);
                    output[idx_right_0 + m3].im = f32x4_extract_lane::<3>(output_right_im);

                    // w *= wm;
                    let tmp_w_im =
                        f32x4_add(f32x4_mul(w_re_x4, wm_im_x4), f32x4_mul(w_im_x4, wm_re_x4));
                    w_re_x4 = f32x4_sub(f32x4_mul(w_re_x4, wm_re_x4), f32x4_mul(w_im_x4, wm_im_x4));
                    w_im_x4 = tmp_w_im;
                })
            }

            k = next_k;
        }

        // Do the rest of the loop normally
        (k..n).step_by(m).for_each(|k| {
            let mut w = Complex::new(1., 0.);

            (0..mdiv2).for_each(|j| {
                let t = w * output[k + j + mdiv2];
                let u = output[k + j];
                output[k + j] = u + t;
                output[k + j + mdiv2] = u - t;
                w *= wm;
            })
        })
    })
}
