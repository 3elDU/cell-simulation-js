import { Pane } from "tweakpane";
import elements from "./elements";
import { doTick, newWorld, type World } from "@/world";
import Panzoom, { type PanzoomObject } from "@panzoom/panzoom";
import { SystemsPane } from "./systems";
import { RenderersPane } from "./renderers";
import { SelectedCellController } from "./selected-cell";
import { MetricsPane } from "./metrics";
import { DishesPane, type NewDishParams } from "./dishes";
import {
  dishMeta,
  loadSnapshot,
  restoreRenderers,
  saveDish,
  snapshotWorld,
  worldFromSnapshot,
  type DishMeta,
  type Snapshot,
} from "@/persistence";

/**
 * Autosave fires only once *both* are satisfied, so a fast world isn't writing
 * megabytes every few ticks and a slow one still gets saved eventually.
 */
const AUTOSAVE_INTERVAL_MS = 5000;
const AUTOSAVE_INTERVAL_TICKS = 10;

export class UIController {
  world: World | undefined;
  ctx: CanvasRenderingContext2D;
  /** Offscreen canvas renderers compose onto. */
  buffer: CanvasRenderingContext2D | undefined;
  panzoom: PanzoomObject | undefined;

  newWorldPane: DishesPane;
  worldPane: Pane | undefined;
  systemsPane: Pane | undefined;
  renderersPane: RenderersPane | undefined;
  metricsPane: MetricsPane | undefined;
  selectedCell: SelectedCellController | undefined;

  /**
   * Identity of the dish currently open. Autosave writes back to this id, so
   * a running world keeps overwriting its own record rather than littering the
   * list with one entry per save.
   */
  dish: { id: string; name: string } | undefined;

  saveState = { lastSavedAt: 0, lastSavedTick: 0, saving: false, status: "—" };

  /**
   * State of the continuous run loop.
   *
   * `maxTps` of 0 means unthrottled — the loop still yields between ticks,
   * so it goes as fast as ticking and rendering allow. `tps` is the measured
   * rate.
   */
  runParams = { running: false, maxTps: 0, tps: 0 };
  /** Guards against overlapping ticks. */
  ticking = false;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.world = undefined;

