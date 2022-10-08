import { useEffect, useState } from "preact/hooks";
import { WasmFft } from "wasm-audio";
import { getAudioContext, getAudioSourceNode } from "./util/audiocontext";
import { NumericRingBuf } from "./util/ringbuf";

const baseOffset = 0;
const baseScale = 4;

// Scale and offset to make plots match browser FFT.
// These values were determined emperically.
const libfftOffset = baseOffset + 36.50907 * baseScale;
const libfftScale = 19.57467 * baseScale;
const myfftOffset = libfftOffset + 29.6 * baseScale;
const myfftScale = libfftScale;

type FftBenchmarkOptions = {
  callback: (
    analyzer: AnalyserNode,
    input: Float32Array,
    output: Float32Array
  ) => void;
  name: string;
  color: string;
  plotOffset?: number;
  plotScale?: number;
  ringBufferSize?: number;
  plotEnabled?: boolean;
  labelEnabled?: boolean;
  enabled?: boolean;
};

class FftBenchmark {
  buf: NumericRingBuf;
  avg: number | undefined;

  callback: (
    analyzer: AnalyserNode,
    input: Float32Array,
    output: Float32Array
  ) => void;
  name: string;
  color: string;
  plotOffset: number;
  plotScale: number;

  plotEnabled: boolean;
  labelEnabled: boolean;
  enabled: boolean;

  constructor(opts: FftBenchmarkOptions) {
    this.callback = opts.callback;
    this.name = opts.name;
    this.color = opts.color;
    this.plotOffset = opts.plotOffset ?? baseOffset;
    this.plotScale = opts.plotScale ?? baseScale;
    this.plotEnabled = opts.plotEnabled ?? true;
    this.labelEnabled = opts.labelEnabled ?? true;
    this.enabled = opts.enabled ?? true;

    const size = opts.ringBufferSize ?? 100;
    this.buf = new NumericRingBuf(size);
  }

  put(n: number) {
    this.buf.put(n);
    if (this.buf.isFull()) {
      this.avg = this.buf.average();
      this.buf.clear();
    }
  }

  exec(
    labelRow: number,
    analyzer: AnalyserNode,
    timeArray: Float32Array,
    freqArray: Float32Array,
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ): void {
    const perfStart = performance.now();
    this.callback(analyzer, timeArray, freqArray);
    const perfTime = performance.now() - perfStart;
    this.put(perfTime);

    if (this.plotEnabled) {
      ctx.strokeStyle = this.color;
      drawFloat32Signal(
        ctx,
        freqArray,
        0,
        this.plotOffset * (canvas.height / 400.0),
        canvas.width / freqArray.length,
        this.plotScale * (canvas.height / 400.0)
      );
    }

    if (this.labelEnabled) {
      const fontSize = Math.min(
        Math.max(Math.round(canvas.height / 40), 12),
        64
      );
      ctx.font = `${fontSize}px monospace`;
      ctx.fillStyle = this.color;

      const avg = this.avg ? this.avg.toFixed(3) : "...";
      ctx.fillText(`${this.name}: ${avg} ms`, 0, (1 + labelRow) * fontSize);
    }
  }
}

