import { describe, it, expect } from "vitest";
import { addCell, getCell } from "@/cell";
import { gridGet } from "@/grid";
import { makeWorld } from "./helpers";

describe("addCell", () => {
  it("returns a cell positioned where it was asked for", () => {
    const world = makeWorld(4, 4);

    const cell = addCell(world, 2, 3);

    expect(cell.position).toEqual({ x: 2, y: 3 });
    expect(cell.components).toEqual({});
  });

  it("writes the cell id into the grid and the cells map", () => {
    const world = makeWorld(4, 4);

    const cell = addCell(world, 1, 2);

    expect(gridGet(world.grid, { x: 1, y: 2 })).toBe(cell.id);
    expect(world.cells.get(cell.id)).toBe(cell);
  });

  it("hands out ids starting at 1, incrementing per cell", () => {
    const world = makeWorld(4, 4);

    expect(addCell(world, 0, 0).id).toBe(1);
    expect(addCell(world, 1, 0).id).toBe(2);
    expect(addCell(world, 2, 0).id).toBe(3);
  });

  it("derives the id from cells.size, so ids collide after a removal", () => {
    // Current behavior: `const id = world.cells.size + 1`. Nothing removes
    // cells today, but the moment something does, ids are reused.
    const world = makeWorld(4, 4);

    const first = addCell(world, 0, 0);
    const second = addCell(world, 1, 0);
    world.cells.delete(first.id);

    const third = addCell(world, 2, 0);

    expect(third.id).toBe(second.id);
    expect(world.cells.get(second.id)).toBe(third);
  });

  it("overwrites an occupied tile, orphaning the previous cell", () => {
    const world = makeWorld(4, 4);

    const first = addCell(world, 1, 1);
    const second = addCell(world, 1, 1);

    expect(gridGet(world.grid, { x: 1, y: 1 })).toBe(second.id);
    // The first cell is still in the map but no longer on the grid.
    expect(world.cells.get(first.id)).toBe(first);
  });
});

describe("getCell", () => {
  it("finds a cell that was added", () => {
    const world = makeWorld(4, 4);
    const cell = addCell(world, 3, 1);

    expect(getCell(world, 3, 1)).toBe(cell);
  });

  it("returns undefined for an empty tile", () => {
    const world = makeWorld(4, 4);
    addCell(world, 0, 0);

    expect(getCell(world, 3, 3)).toBeUndefined();
  });

  it("returns undefined past the end of the grid", () => {
    const world = makeWorld(4, 4);

    expect(getCell(world, 0, 10)).toBeUndefined();
  });
});
