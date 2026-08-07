import { gridGet, gridGetAdjacent, gridSet, type Position } from "./grid";
import type { World } from "./world";

export interface Cell {
  id: number;
  position: Position;

  /**
   * Components allow storing arbitrary information,
   * associated with the cell
   */
  components: Record<string, Record<string, unknown>>;
}

/**
 * Add a new cell empty into the world.
 */
export function addCell(world: World, x: number, y: number): Cell {
  const cell: Cell = {
    id: -1,
    position: { x, y },
    components: {},
  };

  const id = world.nextCellId++;
  world.cells.set(id, cell);
  cell.id = id;

  gridSet(world.grid, { x, y }, id);

  return cell;
}

/**
 * Number of the reachable neighboring tiles holding a cell.
 */
export function countAdjacentCells(world: World, position: Position): number {
  return gridGetAdjacent(world.grid, position).filter(
    ({ value }) => value !== undefined && value !== -1
  ).length;
}

/**
 * Helper method to get the cell instance at specified coordinates
 */
export function getCell(world: World, x: number, y: number): Cell | undefined {
  const id = gridGet(world.grid, { x, y });

  if (id !== undefined && id !== -1) {
    return world.cells.get(id)!;
  }

  return undefined;
}
