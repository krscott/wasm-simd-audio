import { FileUpload } from "./components/ui";
import { useState, useRef, useEffect } from "preact/hooks";
import { getAudioContext, getAudioSourceNode } from "./util/audiocontext";

import { WasmFft } from "wasm-audio";
// import { WasmAnalyzerWorkletNode } from "./util/fft-node";

// Difference from native browser analyzer node
const wasmFftGain = 19.57467;
const wasmFftOffset = -36.50907;

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

    // console.log(`load ${audioControlSrc}`);

    let stopFlag = false;

    // audio.load();
    // audio.play();

    const wasmFft = WasmFft.new();

    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 1024;
    analyzer.smoothingTimeConstant = 0.1;
    // analyzer.maxDecibels = -14;
    // analyzer.minDecibels = -130;

    audioSourceNode.connect(analyzer);
    analyzer.connect(audioContext.destination);

    const freqFloatArray = new Float32Array(analyzer.frequencyBinCount);
    // const freqArray = new Uint8Array(analyzer.frequencyBinCount);
    // const timeArray = new Uint8Array(analyzer.fftSize);

    const wasmTimeArray = new Float32Array(analyzer.fftSize);
    const wasmFreqArray = new Float32Array(analyzer.frequencyBinCount);

    const fyscale = 3;
    const fy0 = 0;

    // Animation Loop
    const animate = () => {
      if (stopFlag) {
        audioSourceNode.disconnect();
        wasmFft.free();
        return;
      }

      requestAnimationFrame(animate);

      // analyzer.getByteFrequencyData(freqArray);
      // analyzer.getByteTimeDomainData(timeArray);

      analyzer.getFloatFrequencyData(freqFloatArray);

      // analyzer.getFloatFrequencyData(wasmFreqArray);
      analyzer.getFloatTimeDomainData(wasmTimeArray);
      wasmFft.fft(wasmTimeArray, wasmFreqArray);

      // console.log(
      //   Math.max(...wasmFreqArray),
      //   Math.max(...freqFloatArray),
      //   wasmFftGain * Math.max(...wasmFreqArray) + wasmFftOffset
      // );

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ctx.strokeStyle = "lightskyblue";
      // drawUint8Signal(
      //   ctx,
      //   timeArray,
      //   0,
      //   canvas.height,
      //   timeDatumWidth,
      //   canvas.height / 256
      // );

      ctx.strokeStyle = "lightskyblue";
      drawFloat32Signal(
        ctx,
        wasmTimeArray,
        0,
        canvas.height * 0.5,
        canvas.width / wasmTimeArray.length,
        canvas.height * 0.5
      );

      ctx.strokeStyle = "white";
      drawFloat32Signal(
        ctx,
        freqFloatArray,
        0,
        fy0,
        canvas.width / freqFloatArray.length,
        fyscale
      );

      ctx.strokeStyle = "orange";
      drawWasmFloat32Signal2(
        ctx,
        wasmFreqArray,
        0,
        fy0,
        canvas.width / wasmFreqArray.length,
        fyscale
      );
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

// const drawUint8Signal = (
//   ctx: CanvasRenderingContext2D,
//   data: Uint8Array,
//   x0: number,
//   y0: number,
//   xscale: number,
//   yscale: number
// ) => {
//   ctx.beginPath();

//   for (let i = 0, len = data.length; i < len; ++i) {
//     const x = x0 + i * xscale;
//     const y = y0 - data[i] * yscale;

//     if (i === 0) {
//       ctx.moveTo(x, y);
//     } else {
//       ctx.lineTo(x, y);
//     }
//   }

//   ctx.stroke();
// };

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
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.stroke();
};

const drawWasmFloat32Signal2 = (
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
    const y = y0 - (data[i] * wasmFftGain + wasmFftOffset) * yscale;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.stroke();
};
