import { describe, it, expect, vi } from "vitest";
import { doTick, newWorld, type World } from "@/world";
import type { Cell } from "@/cell";
import type { System } from "@/systems";
import { gridSet } from "@/grid";
import { makeWorld, placeCell, withSystems } from "./helpers";

/**
 * A minimal system whose hooks are spies.
 */
function spySystem(id: string) {
  return {
    id,
    title: id,
    description: "",
    enabled: true as boolean,
    onInit: vi.fn(),
    onTick: vi.fn(),
    onCellTick: vi.fn(),
  } satisfies System;
}

describe("doTick", () => {
  it("increments the tick counter", () => {
    const world = makeWorld(2, 2);

    doTick(world);
    doTick(world);

    expect(world.tick).toBe(2);
  });

  it("calls onTick once per enabled system, regardless of cell count", () => {
    const world = makeWorld(2, 2);
    const [a, b] = withSystems(world, spySystem("a"), spySystem("b"));
    placeCell(world, 0, 0);
    placeCell(world, 1, 1);

    doTick(world);

    expect(a.onTick).toHaveBeenCalledTimes(1);
    expect(b.onTick).toHaveBeenCalledTimes(1);
    expect(a.onTick).toHaveBeenCalledWith(world);
  });

  it("calls onCellTick once per occupied tile, per system", () => {
    const world = makeWorld(3, 3);
    const [system] = withSystems(world, spySystem("a"));
    const first = placeCell(world, 0, 0);
    const second = placeCell(world, 2, 2);

    doTick(world);

    expect(system.onCellTick).toHaveBeenCalledTimes(2);
    const ticked = system.onCellTick.mock.calls.map(([, cell]) => cell);
    expect(ticked).toContain(first);
    expect(ticked).toContain(second);
  });

  it("runs systems in world.systems order for each cell", () => {
    const world = makeWorld(2, 2);
    const order: string[] = [];
    const make = (id: string): System => ({
      id,
      title: id,
      description: "",
      enabled: true,
      onCellTick: () => order.push(id),
    });

    withSystems(world, make("first"), make("second"), make("third"));
    placeCell(world, 0, 0);

    doTick(world);

    expect(order).toEqual(["first", "second", "third"]);
  });

  it("skips disabled systems entirely", () => {
    const world = makeWorld(2, 2);
    const [system] = withSystems(world, spySystem("a"));
    placeCell(world, 0, 0);
    system.enabled = false;

    doTick(world);

    expect(system.onTick).not.toHaveBeenCalled();
    expect(system.onCellTick).not.toHaveBeenCalled();
  });

  it("does not tick a cell twice when a system moves it forward", () => {
    // The grid is walked in raw index order. A cell moved to a later index
    // would be visited again if not for the `internal.processed` flag.
    const world = makeWorld(3, 1);
    const cell = placeCell(world, 0, 0);

    let ticks = 0;
    const mover: System = {
      id: "mover",
      title: "mover",
      description: "",
      enabled: true,
      onCellTick: (w: World, c: Cell) => {
        ticks++;
        gridSet(w.grid, c.position, -1);
        c.position = { x: c.position.x + 1, y: 0 };
        gridSet(w.grid, c.position, c.id);
      },
    };
    withSystems(world, mover);

    doTick(world);

    expect(ticks).toBe(1);
    expect(cell.position).toEqual({ x: 1, y: 0 });
  });

  it("clears the internal component after the tick", () => {
    const world = makeWorld(2, 2);
    withSystems(world, spySystem("a"));
    const cell = placeCell(world, 0, 0);

    doTick(world);

    expect(cell.components.internal).toBeUndefined();
  });

  it("sets the processed flag while systems are running", () => {
    const world = makeWorld(2, 2);
    const seen: unknown[] = [];
    withSystems(
      world,
      {
        id: "first",
        title: "first",
        description: "",
        enabled: true,
        onCellTick: (_w: World, c: Cell) =>
          seen.push(c.components.internal?.processed),
      },
      {
        id: "second",
        title: "second",
        description: "",
        enabled: true,
        onCellTick: (_w: World, c: Cell) =>
          seen.push(c.components.internal?.processed),
      }
    );
    placeCell(world, 0, 0);

    doTick(world);

    // The flag is assigned after the first system runs, so the first system
    // sees it unset and every later one sees it set.
    expect(seen).toEqual([undefined, true]);
  });

  it("does not choke on an empty grid", () => {
    const world = makeWorld(2, 2);
    withSystems(world, spySystem("a"));

    expect(() => doTick(world)).not.toThrow();
    expect(world.tick).toBe(1);
  });
});

describe("newWorld", () => {
  it("creates an empty grid filled with -1", () => {
    const world = newWorld(3, 2);

    expect(world.grid.width).toBe(3);
    expect(world.grid.height).toBe(2);
    expect(Array.from(world.grid.data)).toEqual([-1, -1, -1, -1, -1, -1]);
    expect(world.cells.size).toBe(0);
    expect(world.tick).toBe(0);
  });

  it("instantiates every registered system", () => {
    const world = newWorld(4, 4);

    const ids = world.systems.map((system) => system.id).sort();
    expect(ids).toEqual(
      [
        "cell-generator",
        "genome",
        "light",
        "movement",
        "sensors",
        "sys-constant-move",
        "temperature",
      ].sort()
    );
  });

  it("starts every system disabled", () => {
    const world = newWorld(4, 4);

    expect(world.systems.every((system) => !system.enabled)).toBe(true);
  });

  it("runs onInit even on disabled systems", () => {
    // This is why a fresh world already has a light layer: LightSystem.onInit
    // populates it despite the system being disabled.
    const world = newWorld(4, 4);

    expect(world.layers.light).toBeDefined();
    expect(world.layers.light!.data.length).toBe(16);
  });

  it("gives each world its own system instances", () => {
    const a = newWorld(2, 2);
    const b = newWorld(2, 2);

    expect(a.systems[0]).not.toBe(b.systems[0]);
  });
});
