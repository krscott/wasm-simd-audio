import { useEffect } from "preact/hooks";
import { WasmFft } from "wasm-audio";
import { getAudioContext, getAudioSourceNode } from "./util/audiocontext";
import { NumericRingBuf } from "./util/ringbuf";

const baseOffset = 0;
const baseScale = 3;

const libfftOffset = baseOffset + 36.50907 * baseScale;
const libfftScale = 19.57467 * baseScale;

const myfftOffset = libfftOffset + 29.6 * baseScale;
const myfftScale = libfftScale;

type FftBenchmarkOptions = {
  callback: (input: Float32Array, output: Float32Array) => void;
  name: string;
  color: string;
  textY?: number;
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
  textY: number;
  plotOffset: number;
  plotScale: number;

  drawPlot: boolean;
  drawCalcTime: boolean;

  constructor(opts: FftBenchmarkOptions) {
    this.callback = opts.callback;
    this.name = opts.name;
    this.color = opts.color;
    this.textY = opts.textY ?? 10;
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
        this.plotOffset,
        canvas.width / freqArray.length,
        this.plotScale
      );
    }

    if (this.drawCalcTime) {
      ctx.font = "12px monospace";
      ctx.fillStyle = this.color;
      ctx.fillText(`${this.name}: ${this.avg?.toFixed(3)} ms`, 0, this.textY);
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
  audio: HTMLAudioElement | null,
  audioControlSrc: string | undefined,
  canvas: HTMLCanvasElement | null
) => {
  useEffect(() => {
    const ctx = canvas?.getContext("2d");
    if (!audio || !audioControlSrc || !canvas || !ctx) return;

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
        textY: 10,
        plotOffset: libfftOffset,
        plotScale: libfftScale,
      }),

      new FftBenchmark({
        callback: (i, o) => wasmFft.cooley_tukey(i, o),
        name: "naive",
        color: "orange",
        textY: 20,
        plotOffset: myfftOffset,
        plotScale: myfftScale,
      }),

      new FftBenchmark({
        callback: (i, o) => wasmFft.simd_cooley_tukey(i, o),
        name: "simd1",
        color: "pink",
        textY: 30,
        plotOffset: myfftOffset,
        plotScale: myfftScale,
      }),

      new FftBenchmark({
        callback: (i, o) => wasmFft.simd_cooley_tukey2(i, o),
        name: "simd2",
        color: "lightgreen",
        textY: 40,
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
  }, [audio, audioControlSrc, canvas]);
};