const drawFloat32Signal = (
  ctx: CanvasRenderingContext2D,
  data: Float32Array,
  x0: number,
  y0: number,
  xscale: number,
  yscale: number
) => {
  ctx.beginPath();

  for (let i = 0, len = data.length; i < len; ++i) {
    const x = x0 + i * xscale;
    const y = y0 - data[i] * yscale;

    if (i === 0) {
      // console.log(x, y);
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.stroke();
};

type CanvasFftUiState = {
  channels: {
    name: string;
    color: string;
    enabled: boolean;
    setEnabled: (state: boolean) => void;
  }[];
};

export const useCanvasFftVis = (
  isUserGesture: boolean,
  audio: HTMLAudioElement | null,
  canvas: HTMLCanvasElement | null
) => {
  const [uiState, setUiState] = useState<CanvasFftUiState>({
    channels: [],
  });

  useEffect(() => {
    // getAudioContext will fail forever if called without a gesture
    if (!isUserGesture) return;

    const ctx = canvas?.getContext("2d");
    if (!audio || !canvas || !ctx) return;

    const audioContext = getAudioContext();
    const audioSourceNode = getAudioSourceNode(audio);
    if (!audioContext || !audioSourceNode) return;

    let stopFlag = false;

    const wasmFft = WasmFft.new();
    console.log("tests:", wasmFft.test());

    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 1024;
    analyzer.smoothingTimeConstant = 0.1;

    audioSourceNode.connect(analyzer);
    analyzer.connect(audioContext.destination);

    const timeArray = new Float32Array(analyzer.fftSize);
    const freqArray = new Float32Array(analyzer.frequencyBinCount);

    const ffts = [
      new FftBenchmark({
        callback: (analyzer, _i, o) => analyzer.getFloatFrequencyData(o),
        name: "browser",
        color: "white",
        labelEnabled: false,
      }),

      new FftBenchmark({
        callback: (analyzer, i, o) => wasmFft.dft(i, o),
        name: "dft  ",
        color: "red",
        plotOffset: myfftOffset,
        plotScale: myfftScale,
        enabled: false,
      }),

      new FftBenchmark({
        callback: (analyzer, i, o) => wasmFft.lib_fft(i, o),
        name: "lib  ",
        color: "yellow",
        plotOffset: libfftOffset,
        plotScale: libfftScale,
      }),

      new FftBenchmark({
        callback: (analyzer, i, o) => wasmFft.cooley_tukey(i, o),
        name: "naive",
        color: "orange",
        plotOffset: myfftOffset,
        plotScale: myfftScale,
      }),

      new FftBenchmark({
        callback: (analyzer, i, o) => wasmFft.simd_cooley_tukey(i, o),
        name: "simd1",
        color: "pink",
        plotOffset: myfftOffset,
        plotScale: myfftScale,
        enabled: false,
      }),

      new FftBenchmark({
        callback: (analyzer, i, o) => wasmFft.simd_cooley_tukey2(i, o),
        name: "simd2",
        color: "lightgreen",
        plotOffset: myfftOffset,
        plotScale: myfftScale,
      }),

      new FftBenchmark({
        callback: (analyzer, i, o) => wasmFft.simd_cooley_tukey3(i, o),
        name: "simd3",
        color: "cyan",
        plotOffset: myfftOffset,
        plotScale: myfftScale,
        enabled: false,
      }),
    ];

    const refreshUiState = () => {
      return setUiState({
        channels: ffts.map((fft) => {
          fft.buf.clear();

          return {
            name: fft.name,
            color: fft.color,
            enabled: fft.enabled,
            setEnabled: (state) => {
              fft.enabled = state;
              refreshUiState();
            },
          };
        }),
      });
    };

    refreshUiState();

    // Animation Loop
    const animate = () => {
      if (stopFlag) {
        audioSourceNode.disconnect();
        wasmFft.free();
        return;
      }

      requestAnimationFrame(animate);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // analyzer.getByteFrequencyData(freqArray);
      // analyzer.getByteTimeDomainData(timeArray);

      // analyzer.getFloatFrequencyData(freqFloatArray);

      // analyzer.getFloatFrequencyData(wasmFreqArray);
      analyzer.getFloatTimeDomainData(timeArray);

      ctx.strokeStyle = "lightskyblue";
      drawFloat32Signal(
        ctx,
        timeArray,
        0,
        canvas.height * 0.5,
        canvas.width / timeArray.length,
        canvas.height * 0.5
      );

      let labelRow = 0;
      for (const fft of ffts) {
        if (fft.enabled) {
          fft.exec(labelRow, analyzer, timeArray, freqArray, ctx, canvas);

          if (fft.enabled && fft.labelEnabled) {
            labelRow += 1;
          }
        }
      }
    };

    requestAnimationFrame(animate);

    return () => {
      stopFlag = true;
    };
  }, [isUserGesture, audio, canvas]);

  return uiState;
};
