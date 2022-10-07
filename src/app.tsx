import { FileUpload } from "./components/ui";
import { useState, useRef } from "preact/hooks";

import { useCanvasFftVis } from "./canvas-hook";
import { useElementRect } from "./util/resizeobserver";

export function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const audioSrcRef = useRef<HTMLAudioElement>(null);
  const [audioFileUrl, setAudioFileUrl] = useState<string | undefined>();

  useCanvasFftVis(!!audioFileUrl, audioSrcRef.current, canvasRef.current);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRect = useElementRect(canvasContainerRef.current);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-5 p-5">
      <div className="flex items-center gap-4">
        <FileUpload
          onUpload={(file) => setAudioFileUrl(URL.createObjectURL(file))}
        />
        <div>
          <audio ref={audioSrcRef} src={audioFileUrl} controls />
        </div>
      </div>
      <div
        ref={canvasContainerRef}
        className="w-full grow overflow-hidden border border-slate-600"
      >
        <canvas
          ref={canvasRef}
          height={canvasRect.height}
          width={canvasRect.width}
        />
      </div>
    </div>
  );
}
