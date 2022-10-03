use rustfft::{num_complex::Complex, num_traits::Zero, FftPlanner};
use wasm_bindgen::prelude::*;
use web_sys::console;

pub fn set_panic_hook() {
    // When the `console_error_panic_hook` feature is enabled, we can call the
    // `set_panic_hook` function at least once during initialization, and then
    // we will get better error messages if our code ever panics.
    //
    // For more details see
    // https://github.com/rustwasm/console_error_panic_hook#readme
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

// Nightly-only for now
// #[global_allocator]
// static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn add(left: i32, right: i32) -> i32 {
    console::log_1(&format!("Hello from WASM: Adding {} + {}", left, right).into());
    left + right
}

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
        set_panic_hook();

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

    pub fn fft(&mut self, input: &[f32], output: &mut [f32]) {
        // Input and output slices must be equal length
        assert_eq!(input.len(), output.len() * 2);

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

        // for (i, c) in self.output_forward_buffer.iter().enumerate() {
        //     output[i] = c.norm().log10();
        // }
    }
}

impl Default for WasmFft {
    fn default() -> Self {
        Self::new()
    }
}
