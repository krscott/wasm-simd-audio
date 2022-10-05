mod dft;
mod fft;
mod simdfft;
mod wasmfft;

// use wasm_bindgen::prelude::*;

pub use wasmfft::*;

pub(crate) fn set_panic_hook() {
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

pub(crate) fn is_power_of_2(mut n: usize) -> bool {
    while n > 1 {
        n >>= 1;
        if n == 1 {
            return true;
        }
    }
    false
}
