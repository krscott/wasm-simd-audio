import { FileUpload } from "./components/ui";
import { useState, useRef, useLayoutEffect } from "preact/hooks";

import { useCanvasFftVis } from "./canvas-hook";

export function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(700);
  const [canvasHeight, setCanvasHeight] = useState(400);

  const audioSrcRef = useRef<HTMLAudioElement>(null);
  const [audioFileUrl, setAudioFileUrl] = useState<string | undefined>();

  useCanvasFftVis(!!audioFileUrl, audioSrcRef.current, canvasRef.current);

  useLayoutEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    setCanvasWidth(canvasRef.current?.offsetWidth);
    setCanvasHeight(canvasRef.current?.offsetHeight);
  }, []);

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
      <div className="w-full grow border border-slate-600">
        <canvas
          ref={canvasRef}
          className="h-full w-full"
          height={canvasHeight}
          width={canvasWidth}
        />
      </div>
    </div>
  );
}
