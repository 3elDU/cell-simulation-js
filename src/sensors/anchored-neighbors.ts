import type { Cell } from "@/cell";
import { getEnabledSystem, type World } from "@/world";
import type { Sensor } from ".";
import { getComponent } from "@/components";
import { ADJACENT_TILES, gridGetAdjacent } from "@/grid";

/**
 * Share of the reachable space held by settled cells: 0 out in the open, 1
 * walled in by them.
 *
 * Measured against the reachable tiles rather than against the neighbors
 * present, so it reads as "how much of a cluster is this" and not "how settled
 * is the one cell next to me".
 */
export class AnchoredNeighborsSensor implements Sensor {
  id = "anchored-neighbors";
  title = "Anchored neighbors";
  description = "How much of the reachable space is settled cells";

  computeValue(cell: Cell, world: World): number | undefined {
    if (!getEnabledSystem(world, "anchor")) return undefined;

    let anchored = 0;

    for (const { value } of gridGetAdjacent(world.grid, cell.position)) {
      if (value === undefined || value === -1) continue;

      const neighbor = world.cells.get(value);
      if (neighbor && getComponent(neighbor, "anchor")?.anchored) anchored++;
    }

    return anchored / ADJACENT_TILES;
  }
}
