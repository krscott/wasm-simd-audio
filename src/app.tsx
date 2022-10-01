import { SoundGenMenu } from "./components/soundgen";
import { FileUpload } from "./components/ui";
import { useState, useRef, Ref } from "preact/hooks";

const audioContext = new AudioContext();

export function App() {
  const audioSrcRef = useRef<HTMLAudioElement>(null);
  const [audioControlSrc, setAudioControlSrc] = useState<string | undefined>();

  const onUpload = (file: File) => {
    setAudioControlSrc(URL.createObjectURL(file));
    audioSrcRef.current?.load();
  };

  return (
    <div className="flex h-screen flex-col items-center gap-2">
      <div className="flex items-center gap-4">
        <FileUpload onUpload={onUpload} />
        <div>
          <audio ref={audioSrcRef} src={audioControlSrc} controls />
        </div>
      </div>
      {/* <SoundGenMenu /> */}
    </div>
  );
}
