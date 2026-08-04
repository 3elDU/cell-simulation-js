import { describe, it, expect } from "vitest";
import {
  gridEvery,
  gridGet,
  gridMaybeGet,
  gridSet,
  type GridLayer,
} from "@/grid";

function layer(width: number, height: number): GridLayer<Int32Array> {
  return { width, height, data: new Int32Array(width * height) };
}

describe("gridSet / gridGet", () => {
  it("indexes as y * width + x", () => {
    const grid = layer(4, 3);

    gridSet(grid, { x: 2, y: 1 }, 42);

    expect(grid.data[1 * 4 + 2]).toBe(42);
    expect(gridGet(grid, { x: 2, y: 1 })).toBe(42);
  });

  it("round-trips every position independently", () => {
    const grid = layer(3, 3);

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        gridSet(grid, { x, y }, y * 10 + x);
      }
    }

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        expect(gridGet(grid, { x, y })).toBe(y * 10 + x);
      }
    }
  });

  it("returns undefined only past the end of the backing array", () => {
    const grid = layer(4, 3);

    expect(gridGet(grid, { x: 0, y: 3 })).toBeUndefined();
    expect(gridGet(grid, { x: 0, y: 100 })).toBeUndefined();
  });

  it("does not bounds-check x: a negative x reads the previous row", () => {
    // Documented current behavior, not necessarily desirable — there is no
    // bounds checking anywhere in grid.ts, so x just folds into the index.
    const grid = layer(4, 3);
    gridSet(grid, { x: 3, y: 0 }, 7);

    expect(gridGet(grid, { x: -1, y: 1 })).toBe(7);
  });
});

describe("gridMaybeGet", () => {
  it("returns the value when the position is in range", () => {
    const grid = layer(2, 2);
    gridSet(grid, { x: 1, y: 1 }, 9);

    expect(gridMaybeGet(grid, { x: 1, y: 1 }, -5)).toBe(9);
  });

  it("falls back when the grid is undefined", () => {
    expect(gridMaybeGet(undefined, { x: 0, y: 0 }, -5)).toBe(-5);
  });

  it("falls back when the position is past the end", () => {
    expect(gridMaybeGet(layer(2, 2), { x: 0, y: 5 }, -5)).toBe(-5);
  });

  it("defaults the fallback to 0", () => {
    expect(gridMaybeGet(undefined, { x: 0, y: 0 })).toBe(0);
  });
});

describe("gridEvery", () => {
  it("visits x-outer, y-inner", () => {
    const grid = layer(2, 2);
    grid.data.fill(1);

    const visited: [number, number][] = [];
    gridEvery(grid, (x, y) => visited.push([x, y]));

    expect(visited).toEqual([
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ]);
  });

  it("passes the value at each position", () => {
    const grid = layer(2, 1);
    gridSet(grid, { x: 0, y: 0 }, 11);
    gridSet(grid, { x: 1, y: 0 }, 22);

    const seen: number[] = [];
    gridEvery(grid, (_x, _y, value) => seen.push(value));

    expect(seen).toEqual([11, 22]);
  });

  it("skips -1", () => {
    const grid = layer(2, 1);
    grid.data.fill(-1);
    gridSet(grid, { x: 1, y: 0 }, 5);

    const seen: number[] = [];
    gridEvery(grid, (_x, _y, value) => seen.push(value));

    expect(seen).toEqual([5]);
  });

  it("also skips 0, not just -1", () => {
    // The guard is `if (val && val !== -1)`, so 0 is falsy and gets skipped.
    // Cell ids start at 1 today, so nothing depends on 0 being visited — but
    // that is a coupling, not a guarantee.
    const grid = layer(2, 1);
    gridSet(grid, { x: 0, y: 0 }, 0);
    gridSet(grid, { x: 1, y: 0 }, 5);

    const seen: number[] = [];
    gridEvery(grid, (_x, _y, value) => seen.push(value));

    expect(seen).toEqual([5]);
  });
});
