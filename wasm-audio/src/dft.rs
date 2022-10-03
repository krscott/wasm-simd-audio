use core::f32::consts::PI;
use rustfft::num_complex::Complex;

pub fn dft(input: &[Complex<f32>], output: &mut [Complex<f32>]) {
    dft_helper(input, output, false);
}

#[allow(dead_code)]
pub fn idft(input: &[Complex<f32>], output: &mut [Complex<f32>]) {
    dft_helper(input, output, true);
}

fn dft_helper(input: &[Complex<f32>], output: &mut [Complex<f32>], inverse: bool) {
    assert_eq!(input.len(), output.len());

    let n = input.len();

    let wn = 2.0 * PI / n as f32 * if inverse { -1. } else { 1. };

    (0..n).into_iter().for_each(|i| {
        let mut y = &mut output[i];
        y.re = 0.;
        y.im = 0.;

        let wk = i as f32 * wn;

        (0..n).into_iter().for_each(|j| {
            let x = &input[j];
            let c = f32::cos(j as f32 * wk);
            let s = f32::sin(j as f32 * wk);

            y.re += x.re * c + x.im * s;
            y.im += -x.re * s + x.im * c;
        });

        if inverse {
            y.re /= n as f32;
            y.im /= n as f32;
        }
    })
}
