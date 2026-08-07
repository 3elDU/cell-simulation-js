import type { Cell } from "@/cell";
import type { World } from "@/world";
import type { System } from ".";
import { BaseSystem } from "./base";
import { getComponent } from "@/components";
import type { ConfigSchema } from "@/ui";
import type { GridLayer } from "@/grid";
import { actionRegistry } from "@/actions/registry";
import { HarvestAction } from "@/actions/harvest";

/**
 * Moves value out of resource layers and into the cells that asked for it.
 *
 * This is the only system that *grants* energy; the energy system is purely
 * the sink. Every food source funnels through the one harvest component, so
 * adding a source means registering another harvest action — this file never
 * learns its name.
 *
 * Runs before the energy system, so a cell that fed this tick has the energy
 * before upkeep is charged against it. A brand-new cell still can't feed on
 * its first tick, since the energy system is what creates its energy
 * component.
 */
export class FeedingSystem extends BaseSystem implements System {
  id = "feeding";
  title = "Feeding";
  description = `Draws value out of resource
layers into cells that chose
to harvest.`;
  enabled = true;

  after = ["genome"];

  /**
   * Per-layer amounts taken per tick, seeded from what each harvest action
   * declares. Keyed by layer rather than by action, since two actions reading
   * the same layer are the same drain on it.
   */
  rates: Record<string, number> = {};

  /**
   * Per-layer conversion into energy. At 1 a harvest is strictly conserved —
   * what leaves the layer arrives in the cell. Below 1 feeding leaks, which is
   * a lever on total biomass that doesn't touch the vents or the gradient.
   */
  efficiencies: Record<string, number> = {};

  config: ConfigSchema = [];

  onInit(): void {
    this.rates = {};
    this.efficiencies = {};
    const config: ConfigSchema = [];

    for (const def of actionRegistry.list()) {
      const action = def.create();
      if (!(action instanceof HarvestAction)) continue;
      if (action.layer in this.rates) continue;

      this.rates[action.layer] = action.rate;
      this.efficiencies[action.layer] = 1;

      config.push(
        {
          prop: action.layer,
          object: this.rates,
          label: `${def.title} rate`,
          min: 0,
          step: 0.05,
        },
        {
          prop: action.layer,
          object: this.efficiencies,
          label: `${def.title} efficiency`,
          min: 0,
          max: 1,
          step: 0.01,
        }
      );
    }

    this.config = config;
  }

  onCellTick(world: World, cell: Cell): void {
    const harvest = getComponent(cell, "harvest");
    if (!harvest) return;

    // Intent lasts one tick. Cleared up front so a cell that stops choosing to
    // feed stops feeding, rather than coasting on a stale component forever.
    delete cell.components.harvest;

    const layer = world.layers[harvest.layer] as
      GridLayer<Float32Array> | undefined;
    if (!layer) return;

    const energy = getComponent(cell, "energy");
    if (!energy) return;

    const index = cell.position.y * layer.width + cell.position.x;

    // Capped by what is actually there, so a stripped tile yields nothing.
    const taken = Math.min(this.rates[harvest.layer] ?? 0, layer.data[index]!);
    if (taken <= 0) return;

    layer.data[index]! -= taken;
    energy.energy += taken * (this.efficiencies[harvest.layer] ?? 1);
  }
}
