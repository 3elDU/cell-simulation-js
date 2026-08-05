import "./styles/index.css";
import { UIController } from "./ui/main";
import { showErrorScreen } from "./ui/error";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");
if (ctx === null) {
  showErrorScreen(
    "Canvas unavailable",
    "Unable to get canvas context for rendering. Check that canvas support is enabled in your browser.",
  );
  throw new Error("unable to create canvas context");
}

if (!window.createImageBitmap) {
  showErrorScreen(
    "window.createImageBitmap() unavailable",
    "This function is required for rendering to work. Please update your browser",
  );
  throw new Error("createImageBitmap() unavailable");
}

if (!window.structuredClone) {
  showErrorScreen(
    "window.structuredClone() unavailable",
    "Please update your browser.",
  );
}

const controller = new UIController(ctx);
