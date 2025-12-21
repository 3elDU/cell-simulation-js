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
 * A grid layer packs some values T inside a one-dimensional array that can be
 * treated like a grid.
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
 * A helper to set a value at the given position inside a grid layer
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
