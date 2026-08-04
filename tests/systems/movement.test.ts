import { describe, it, expect } from "vitest";
import { MovementSystem } from "@/systems/movement";
import type { System } from "@/systems";
import { getComponent, setComponent } from "@/components";
import { gridGet } from "@/grid";
import type { MovementDirection } from "@/components/movement";
import { makeWorld, placeCell } from "../helpers";

describe("MovementSystem", () => {
  it("declares no ordering constraints", () => {
    expect((new MovementSystem() as System).after).toBeUndefined();
  });

  it("is a no-op without a movement component", () => {
    const world = makeWorld(3, 3);
    const cell = placeCell(world, 1, 1);

    new MovementSystem().onCellTick(world, cell);

    expect(cell.position).toEqual({ x: 1, y: 1 });
    expect(gridGet(world.grid, { x: 1, y: 1 })).toBe(cell.id);
  });

  const moves: [MovementDirection, number, number][] = [
    ["left", 0, 1],
    ["right", 2, 1],
    ["up", 1, 0],
    ["down", 1, 2],
  ];

  it.each(moves)("moves one tile %s", (dir, x, y) => {
    const world = makeWorld(3, 3);
    const cell = placeCell(world, 1, 1);
    setComponent(cell, "movement", { dir });

    new MovementSystem().onCellTick(world, cell);

    expect(cell.position).toEqual({ x, y });
  });

  it("updates both the grid and the cell position", () => {
    const world = makeWorld(3, 3);
    const cell = placeCell(world, 1, 1);
    setComponent(cell, "movement", { dir: "right" });

    new MovementSystem().onCellTick(world, cell);

    expect(gridGet(world.grid, { x: 2, y: 1 })).toBe(cell.id);
    expect(gridGet(world.grid, { x: 1, y: 1 })).toBe(-1);
  });

  it("clears the movement component after a successful move", () => {
    const world = makeWorld(3, 3);
    const cell = placeCell(world, 1, 1);
    setComponent(cell, "movement", { dir: "right" });

    new MovementSystem().onCellTick(world, cell);

    expect(getComponent(cell, "movement")).toBeUndefined();
  });

  it("aborts when the target tile is occupied", () => {
    const world = makeWorld(3, 3);
    const cell = placeCell(world, 1, 1);
    const blocker = placeCell(world, 2, 1);
    setComponent(cell, "movement", { dir: "right" });

    new MovementSystem().onCellTick(world, cell);

    expect(cell.position).toEqual({ x: 1, y: 1 });
    expect(gridGet(world.grid, { x: 1, y: 1 })).toBe(cell.id);
    expect(gridGet(world.grid, { x: 2, y: 1 })).toBe(blocker.id);
  });

  const walls: [MovementDirection, number, number][] = [
    ["left", 0, 1],
    ["right", 2, 1],
    ["up", 1, 0],
    ["down", 1, 2],
  ];

  it.each(walls)("stays put when moving %s into a wall", (dir, x, y) => {
    // Out-of-bounds targets are clamped rather than wrapped. Clamping at a
    // wall produces the cell's own position, so canMoveTo finds the cell
    // itself and the move aborts.
    const world = makeWorld(3, 3);
    const cell = placeCell(world, x, y);
    setComponent(cell, "movement", { dir });

    new MovementSystem().onCellTick(world, cell);

    expect(cell.position).toEqual({ x, y });
    expect(gridGet(world.grid, { x, y })).toBe(cell.id);
  });

  it("leaves the movement component set when a move is aborted", () => {
    // Current behavior: the component is only deleted on success, so a
    // blocked intent carries over into the next tick.
    const world = makeWorld(3, 3);
    const cell = placeCell(world, 1, 1);
    placeCell(world, 2, 1);
    setComponent(cell, "movement", { dir: "right" });

    new MovementSystem().onCellTick(world, cell);

    expect(getComponent(cell, "movement")).toEqual({ dir: "right" });
  });

  it("lets a cell move into a tile another cell just vacated", () => {
    const world = makeWorld(3, 1);
    const leader = placeCell(world, 1, 0);
    const follower = placeCell(world, 0, 0);
    setComponent(leader, "movement", { dir: "right" });
    setComponent(follower, "movement", { dir: "right" });

    const system = new MovementSystem();
    system.onCellTick(world, leader);
    system.onCellTick(world, follower);

    expect(leader.position).toEqual({ x: 2, y: 0 });
    expect(follower.position).toEqual({ x: 1, y: 0 });
    expect(gridGet(world.grid, { x: 0, y: 0 })).toBe(-1);
  });
});

describe("MovementSystem.canMoveTo", () => {
  it("is true for an empty tile", () => {
    const world = makeWorld(3, 3);

    expect(new MovementSystem().canMoveTo(world, { x: 0, y: 0 })).toBe(true);
  });

  it("is false for an occupied tile", () => {
    const world = makeWorld(3, 3);
    placeCell(world, 0, 0);

    expect(new MovementSystem().canMoveTo(world, { x: 0, y: 0 })).toBe(false);
  });
});