    this.newWorldPane = new DishesPane(
      elements.paneContainer,
      params => this.newWorld(params),
      dish => void this.openDish(dish)
    );
  }

  buildWorldPane(): Pane {
    const pane = new Pane({
      title: this.dish?.name ?? "World",
      container: elements.paneContainer,
    });

    pane.addBinding(this.world!, "tick", {
      readonly: true,
      format: v => v.toString(),
    });

    // Keeps the dish identity — clearing restarts this petri dish rather than
    // opening a second one under the same name.
    pane.addButton({ title: "Clear" }).on("click", () => {
      const { width, height } = this.world!;
      this.enterWorld(newWorld(width, height));
    });

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
      format: v => v.toFixed(1),
    });

    pane.addBinding(this.saveState, "status", {
      label: "saved",
      readonly: true,
    });

    pane.addButton({ title: "Save now" }).on("click", () => void this.save());

    pane.addButton({ title: "Close" }).on("click", () => void this.close());

    return pane;
  }

  /**
   * Writes the world, its systems and its renderers into the open dish.
   *
   * Guarded against overlap — a slow save shouldn't queue up behind autosave
   * asking again.
   */
  async save() {
    if (!this.world || !this.dish || this.saveState.saving) return;

    this.saveState.saving = true;

    try {
      const snapshot = snapshotWorld(
        this.world,
        this.renderersPane?.renderers ?? []
      );

      await saveDish(
        dishMeta(this.dish.id, this.dish.name, this.world),
        snapshot
      );

      this.saveState.lastSavedAt = performance.now();
      this.saveState.lastSavedTick = this.world.tick;
      this.saveState.status = new Date().toLocaleTimeString();
    } catch (error) {
      console.error("failed to save dish:", error);
      this.saveState.status = "failed";
    } finally {
      this.saveState.saving = false;
    }
  }

  /**
   * Saves and tears down the current world, returning to the dish list.
   */
  async close() {
    this.runParams.running = false;

    await this.save();

    this.disposePanes();

    this.world = undefined;
    this.dish = undefined;

    elements.main.dataset.initialized = "false";
    this.newWorldPane.hidden = false;
    this.newWorldPane.rerollName();
    await this.newWorldPane.refreshList();
  }

  async openDish(dish: DishMeta) {
    const snapshot = await loadSnapshot(dish.id);

    if (!snapshot) {
      console.error("no snapshot stored for dish", dish.id);
      return;
    }

    this.dish = { id: dish.id, name: dish.name };
    this.enterWorld(worldFromSnapshot(snapshot), snapshot);
  }

  /**
   * Ticks continuously until stopped, throttled to `runParams.maxTps`.
   *
   * Each iteration yields through a timeout even when unthrottled, so the
   * browser gets to paint and the panes stay responsive.
   */
  async runLoop() {
    let measuredAt = performance.now();
    let ticksSince = 0;

    while (this.runParams.running) {
      const start = performance.now();

      await this.tick();

      // Not awaited — blocking here would drop the measured tps every autosave.
      if (this.shouldAutosave()) void this.save();

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

      await new Promise(resolve =>
        setTimeout(resolve, Math.max(0, budget - elapsed))
      );
    }

    this.runParams.tps = 0;
  }

  /** Resizes the canvas to world size and attaches panzoom for wheel/touch zoom. */
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
      this.panzoom.zoomWithWheel
    );
  }

  disposePanes() {
    this.worldPane?.dispose();
    this.systemsPane?.dispose();
    this.renderersPane?.dispose();
    this.metricsPane?.dispose();
    this.selectedCell?.dispose();

    this.worldPane = undefined;
    this.systemsPane = undefined;
    this.renderersPane = undefined;
    this.metricsPane = undefined;
    this.selectedCell = undefined;
  }

  newWorld(params: NewDishParams) {
    this.dish = { id: crypto.randomUUID(), name: params.name };

    this.enterWorld(newWorld(params.width, params.height));
  }

  /**
   * Swaps in a world and rebuilds every pane around it.
   *
   * Shared by "New" and "Open" so the two paths can't drift — a loaded world
   * gets exactly the same panes, canvas and render as a fresh one, with the
   * saved renderer state layered on afterwards.
   */
  enterWorld(world: World, snapshot?: Snapshot) {
    this.disposePanes();

    this.world = world;
    console.debug("world object:", this.world);

    this.worldPane = this.buildWorldPane();
    this.systemsPane = new SystemsPane(elements.paneContainer, this.world);
    this.renderersPane = new RenderersPane(elements.paneContainer);
    this.metricsPane = new MetricsPane(elements.paneContainer, this.world);
    this.selectedCell = new SelectedCellController(
      elements.paneContainer,
      elements.canvas,
      this.world
    );

    // Renderers live outside the world, so they're restored here rather than
    // in worldFromSnapshot — the instances only exist once the pane built them.
    if (snapshot) {
      restoreRenderers(this.renderersPane.renderers, snapshot);
      this.renderersPane.refresh();
    }

    this.configureCanvas();

    elements.main.dataset.initialized = "true";
    this.newWorldPane.hidden = true;

    // A freshly opened dish counts as just-saved, so autosave doesn't fire on
    // the very first tick after loading.
    this.saveState.lastSavedAt = performance.now();
    this.saveState.lastSavedTick = world.tick;
    this.saveState.status = snapshot ? "loaded" : "—";

    this.render();

    // Give a brand-new dish a record immediately, so it shows up in the list
    // even if it's closed without ever being run.
    if (!snapshot) void this.save();
  }

  /**
   * Whether enough time *and* enough ticks have passed to warrant a save.
   */
  shouldAutosave(): boolean {
    if (!this.world) return false;

    return (
      performance.now() - this.saveState.lastSavedAt >= AUTOSAVE_INTERVAL_MS &&
      this.world.tick - this.saveState.lastSavedTick >= AUTOSAVE_INTERVAL_TICKS
    );
  }

  /**
   * Composes renderers onto an offscreen buffer, then blits it to the
   * visible canvas in one synchronous step — renderers draw asynchronously,
   * and drawing straight onto the visible canvas would flash partial frames.
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
      this.metricsPane!.sample();
      this.selectedCell!.refresh();
    } finally {
      this.ticking = false;
    }
  }
}
