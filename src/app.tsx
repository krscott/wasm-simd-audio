import { SoundGenMenu } from "./components/soundgen";
import { FileUpload } from "./components/ui";
import { useState, useRef, Ref } from "preact/hooks";

// const audioContext = new AudioContext();

export function App() {
  const audioSrcRef = useRef<HTMLAudioElement>(null);
  const [audioSrc, setAudioSrc] = useState<string | undefined>();

  const onUpload = (file: File) => {
    setAudioSrc(URL.createObjectURL(file));
    audioSrcRef.current?.load();
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2">
      <h1 className="text-3xl font-bold">AudioVis</h1>
      <div>
        <FileUpload onUpload={onUpload} />
      </div>
      <audio ref={audioSrcRef} src={audioSrc} controls />
      {/* <SoundGenMenu /> */}
    </div>
  );
}
