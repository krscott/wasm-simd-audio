use rustfft::{num_complex::Complex, num_traits::Zero, FftPlanner};
use wasm_bindgen::prelude::*;

use crate::{cooley_tukey::cooley_tukey_fft, dft::dft};

#[wasm_bindgen]
pub struct WasmFft {
    planner: FftPlanner<f32>,
    input_buffer: Vec<Complex<f32>>,
    output_buffer: Vec<Complex<f32>>,
    scratch_buffer: Vec<Complex<f32>>,
}

#[wasm_bindgen]
impl WasmFft {
    pub fn new() -> Self {
        Self::with_capcity(2048)
    }

    pub fn with_capcity(capacity: usize) -> Self {
        crate::set_panic_hook();
        assert!(crate::is_power_of_2(capacity));

        let mut planner = FftPlanner::new();
        let input_buffer = vec![Complex::zero(); capacity];
        let output_buffer = vec![Complex::zero(); capacity];

        let fft = planner.plan_fft_forward(capacity);
        let scratch_buffer = vec![Complex::zero(); fft.get_outofplace_scratch_len()];

        Self {
            planner,
            input_buffer,
            output_buffer,
            scratch_buffer,
        }
    }

    pub fn lib_fft(&mut self, input: &[f32], output: &mut [f32]) {
        assert_eq!(input.len(), output.len() * 2);
        assert!(crate::is_power_of_2(input.len()));

        self.input_buffer.resize(input.len(), Complex::zero());
        self.output_buffer.resize(input.len(), Complex::zero());

        for (i, &r) in input.iter().enumerate() {
            self.input_buffer[i].re = r;
        }

        {
            // If len does not change, rustfft will re-use buffer from previous call
            let fft = self.planner.plan_fft_forward(self.input_buffer.len());

            self.scratch_buffer
                .resize(fft.get_outofplace_scratch_len(), Complex::zero());

            fft.process_outofplace_with_scratch(
                &mut self.input_buffer,
                &mut self.output_buffer,
                &mut self.scratch_buffer,
            );
        }

        let normalize = 1.0 / (self.output_buffer.len() as f32).sqrt();
        (0..output.len()).for_each(|i| {
            output[i] = (self.output_buffer[i].norm() * normalize).log10();
        });
    }

    pub fn dft(&mut self, input: &[f32], output: &mut [f32]) {
        assert_eq!(input.len(), output.len() * 2);
        assert!(crate::is_power_of_2(input.len()));

        self.input_buffer.resize(input.len(), Complex::zero());
        self.output_buffer.resize(input.len(), Complex::zero());

        for (i, &r) in input.iter().enumerate() {
            self.input_buffer[i].re = r;
        }

        dft(&self.input_buffer, &mut self.output_buffer);

        (0..output.len()).for_each(|i| {
            output[i] = (self.output_buffer[i].norm()).log10();
        });
    }

    pub fn cooley_tukey(&mut self, input: &[f32], output: &mut [f32]) {
        assert_eq!(input.len(), output.len() * 2);
        assert!(crate::is_power_of_2(input.len()));

        self.input_buffer.resize(input.len(), Complex::zero());
        self.output_buffer.resize(input.len(), Complex::zero());

        for (i, &r) in input.iter().enumerate() {
            self.input_buffer[i].re = r;
        }

        cooley_tukey_fft(&self.input_buffer, &mut self.output_buffer);

        (0..output.len()).for_each(|i| {
            output[i] = (self.output_buffer[i].norm()).log10();
        });
    }

    #[cfg(target_arch = "wasm32")]
    pub fn simd_cooley_tukey(&mut self, input: &[f32], output: &mut [f32]) {
        assert_eq!(input.len(), output.len() * 2);
        assert!(crate::is_power_of_2(input.len()));

        self.input_buffer.resize(input.len(), Complex::zero());
        self.output_buffer.resize(input.len(), Complex::zero());

        for (i, &r) in input.iter().enumerate() {
            self.input_buffer[i].re = r;
        }

        crate::simd_cooley_tukey::simd_cooley_tukey_fft(
            &self.input_buffer,
            &mut self.output_buffer,
        );

        (0..output.len()).for_each(|i| {
            output[i] = (self.output_buffer[i].norm()).log10();
        });
    }

    #[cfg(target_arch = "wasm32")]
    pub fn simd_cooley_tukey2(&mut self, input: &[f32], output: &mut [f32]) {
        assert_eq!(input.len(), output.len() * 2);
        assert!(crate::is_power_of_2(input.len()));

        self.input_buffer.resize(input.len(), Complex::zero());
        self.output_buffer.resize(input.len(), Complex::zero());

        for (i, &r) in input.iter().enumerate() {
            self.input_buffer[i].re = r;
        }

        crate::simd_cooley_tukey2::simd_cooley_tukey_fft2(
            &self.input_buffer,
            &mut self.output_buffer,
        );

        (0..output.len()).for_each(|i| {
            output[i] = (self.output_buffer[i].norm()).log10();
        });
    }

    #[cfg(target_arch = "wasm32")]
    pub fn simd_cooley_tukey3(&mut self, input: &[f32], output: &mut [f32]) {
        assert_eq!(input.len(), output.len() * 2);
        assert!(crate::is_power_of_2(input.len()));

        self.input_buffer.resize(input.len(), Complex::zero());
        self.output_buffer.resize(input.len(), Complex::zero());

        for (i, &r) in input.iter().enumerate() {
            self.input_buffer[i].re = r;
        }

        crate::simd_cooley_tukey3::simd_cooley_tukey_fft3(
            &self.input_buffer,
            &mut self.output_buffer,
        );

        (0..output.len()).for_each(|i| {
            output[i] = (self.output_buffer[i].norm()).log10();
        });
    }
}

impl Default for WasmFft {
    fn default() -> Self {
        Self::new()
    }
}
