import { Checkbox, FileUpload } from "./components/ui";
import { useState, useRef } from "preact/hooks";

import { useCanvasFftVis } from "./canvas-hook";
import { useElementRect } from "./util/resizeobserver";

export function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const audioSrcRef = useRef<HTMLAudioElement>(null);
  const [audioFileUrl, setAudioFileUrl] = useState<string | undefined>();

  const ui = useCanvasFftVis(
    !!audioFileUrl,
    audioSrcRef.current,
    canvasRef.current
  );
  console.log(ui.channels);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRect = useElementRect(canvasContainerRef.current);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-5 p-5">
      <div className="flex flex-wrap items-center justify-center gap-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <FileUpload
              onUpload={(file) => setAudioFileUrl(URL.createObjectURL(file))}
            />
          </div>
          <div>
            <audio ref={audioSrcRef} src={audioFileUrl} controls />
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {ui.channels.map((ch) => (
            <Checkbox
              name={ch.name}
              checked={ch.enabled}
              onChange={() => ch.setEnabled(!ch.enabled)}
              color={ch.color}
            />
          ))}
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
