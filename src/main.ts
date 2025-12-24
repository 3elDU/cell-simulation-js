import "./styles/index.css";
import { showErrorScreen } from "./ui/error";
import { UIController } from "./ui/controller";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");
if (ctx === null) {
  showErrorScreen(
    "Canvas unavailable",
    "Unable to get canvas context for rendering. Check that canvas support is enabled in your browser."
  );
  throw new Error("unable to create canvas context");
}

const controller = new UIController(ctx);
console.debug("UI Controller:", controller);
