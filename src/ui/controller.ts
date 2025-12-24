import { Pane } from "tweakpane";
import elements from "./elements";
import { doTick, newWorld, type World } from "@/world";
import Panzoom from "@panzoom/panzoom";
import type { Renderer } from "@/renderers";
import { LightnessRenderer } from "@/renderers/light";
import { SystemsPane } from "./systems";

export class UIController {
  world: World | undefined;
  ctx: CanvasRenderingContext2D;

  newWorldPane: Pane;
  worldPane: Pane | undefined;
  systemsPane: Pane | undefined;

  activeRenderer: Renderer;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.world = undefined;

    this.newWorldPane = this.buildNewWorldPane();
    this.activeRenderer = new LightnessRenderer();
  }

  buildNewWorldPane(): Pane {
    const pane = new Pane({
      title: "New World",
      container: elements.paneContainer,
    });

    const params = {
      width: 128,
      height: 64,
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

    Panzoom(elements.canvas, {
      canvas: true,
      minScale: 1,
      maxScale: 16,
    });
  }

  newWorld(params: { width: number; height: number }) {
    this.world = newWorld(params.width, params.height);
    console.debug("world object:", this.world);

    this.worldPane = this.buildWorldPane();
    this.systemsPane = new SystemsPane(elements.paneContainer, this.world!);
    this.configureCanvas();

    elements.main.dataset.initialized = "true";
  }

  tick() {
    doTick(this.world!);
    this.activeRenderer.render(this.ctx, this.world!);
    this.worldPane!.refresh();
  }
}
