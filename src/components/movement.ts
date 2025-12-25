export type MovementDirection = "left" | "right" | "up" | "down";

/**
 * Represents an intention for the cell to move.
 * The cell hasn't moved yet at this point.
 */
export interface Movement {
  dir: MovementDirection;
}
