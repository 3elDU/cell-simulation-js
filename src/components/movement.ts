import type { Cell } from "@/cell";

export type MovementDirection = "left" | "right" | "up" | "down";

/**
 * Represents an intention for the cell to move.
 * The cell hasn't moved yet at this point.
 */
export interface MovementComponent {
  dir: MovementDirection;
}

export function setMovement(cell: Cell, direction: MovementDirection) {
  cell.components.movement = {
    dir: direction,
  };
}

export function getMovement(cell: Cell): MovementComponent | undefined {
  return cell.components.movement as MovementComponent | undefined;
}
