import { FileUpload } from "./components/ui";
import { useState, useRef, useEffect } from "preact/hooks";
import { getAudioContext, getAudioSourceNode } from "./util/audiocontext";

import { WasmFft } from "wasm-audio";
import { NumericRingBuf } from "./util/ringbuf";

class PerfCache {
  buf: NumericRingBuf;
  avg: number | undefined;

  constructor() {
    this.buf = new NumericRingBuf(100);
  }

  put(n: number) {
    this.buf.put(n);
    if (this.buf.isFull()) {
      this.avg = this.buf.average();
      this.buf.clear();
    }
  }
}

export function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const audioSrcRef = useRef<HTMLAudioElement>(null);
  const [audioControlSrc, setAudioControlSrc] = useState<string | undefined>();

  useEffect(() => {
    const canvas = canvasRef.current;
    const audio = audioSrcRef.current;
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

    const libFftPerfMs = new PerfCache();
    const fftPerfMs = new PerfCache();
    const simdFftPerfMs = new PerfCache();

    const baseScale = 3;
    const baseOffset = 0;

    const execFft = (
      callback: (input: Float32Array, output: Float32Array) => void,
      offset = 0,
      scale = 1
    ): number => {
      const perfStart = performance.now();
      callback(timeArray, freqArray);
      const perfTime = performance.now() - perfStart;

      drawFloat32Signal(
        ctx,
        freqArray,
        0,
        baseOffset - offset * baseScale,
        canvas.width / freqArray.length,
        baseScale * scale
      );

      return perfTime;
    };

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

      ctx.font = "12px monospace";

      ctx.strokeStyle = "white";
      execFft((_i, o) => analyzer.getFloatFrequencyData(o));

      // ctx.strokeStyle = ctx.fillStyle = "yellow";
      // libFftPerfMs.put(
      //   execFft((i, o) => wasmFft.lib_fft(i, o), -36.50907, 19.57467)
      // );
      // ctx.fillText(`lib: ${libFftPerfMs.avg?.toFixed(3)} ms`, 0, 10);

      ctx.strokeStyle = ctx.fillStyle = "orange";
      fftPerfMs.put(
        execFft((i, o) => wasmFft.fft(i, o), -36.50907 - 30, 19.57467)
      );
      ctx.fillText(`fft: ${fftPerfMs.avg?.toFixed(3)} ms`, 0, 20);

      ctx.strokeStyle = ctx.fillStyle = "pink";
      simdFftPerfMs.put(
        execFft((i, o) => wasmFft.simd_fft(i, o), -36.50907 - 30, 19.57467)
      );
      ctx.fillText(`fft: ${simdFftPerfMs.avg?.toFixed(3)} ms`, 0, 30);
    };

    requestAnimationFrame(animate);

    return () => {
      stopFlag = true;
    };
  }, [audioSrcRef.current, audioControlSrc, canvasRef.current]);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2">
      <div className="flex items-center gap-4">
        <FileUpload
          onUpload={(file) => setAudioControlSrc(URL.createObjectURL(file))}
        />
        <div>
          <audio ref={audioSrcRef} src={audioControlSrc} controls />
        </div>
      </div>
      <div className="border border-slate-600">
        <canvas ref={canvasRef} height={400} width={700} />
      </div>
    </div>
  );
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
