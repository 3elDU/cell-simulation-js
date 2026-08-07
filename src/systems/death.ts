import type { World } from "@/world";
import type { System } from ".";
import { BaseSystem } from "./base";
import { getComponent } from "@/components";
import { gridEvery, gridSet, LAYER_MAX, type GridLayer } from "@/grid";
import type { ConfigSchema } from "@/ui";

/**
 * Clears the tiles of cells marked for death and leaves their corpses in the
 * organics layer.
 *
 * Sweeps at the *start* of a tick, not the moment a cell is marked, so
 * systems later in the same tick see a consistent world — "died" means
 * "gone once the next tick opens".
 *
 * Walks the grid rather than `world.cells`, so it stays O(map) and a corpse
 * needs no "already handled" flag — clearing its tile is what removes it.
 * Dead cells stay in `world.cells` with their death component intact, so the
 * inspector can still be asked what happened to them.
 */
export class DeathSystem extends BaseSystem implements System {
  id = "death";
  title = "Death";
  description = `Removes cells marked for death
and leaves their corpse in the
organics layer.`;
  enabled = true;

  /**
   * Deposited on top of whatever energy the cell still had — the value of
   * the body itself, so even a starved corpse is worth scavenging.
   */
  bodyValue = 15;

  /**
   * Share of the corpse that reaches the organics layer. Below 1, part of the
   * cell leaves the world on death instead of being recycled.
   */
  corpseYield = 1;

  /**
   * How many corpses stay in `world.cells` for inspection.
   *
   * Dead cells are kept for inspection, but reproduction makes that pile
   * unbounded — the oldest are dropped past this point.
   */
  keepCorpses = 500;

  config: ConfigSchema = [
    { prop: "bodyValue", label: "Body value", min: 0, step: 1 },
    { prop: "corpseYield", label: "Corpse yield", min: 0, max: 1, step: 0.01 },
    { prop: "keepCorpses", label: "Keep corpses", min: 0, step: 10 },
  ];

  /**
   * Ids of cleared corpses in the order they died, oldest first.
   */
  corpses: number[] = [];

  onTick(world: World): void {
    const organics = world.layers.organics as
      GridLayer<Float32Array> | undefined;

    gridEvery(world.grid, (x, y, id) => {
      const cell = world.cells.get(id);
      if (!cell || !getComponent(cell, "death")) return;

      const energy = getComponent(cell, "energy")?.energy ?? 0;

      // Skip processing if organics layer doesn't exist
      if (organics) {
        const index = y * organics.width + x;
        organics.data[index] = Math.min(
          organics.data[index]! + (energy + this.bodyValue) * this.corpseYield,
          LAYER_MAX
        );
      }

      gridSet(world.grid, { x, y }, -1);

      // Off the grid now, so doTick's end-of-tick sweep will never reach it.
      delete cell.components.internal;

      this.corpses.push(id);
    });

    while (this.corpses.length > this.keepCorpses) {
      world.cells.delete(this.corpses.shift()!);
    }
  }
}
