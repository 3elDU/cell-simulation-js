import { countAdjacentCells, type Cell } from "@/cell";
import type { World } from "@/world";
import type { Sensor } from ".";
import { ADJACENT_TILES } from "@/grid";

/**
 * Share of the reachable neighboring tiles that are taken: 0 is open ground,
 * 1 is boxed in.
 *
 * Always readable — the grid is the one thing no system owns, so there is no
 * arrangement of switches that leaves a cell blind to its own surroundings.
 */
export class CrowdingSensor implements Sensor {
  id = "crowding";
  title = "Crowding";
  description = "How much of the reachable space is occupied";

  computeValue(cell: Cell, world: World): number {
    return countAdjacentCells(world, cell.position) / ADJACENT_TILES;
  }
}
