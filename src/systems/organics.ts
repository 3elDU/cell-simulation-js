import type { System } from ".";
import { BaseSystem } from "./base";
import type { World } from "@/world";
import { LAYER_MAX, type GridLayer } from "@/grid";
import type { ConfigSchema, UIAction, UIActionable } from "@/ui";

/**
 * Rots the organics layer down into minerals.
 *
 * Nothing fills this layer yet — dead cells will. What it exists to do is
 * close the energy loop: light and vents put energy in, cells carry it,
 * corpses drop it here, and decay hands it back to the minerals layer for
 * chemosynthesis to pick up again.
 *
 * With `toMinerals` at 0 the loop is open instead and energy simply leaves the
 * world, which is a legitimate world to run — hence a knob and not a constant.
 */
export class OrganicsSystem
  extends BaseSystem
  implements System, UIActionable
{
  id = "organics";
  title = "Organics";
  description = `Decays the organics layer,
returning what rots to the
minerals layer.

Fed by dead cells.`;
  enabled = true;

  // Organics is deposited into minerals, so run once minerals exists.
  after = ["minerals"];

  /**
   * Fraction of the remaining organics that rots each tick. Exponential, so
   * a pile thins out fast and then lingers.
   */
  decayRate = 0.01;

  /**
   * Share of the rotted amount that reappears as minerals. The rest is lost.
   */
  toMinerals = 1;

  /**
   * Below this, a tile is rounded down to empty — otherwise exponential decay
   * leaves an infinitely thin smear behind forever.
   */
  threshold = 0.01;

  config: ConfigSchema = [
    { prop: "decayRate", label: "Decay rate", min: 0, max: 1, step: 0.001 },
    { prop: "toMinerals", label: "To minerals", min: 0, max: 1, step: 0.01 },
    { prop: "threshold", label: "Threshold", min: 0, max: 1, step: 0.001 },
  ];

  actions: UIAction[] = [
    {
      // Nothing produces organics until cells can die, so seeding by hand is
      // the only way to watch decay work.
      title: "Scatter organics",
      callback: () => this.scatter(),
    },
    {
      title: "Clear layer",
      callback: () => this.clearLayer(),
    },
  ];

  world: World | undefined;

  onInit(world: World): void {
    this.world = world;

    if (!world.layers.organics) {
      world.layers.organics = {
        width: world.width,
        height: world.height,
        data: new Float32Array(world.width * world.height),
      };
    }
  }

  scatter() {
    const layer = this.layer();
    if (!layer) return;

    for (let i = 0; i < layer.data.length; i++) {
      if (Math.random() < 0.02) layer.data[i] = Math.random() * LAYER_MAX;
    }
  }

  clearLayer() {
    this.layer()?.data.fill(0);
  }

  private layer(): GridLayer<Float32Array> | undefined {
    return this.world?.layers.organics as GridLayer<Float32Array> | undefined;
  }

  onTick(world: World): void {
    const organics = world.layers.organics as
      | GridLayer<Float32Array>
      | undefined;
    if (!organics) return;

    const minerals = world.layers.minerals as
      | GridLayer<Float32Array>
      | undefined;

    for (let i = 0; i < organics.data.length; i++) {
      const value = organics.data[i]!;
      if (value <= 0) continue;

      const rotted = value < this.threshold ? value : value * this.decayRate;

      organics.data[i] = value - rotted;

      // Skipped rather than faked when the minerals system is off, so the
      // energy is simply lost instead of accumulating in a layer nobody owns.
      if (minerals) {
        minerals.data[i] = Math.min(
          minerals.data[i]! + rotted * this.toMinerals,
          LAYER_MAX,
        );
      }
    }
  }
}
