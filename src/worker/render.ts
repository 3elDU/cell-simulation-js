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
  simulation: CellSimulation;

  // Track simulation width and height, and resize ImageData in case the
  // referenced simulation is resized
  prevWidth: number;
  prevHeight: number;

  resize() {
    this.canvas.width = this.simulation.map.width;
    this.canvas.height = this.simulation.map.height;
    this.imageData = new ImageData(
      this.simulation.map.width,
      this.simulation.map.height
    );
  }

  constructor(simulation: CellSimulation) {
    this.canvas = new OffscreenCanvas(
      simulation.map.width,
      simulation.map.height
    );
    const context = this.canvas.getContext("2d");
    if (context === null) {
      throw new Error("failed to acquire canvas context");
    }

    this.simulation = simulation;

    this.prevWidth = simulation.map.width;
    this.prevHeight = simulation.map.height;

    this.ctx = context;
    this.imageData = new ImageData(simulation.map.width, simulation.map.height);
  }

  render(simulation: CellSimulation) {
    if (
      this.simulation.map.width != this.prevWidth ||
      this.simulation.map.height != this.prevHeight
    ) {
      this.resize();
    }

    for (let x = 0; x < simulation.map.width; x++) {
      for (let y = 0; y < simulation.map.height; y++) {
        const pixel = y * simulation.map.width + x;

        const bot = simulation.getCellAt(x, y);
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
    this.prevWidth = this.simulation.map.width;
    this.prevHeight = this.simulation.map.height;
  }
}
