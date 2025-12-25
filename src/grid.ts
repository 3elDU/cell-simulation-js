/**
 * Definitions for the {@link GridLayer} type and utility functions for it.
 */

/**
 * A utility interface to store a position of something.
 *
 * Cannot be used as a key directly
 */
export type Position = {
  x: number;
  y: number;
};

type TypedArray =
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

  /**
   * Wrap data inside an array, if it's a non-array type.
   *
   * Types like Uint8Array are not wrapped because they are already, an array.
   *
   * Data is assumed to already be of [width*height] elements, so that indexing
   * would not fail.
   */
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
