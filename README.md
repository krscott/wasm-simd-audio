# wasm-simd-audio

An exporation in FFT implementation using Rust+WASM+SIMD.

## Development
To start:
```
npm run dev
```

### Setup Tips
**vscode**: in the workspace `settings.json`, set the target to wasm32:
```
  "rust-analyzer.cargo.target": "wasm32-unknown-unknown"
```

**wasm-opt issue**: If you get an error about wasm not being optimized, then install
latest version of [binaryen](https://github.com/WebAssembly/binaryen) in your `PATH` var.
- more info: https://github.com/rustwasm/wasm-pack/issues/1109
- [ ] TODO: Figure out how to get this working in CI.