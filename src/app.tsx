import { FileUpload } from "./components/ui";
import { useState, useRef } from "preact/hooks";

import { useCanvasFftVis } from "./canvas-hook";

export function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const audioSrcRef = useRef<HTMLAudioElement>(null);
  const [audioFileUrl, setAudioFileUrl] = useState<string | undefined>();

  useCanvasFftVis(audioSrcRef.current, canvasRef.current);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2">
      <div className="flex items-center gap-4">
        <FileUpload
          onUpload={(file) => setAudioFileUrl(URL.createObjectURL(file))}
        />
        <div>
          <audio ref={audioSrcRef} src={audioFileUrl} controls />
        </div>
      </div>
      <div className="border border-slate-600">
        <canvas ref={canvasRef} height={400} width={700} />
      </div>
    </div>
  );
}
