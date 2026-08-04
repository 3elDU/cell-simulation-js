import { Pane } from "tweakpane";
import elements from "./elements";
import { doTick, newWorld, type World } from "@/world";
import Panzoom, { type PanzoomObject } from "@panzoom/panzoom";
import { SystemsPane } from "./systems";
import { RenderersPane } from "./renderers";
import { SelectedCellController } from "./selected-cell";

export class UIController {
  world: World | undefined;
  ctx: CanvasRenderingContext2D;
  /** Offscreen canvas renderers compose onto, see {@link UIController.render} */
  buffer: CanvasRenderingContext2D | undefined;
  panzoom: PanzoomObject | undefined;

  newWorldPane: Pane;
  worldPane: Pane | undefined;
  systemsPane: Pane | undefined;
  renderersPane: RenderersPane | undefined;
  selectedCell: SelectedCellController | undefined;

  /**
   * State of the continuous run loop, see {@link UIController.runLoop}.
   *
   * `maxTps` of 0 means unthrottled — the loop still yields between ticks,
   * so it goes as fast as ticking and rendering allow. `tps` is the measured
   * rate, which is what actually tells you whether the limit is doing anything.
   */
  runParams = { running: false, maxTps: 0, tps: 0 };
  /** Guards against overlapping ticks, see {@link UIController.tick} */
  ticking = false;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.world = undefined;

    this.newWorldPane = this.buildNewWorldPane();
  }

  buildNewWorldPane(): Pane {
    const pane = new Pane({
      title: "New World",
      container: elements.paneContainer,
    });

    const params = {
      width: Math.floor(Math.random() * 184 + 72),
      height: Math.floor(Math.random() * 184 + 72),
    };

    pane.addBinding(params, "width", {
      step: 1,
    });
    pane.addBinding(params, "height", {
      step: 1,
    });

    const btn = pane.addButton({
      title: "New",
    });
    btn.on("click", () => this.newWorld(params));

    return pane;
  }

  buildWorldPane(): Pane {
    const pane = new Pane({
      title: "World",
      container: elements.paneContainer,
    });

    pane.addBinding(this.world!, "tick", {
      readonly: true,
      format: (v) => v.toString(),
    });

    pane
      .addButton({ title: "Clear" })
      .on("click", () => this.newWorld(this.world!));

    pane
      .addButton({
        title: "Do Tick",
      })
      .on("click", () => this.tick());

    const runBtn = pane.addButton({ title: "Start" });
    runBtn.on("click", () => {
      this.runParams.running = !this.runParams.running;
      runBtn.title = this.runParams.running ? "Stop" : "Start";

      if (this.runParams.running) this.runLoop();
    });

    pane.addBinding(this.runParams, "maxTps", {
      label: "max tps",
      min: 0,
      max: 240,
      step: 1,
    });

    pane.addBinding(this.runParams, "tps", {
      label: "tps",
      readonly: true,
      format: (v) => v.toFixed(1),
    });

    return pane;
  }

  /**
   * Ticks continuously until stopped, throttled to `runParams.maxTps`.
   *
   * Each iteration yields through a timeout even when unthrottled, so the
   * browser gets to paint and the panes stay responsive instead of the loop
   * hogging the main thread.
   */
  async runLoop() {
    let measuredAt = performance.now();
    let ticksSince = 0;

    while (this.runParams.running) {
      const start = performance.now();

      await this.tick();

      // Recompute the budget every iteration so the slider takes effect mid-run
      const budget =
        this.runParams.maxTps > 0 ? 1000 / this.runParams.maxTps : 0;
      const elapsed = performance.now() - start;

      ticksSince++;
      const sinceMeasure = start + elapsed - measuredAt;
      if (sinceMeasure >= 500) {
        this.runParams.tps = (ticksSince * 1000) / sinceMeasure;
        measuredAt = start + elapsed;
        ticksSince = 0;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, Math.max(0, budget - elapsed)),
      );
    }

    this.runParams.tps = 0;
  }

  /**
   * Resizes canvas to match world size, and attaches
   * panzoom to it to allow zooming in with wheel/touch.
   */
  configureCanvas() {
    elements.canvas.width = this.world!.width;
    elements.canvas.height = this.world!.height;

    this.panzoom = Panzoom(elements.canvas.parentElement!, {
      minScale: 1,
      maxScale: 16,
      startScale: 4,
      step: 0.1,
      focal: { x: 0.5, y: 0.5 },
    });

    elements.canvas.parentElement!.addEventListener(
      "wheel",
      this.panzoom.zoomWithWheel,
    );
  }

  newWorld(params: { width: number; height: number }) {
    this.worldPane?.dispose();
    this.systemsPane?.dispose();
    this.renderersPane?.dispose();
    this.selectedCell?.dispose();

    this.world = newWorld(params.width, params.height);
    console.debug("world object:", this.world);

    // Initialize panes
    this.worldPane = this.buildWorldPane();
    this.systemsPane = new SystemsPane(elements.paneContainer, this.world!);
    this.renderersPane = new RenderersPane(elements.paneContainer);
    this.selectedCell = new SelectedCellController(
      elements.paneContainer,
      elements.canvas,
      this.world!,
    );
    this.configureCanvas();

    // This shows the canvas element
    elements.main.dataset.initialized = "true";

    // Hide new world pane
    this.newWorldPane.hidden = true;

    // Render the scene right away
    this.render();
  }

  /**
   * Renderers draw asynchronously, and every await yields to the browser,
   * which is free to composite a frame mid-loop. Drawing straight onto the
   * visible canvas therefore flashes: first empty, then partially layered.
   *
   * So everything is composed on an offscreen buffer and blitted onto the
   * visible canvas in one synchronous step at the end.
   */
  bufferCtx(): CanvasRenderingContext2D {
    const { width, height } = this.ctx.canvas;

    if (!this.buffer) {
      this.buffer = document
        .createElement("canvas")
        .getContext("2d") as CanvasRenderingContext2D;
    }

    if (this.buffer.canvas.width !== width) this.buffer.canvas.width = width;
    if (this.buffer.canvas.height !== height)
      this.buffer.canvas.height = height;

    return this.buffer;
  }

  async render() {
    const ctx = this.bufferCtx();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (const renderer of this.renderersPane!.renderers) {
      if (!renderer.enabled) continue;

      const result = renderer.render(ctx, this.world!);

      if (result instanceof Promise) await result;
    }

    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.drawImage(ctx.canvas, 0, 0);
  }

  async tick() {
    // render() awaits, so a "Do Tick" click during a run would otherwise
    // start a second tick mid-render and blit a mix of the two.
    if (this.ticking) return;
    this.ticking = true;

    try {
      doTick(this.world!);
      await this.render();

      this.worldPane!.refresh();
      this.systemsPane!.refresh();
      this.renderersPane!.refresh();
      this.selectedCell!.refresh();
    } finally {
      this.ticking = false;
    }
  }
}
