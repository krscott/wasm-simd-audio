import { render } from "preact";
import { App } from "./app";
import "./index.css";

import init from "wasm-audio";

init().then(() => {
  render(<App />, document.getElementById("app") as HTMLElement);
});
