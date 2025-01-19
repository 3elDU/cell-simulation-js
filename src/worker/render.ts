import type { CellSimulation } from "@/simulation/simulation";

/**
 * All rendering happens inside the worker to improve performance.
 * Then the image data is transferred back to the main thread,
 * where it is drawn to the canvas.
 */
export default class Renderer {
  canvas: OffscreenCanvas;
  ctx: OffscreenCanvasRenderingContext2D;
  imageData: ImageData;

  constructor(width: number, height: number) {
    this.canvas = new OffscreenCanvas(width, height);
    const context = this.canvas.getContext("2d");
    if (context === null) {
      throw new Error("failed to acquire canvas context");
    }

    this.ctx = context;
    this.imageData = new ImageData(width, height);
  }

  render(simulation: CellSimulation) {
    for (let x = 0; x < simulation.width; x++) {
      for (let y = 0; y < simulation.height; y++) {
        const pixel = y * simulation.width + x;

        // const bot = simulation.getCellAt(x, y);
        const bot = simulation.bots[y * simulation.width + x];
        let r = 0,
          g = 0,
          b = 0;

        if (bot.alive) {
          (r = bot.color.r), (g = bot.color.g), (b = bot.color.b);
        } else if (!bot.alive && !bot.empty) {
          (r = 100), (g = 100), (b = 100);
        }

        this.imageData.data[pixel * 4] = r;
        this.imageData.data[pixel * 4 + 1] = g;
        this.imageData.data[pixel * 4 + 2] = b;
        this.imageData.data[pixel * 4 + 3] = 255;
      }
    }

    this.ctx.putImageData(this.imageData, 0, 0);
  }
}
