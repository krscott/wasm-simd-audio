import { SoundGenMenu } from "./components/soundgen";
import { FileUpload } from "./components/ui";
import { useState, useRef, useEffect, Ref, useMemo } from "preact/hooks";

export function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const audioSrcRef = useRef<HTMLAudioElement>(null);
  const [audioControlSrc, setAudioControlSrc] = useState<string | undefined>();

  useEffect(() => {
    const canvas = canvasRef.current;
    const audio = audioSrcRef.current;

    if (!audio || !audioControlSrc || !canvas) return;

    console.log(`load ${audioControlSrc}`);

    // audio.load();
    audio.play();

    const audioContext = new AudioContext();

    const analyzer = audioContext.createAnalyser();
    // analyzer.fftSize = 64;
    analyzer.smoothingTimeConstant = 0.2;
    analyzer.maxDecibels = -24;
    analyzer.minDecibels = -130;

    const audioSource = audioContext.createMediaElementSource(audio);
    audioSource.connect(audioContext.destination);
    audioSource.connect(analyzer);

    const freqArray = new Uint8Array(analyzer.frequencyBinCount);
    const timeArray = new Uint8Array(analyzer.fftSize);

    const ctx = canvas.getContext("2d")!;

    let stopFlag = false;

    const freqDatumWidth = canvas.width / freqArray.length;
    const timeDatumWidth = canvas.width / timeArray.length;
    const yscale = canvas.height / 256;

    // Animation Loop
    const animate = () => {
      if (stopFlag) return;

      requestAnimationFrame(animate);

      analyzer.getByteFrequencyData(freqArray);
      analyzer.getByteTimeDomainData(timeArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "lightskyblue";
      drawSignal(ctx, timeArray, 0, canvas.height, timeDatumWidth, yscale);

      ctx.strokeStyle = "white";
      drawSignal(ctx, freqArray, 0, canvas.height, freqDatumWidth, yscale);
    };

    requestAnimationFrame(animate);

    return () => {
      stopFlag = true;
      audioSource.disconnect();
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

const drawSignal = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
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
