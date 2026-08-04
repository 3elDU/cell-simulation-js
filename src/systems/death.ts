import type { World } from "@/world";
import type { System } from ".";
import { BaseSystem } from "./base";
import { getComponent } from "@/components";
import { gridEvery, gridSet, type GridLayer } from "@/grid";
import type { ConfigSchema } from "@/ui";
import { LAYER_MAX } from "./minerals";

/**
 * Clears the tiles of cells marked for death and leaves their corpses in the
 * organics layer.
 *
 * The sweep runs at the *start* of a tick rather than the moment a cell is
 * marked. A cell killed partway through tick N stays on the grid until tick
 * N+1 begins, so systems running later in tick N see a consistent world
 * instead of cells vanishing out from under them mid-iteration. In practice
 * "died" means "will be gone when the next tick opens".
 *
 * The sweep walks the grid rather than `world.cells`, which keeps it O(map)
 * instead of O(every cell that ever lived) — and means a corpse needs no
 * "already handled" flag, since clearing its tile is what takes it out of
 * range. Dead cells stay in `world.cells` with their death component intact,
 * so the inspector can still be asked what happened to them.
 */
export class DeathSystem extends BaseSystem implements System {
  id = "death";
  title = "Death";
  description = `Removes cells marked for death
and leaves their corpse in the
organics layer.`;
  enabled = true;

  /**
   * Deposited on top of whatever energy the cell still had. This is the value
   * of the body itself, so a starved corpse is still worth scavenging — but
   * far less than one killed in its prime, which is what will make hunting
   * healthy cells pay off later.
   */
  bodyValue = 15;

  /**
   * Share of the corpse that reaches the organics layer. Below 1, part of the
   * cell leaves the world on death instead of being recycled.
   */
  corpseYield = 1;

  config: ConfigSchema = [
    { prop: "bodyValue", label: "Body value", min: 0, step: 1 },
    { prop: "corpseYield", label: "Corpse yield", min: 0, max: 1, step: 0.01 },
  ];

  onTick(world: World): void {
    const organics = world.layers.organics as
      | GridLayer<Float32Array>
      | undefined;

    gridEvery(world.grid, (x, y, id) => {
      const cell = world.cells.get(id);
      if (!cell || !getComponent(cell, "death")) return;

      const energy = getComponent(cell, "energy")?.energy ?? 0;

      // Skipped rather than faked when the organics system is off — the
      // corpse's energy simply leaves the world instead of piling up in a
      // layer nothing owns.
      if (organics) {
        const index = y * organics.width + x;
        organics.data[index] = Math.min(
          organics.data[index]! + (energy + this.bodyValue) * this.corpseYield,
          LAYER_MAX,
        );
      }

      gridSet(world.grid, { x, y }, -1);

      // Off the grid now, so doTick's end-of-tick sweep will never reach it.
      delete cell.components.internal;
    });
  }
}
