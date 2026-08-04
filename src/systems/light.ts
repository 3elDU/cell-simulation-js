import type { System } from "@/systems";
import { BaseSystem } from "./base";
import type { World } from "@/world";
import { gridSet, LAYER_MAX, type GridLayer } from "@/grid";
import type { ConfigSchema, UIAction, UIActionable } from "@/ui";

export type RegrowMode = "fixed" | "proportional";

/**
 * Fills and regrows the light layer.
 *
 * Light is a *stock*, not a constant. Photosynthesis draws a tile down and it
 * climbs back toward its place on the gradient over time, so a crowded bright
 * patch is worth less than an empty one and spreading out has a payoff.
 * Without that, the bright rows would support unlimited biomass and there
 * would be no carrying capacity at all.
 */
export class LightSystem extends BaseSystem implements System, UIActionable {
  id = "light";
  title = "Light";
  description = `Manages the light layer.

Depleted by photosynthesis and
regrows toward a gradient.`;
  enabled = true;

  /**
   * Value at the brightest end of the gradient.
   */
  maxLight = LAYER_MAX;

  regrowMode: RegrowMode = "fixed";

  /**
   * In "fixed" mode, the value recovered per tick at the brightest end of the
   * gradient — so a stripped tile takes a predictable time to come back. In
   * "proportional" mode, the fraction of the shortfall recovered per tick —
   * fast at first, then asymptotic.
   */
  regrowRate = 0.5;

  config: ConfigSchema = [
    { prop: "maxLight", label: "Max light", min: 0, max: LAYER_MAX, step: 1 },
    {
      prop: "regrowMode",
      label: "Regrowth",
      options: {
        "Fixed rate": "fixed",
        "Proportional to deficit": "proportional",
      },
    },
    { prop: "regrowRate", label: "Regrow rate", min: 0, max: 8, step: 0.01 },
  ];

  actions: UIAction[] = [
    {
      title: "Refill to gradient",
      callback: () => this.fill(),
    },
  ];

  world: World | undefined;

  /**
   * Value a tile recovers toward — brightest at the bottom of the map, dark at
   * the top.
   */
  luminanceForPosition(_x: number, y: number, world: World): number {
    return (y / world.height) * this.maxLight;
  }

  onInit(world: World): void {
    this.world = world;

    if (!world.layers.light) {
      world.layers.light = {
        width: world.width,
        height: world.height,
        // Float, not integer: photosynthesis takes fractional amounts and
        // regrowth returns them. On a Uint8Array a regrow rate below 1 would
        // round to zero and a stripped tile would never recover.
        data: new Float32Array(world.width * world.height),
      };
    }

    this.fill();
  }

  /**
   * Sets every tile straight to its gradient value.
   */
  fill() {
    const world = this.world;
    if (!world) return;

    const grid = world.layers.light as GridLayer<Float32Array>;

    for (let x = 0; x < world.width; x++) {
      for (let y = 0; y < world.height; y++) {
        gridSet(grid, { x, y }, this.luminanceForPosition(x, y, world));
      }
    }
  }

  onTick(world: World): void {
    const grid = world.layers.light as GridLayer<Float32Array> | undefined;
    if (!grid) return;

    for (let x = 0; x < world.width; x++) {
      for (let y = 0; y < world.height; y++) {
        const index = y * grid.width + x;
        const max = this.luminanceForPosition(x, y, world);
        const deficit = max - grid.data[index]!;
        if (deficit === 0) continue;

        // Recovery scales with the tile's place on the gradient, not just its
        // ceiling. Otherwise a dim tile refills as fast as a bright one and
        // position stops mattering the moment anything grazes it — which
        // would make the whole light gradient decorative.
        const rate = this.regrowRate * (this.maxLight > 0 ? max / this.maxLight : 0);

        // Signed, so the layer also comes *down* when maxLight is dragged
        // lower mid-run rather than staying stuck above the new gradient.
        const step =
          this.regrowMode === "fixed"
            ? Math.sign(deficit) * Math.min(rate, Math.abs(deficit))
            : deficit * this.regrowRate;

        grid.data[index]! += step;
      }
    }
  }
}
