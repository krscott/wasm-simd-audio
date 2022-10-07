import { useEffect } from "preact/hooks";
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
  callback: (input: Float32Array, output: Float32Array) => void;
  name: string;
  color: string;
  textRow?: number;
  plotOffset?: number;
  plotScale?: number;
  ringBufferSize?: number;
  drawPlot?: boolean;
  drawCalcTime?: boolean;
};

class FftBenchmark {
  buf: NumericRingBuf;
  avg: number | undefined;

  callback: (input: Float32Array, output: Float32Array) => void;
  name: string;
  color: string;
  textRow: number;
  plotOffset: number;
  plotScale: number;

  drawPlot: boolean;
  drawCalcTime: boolean;

  constructor(opts: FftBenchmarkOptions) {
    this.callback = opts.callback;
    this.name = opts.name;
    this.color = opts.color;
    this.textRow = opts.textRow ?? 0;
    this.plotOffset = opts.plotOffset ?? baseOffset;
    this.plotScale = opts.plotScale ?? baseScale;
    this.drawPlot = opts.drawPlot ?? true;
    this.drawCalcTime = opts.drawCalcTime ?? true;

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
    timeArray: Float32Array,
    freqArray: Float32Array,
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ): void {
    if (!this.drawCalcTime && !this.drawPlot) {
      return;
    }

    const perfStart = performance.now();
    this.callback(timeArray, freqArray);
    const perfTime = performance.now() - perfStart;

    this.put(perfTime);

    if (this.drawPlot) {
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

    if (this.drawCalcTime) {
      const fontSize = Math.min(
        Math.max(Math.round(canvas.height / 40), 12),
        64
      );
      ctx.font = `${fontSize}px monospace`;
      ctx.fillStyle = this.color;
      ctx.fillText(
        `${this.name}: ${this.avg?.toFixed(3)} ms`,
        0,
        (1 + this.textRow) * fontSize
      );
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

export const useCanvasFftVis = (
  isUserGesture: boolean,
  audio: HTMLAudioElement | null,
  canvas: HTMLCanvasElement | null
) => {
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

    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 1024;
    analyzer.smoothingTimeConstant = 0.1;

    audioSourceNode.connect(analyzer);
    analyzer.connect(audioContext.destination);

    const timeArray = new Float32Array(analyzer.fftSize);
    const freqArray = new Float32Array(analyzer.frequencyBinCount);

    const ffts = [
      new FftBenchmark({
        callback: (_i, o) => analyzer.getFloatFrequencyData(o),
        name: "native",
        color: "white",
        drawCalcTime: false,
      }),

      new FftBenchmark({
        callback: (i, o) => wasmFft.lib_fft(i, o),
        name: "rslib",
        color: "yellow",
        textRow: 0,
        plotOffset: libfftOffset,
        plotScale: libfftScale,
      }),

      new FftBenchmark({
        callback: (i, o) => wasmFft.cooley_tukey(i, o),
        name: "naive",
        color: "orange",
        textRow: 1,
        plotOffset: myfftOffset,
        plotScale: myfftScale,
      }),

      new FftBenchmark({
        callback: (i, o) => wasmFft.simd_cooley_tukey(i, o),
        name: "simd1",
        color: "pink",
        textRow: 2,
        plotOffset: myfftOffset,
        plotScale: myfftScale,
      }),

      new FftBenchmark({
        callback: (i, o) => wasmFft.simd_cooley_tukey2(i, o),
        name: "simd2",
        color: "lightgreen",
        textRow: 3,
        plotOffset: myfftOffset,
        plotScale: myfftScale,
      }),

      new FftBenchmark({
        callback: (i, o) => wasmFft.simd_cooley_tukey3(i, o),
        name: "simd3",
        color: "cyan",
        textRow: 4,
        plotOffset: myfftOffset,
        plotScale: myfftScale,
      }),
    ];

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

      for (const fft of ffts) {
        fft.exec(timeArray, freqArray, ctx, canvas);
      }
    };

    requestAnimationFrame(animate);

    return () => {
      stopFlag = true;
    };
  }, [isUserGesture, audio, canvas]);
};
