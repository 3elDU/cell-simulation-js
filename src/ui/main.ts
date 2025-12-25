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
  panzoom: PanzoomObject | undefined;

  newWorldPane: Pane;
  worldPane: Pane | undefined;
  systemsPane: Pane | undefined;
  renderersPane: RenderersPane | undefined;
  selectedCell: SelectedCellController | undefined;

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
      width: Math.floor(Math.random() * 256 + 32),
      height: Math.floor(Math.random() * 256 + 32),
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
      .addButton({
        title: "Do Tick",
      })
      .on("click", () => this.tick());

    return pane;
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
      startScale: 2,
      step: 0.1,
      focal: { x: 0.5, y: 0.5 },
    });

    elements.canvas.parentElement!.addEventListener(
      "wheel",
      this.panzoom.zoomWithWheel
    );
  }

  newWorld(params: { width: number; height: number }) {
    this.world = newWorld(params.width, params.height);
    console.debug("world object:", this.world);

    // Initialize panes
    this.worldPane = this.buildWorldPane();
    this.systemsPane = new SystemsPane(elements.paneContainer, this.world!);
    this.renderersPane = new RenderersPane(elements.paneContainer);
    this.selectedCell = new SelectedCellController(
      elements.paneContainer,
      elements.canvas,
      this.world!
    );
    this.configureCanvas();

    // This shows the canvas element
    elements.main.dataset.initialized = "true";

    // Hide new world pane
    this.newWorldPane.hidden = true;

    // Render the scene right away
    this.render();
  }

  async render() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    for (const renderer of this.renderersPane!.renderers) {
      if (!renderer.enabled) continue;

      const result = renderer.render(this.ctx, this.world!);

      if (result instanceof Promise) await result;
    }
  }

  async tick() {
    doTick(this.world!);
    await this.render();

    this.worldPane!.refresh();
    this.systemsPane!.refresh();
    this.renderersPane!.refresh();
    this.selectedCell!.refresh();
  }
}
