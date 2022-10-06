use core::f32::consts::PI;
use rustfft::num_complex::Complex;

const NTWO_PI_I: Complex<f32> = Complex {
    re: 0.,
    im: -2.0 * PI,
};

pub fn cooley_tukey_fft(input: &[Complex<f32>], output: &mut [Complex<f32>]) {
    assert_eq!(input.len(), output.len());
    assert!(crate::is_power_of_2(input.len()));

    let n = input.len();

    bit_reverse_copy(input, output);

    // let n = output.len();
    let n_log2 = numbits(n) - 1;

    (1..=n_log2).for_each(|s| {
        let m: usize = 1 << s;
        let mdiv2 = m >> 1;
        let wm = Complex::exp(NTWO_PI_I / m as f32);

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
    })
}

pub fn bit_reverse_copy<T: Copy>(input: &[T], output: &mut [T]) {
    assert_eq!(input.len(), output.len());
    assert!(crate::is_power_of_2(input.len()));

    let bits = numbits(input.len() - 1);

    for (k, &x) in input.iter().enumerate() {
        output[bitrev(k, bits)] = x;
    }
}

#[test]
fn test_bit_reverse_copy() {
    let a = vec![0, 1, 2, 3, 4, 5, 6, 7];
    let mut b = vec![0; a.len()];
    bit_reverse_copy(&a, &mut b);
    assert_eq!(b, vec![0, 4, 2, 6, 1, 5, 3, 7]);
}

pub fn numbits(mut x: usize) -> usize {
    let mut bits = 0;
    while x > 0 {
        bits += 1;
        x >>= 1;
    }
    bits
}

#[test]
fn test_getbits() {
    assert_eq!(numbits(0), 0);
    assert_eq!(numbits(1), 1);
    assert_eq!(numbits(0b10), 2);
    assert_eq!(numbits(0b11), 2);
    assert_eq!(numbits(0b100), 3);
    assert_eq!(numbits(0b101), 3);
    assert_eq!(numbits(0b110), 3);
    assert_eq!(numbits(0b111), 3);
    assert_eq!(numbits(0b1000), 4);
    assert_eq!(numbits(0b1111), 4);
    assert_eq!(numbits(0b10000000), 8);
    assert_eq!(numbits(0b10101010), 8);
    assert_eq!(numbits(0b1000000000000000), 16);
    assert_eq!(numbits(0b1010101010101010), 16);
}

fn bitrev(x: usize, bits: usize) -> usize {
    let mut out = 0;

    (0..bits).for_each(|i| {
        out |= ((x >> i) & 1) << (bits - i - 1);
    });

    out
}

#[test]
fn test_bitrev() {
    assert_eq!(bitrev(0, 3), 0);
    assert_eq!(bitrev(0b001, 3), 0b100);
    assert_eq!(bitrev(0b100, 3), 0b001);
    assert_eq!(bitrev(0b1010, 4), 0b0101);
    assert_eq!(bitrev(0b0101, 4), 0b1010);
    assert_eq!(bitrev(0b101000, 6), 0b000101);
    assert_eq!(bitrev(0b000101, 6), 0b101000);
    assert_eq!(bitrev(0b11001100, 8), 0b00110011);
    assert_eq!(bitrev(0b11111001100, 8), 0b00110011);
}
