/**
 * Definitions for the grid layer type and utility functions for it.
 */

/**
 * Highest value a resource layer holds.
 *
 * Shared rather than repeated, because layers hand values to each other —
 * organics rots into minerals — and a mismatched cap would silently destroy
 * energy at the handoff.
 */
export const LAYER_MAX = 255;

/** A position on the grid. Cannot be used as a key directly. */
export type Position = {
  x: number;
  y: number;
};

export type TypedArray =
  | Uint8Array
  | Uint16Array
  | Uint32Array
  | Int8Array
  | Int16Array
  | Int32Array
  | Float32Array
  | Float64Array;

/**
 * A grid layer packs numbers inside a one-dimensional array that can be
 * treated like a two-dimensional grid.
 */
export interface GridLayer<T extends TypedArray> {
  width: number;
  height: number;

  /** Backing storage, already sized to `width * height` elements. */
  data: T;
}

/**
 * Sets a value at the given position inside a grid layer
 */
export function gridSet<T extends TypedArray>(
  grid: GridLayer<T>,
  position: Position,
  value: number
) {
  grid.data[position.y * grid.width + position.x] = value;
}

/**
 * A helper to get a value from the given position inside a grid layer
 */
export function gridGet<T extends TypedArray>(
  grid: GridLayer<T>,
  position: Position
): number | undefined {
  return grid.data[position.y * grid.width + position.x];
}

/**
 * Returns value of item at specified position or a fallback value, if the
 * grid does not exist or position is out of bounds.
 */
export function gridMaybeGet<T extends TypedArray>(
  grid: GridLayer<T> | undefined,
  position: Position,
  fallback: number = 0
): number {
  if (!grid) return fallback;

  return gridGet(grid, position) ?? fallback;
}

type Neighbor = { x: number; y: number; value: number | undefined };

/**
 * How many tiles a position borders on.
 */
export const ADJACENT_TILES = 4;

/**
 * Returns the tiles reachable from the given position, in exact order:
 * - Top
 * - Left
 * - Right
 * - Bottom
 *
 * Diagonals are left out on purpose: nothing can step onto them, so a reading
 * that counted them would describe surroundings a cell can neither reach nor
 * act on.
 *
 * Out-of-bounds neighbors carry an undefined value, but strict order is still
 * guaranteed.
 */
export function gridGetAdjacent<T extends TypedArray>(
  grid: GridLayer<T>,
  position: Position
) {
  const offsets = [
    { x: 0, y: -1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ];

  return offsets.map(({ x, y }) => {
    const x2 = position.x + x;
    const y2 = position.y + y;
    const inside = x2 >= 0 && y2 >= 0 && x2 < grid.width && y2 < grid.height;

    return {
      x: x2,
      y: y2,
      value: inside ? gridGet(grid, { x: x2, y: y2 }) : undefined,
    };
  }) as [Neighbor, Neighbor, Neighbor, Neighbor];
}

/**
 * Calls the callback function for every non-negative and non-null element in the grid
 */
export function gridEvery<T extends TypedArray>(
  grid: GridLayer<T>,
  callback: (x: number, y: number, value: number) => void
) {
  for (let x = 0; x < grid.width; x++) {
    for (let y = 0; y < grid.height; y++) {
      const val = grid.data[y * grid.width + x];

      if (val && val !== -1) callback(x, y, val);
    }
  }
}
