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

    const audioSource = audioContext.createMediaElementSource(audio);
    audioSource.connect(audioContext.destination);
    audioSource.connect(analyzer);

    const dataArray = new Uint8Array(analyzer.frequencyBinCount);
    // const dataArray = new Float32Array(analyzer.frequencyBinCount);

    const ctx = canvas.getContext("2d")!;

    // const renderId = Math.random();

    let stopFlag = false;

    const dataWidth = canvas.width / dataArray.length;

    const animate = () => {
      if (stopFlag) return;

      // console.log(`tick ${renderId}`);

      requestAnimationFrame(animate);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      analyzer.getByteFrequencyData(dataArray);
      // analyzer.getFloatFrequencyData(dataArray);

      // console.log(dataArray);

      ctx.strokeStyle = "white";
      ctx.beginPath();

      for (let i = 0, len = dataArray.length; i < len; ++i) {
        const dataHeight = 1 + dataArray[i];

        const x = i * dataWidth;
        const y = canvas.height - dataHeight;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        // ctx.fillStyle = "white";
        // ctx.fillRect(x, y, dataWidth - 2, dataHeight);
      }

      ctx.stroke();
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
