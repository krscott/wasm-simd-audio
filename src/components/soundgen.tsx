import { waitMs } from "../myutil";
import { Button } from "./ui";

const audioCtx = new AudioContext();

const playSound = async () => {
  const oscillator = audioCtx.createOscillator();
  oscillator.connect(audioCtx.destination);
  oscillator.type = "triangle";
  oscillator.start();
  await waitMs(500);
  oscillator.stop();
};

export const SoundGenMenu: Fc<{}> = ({}) => {
  return (
    <div>
      <Button onClick={playSound}>Play</Button>
    </div>
  );
};
