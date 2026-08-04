import { describe, it, expect } from "vitest";
import { TemperatureSystem } from "@/systems/temperature";
import type { System } from "@/systems";
import { getComponent } from "@/components";
import { lightLayer, makeWorld, placeCell } from "../helpers";

/**
 * Only the light-driven half of the temperature formula is covered here.
 * `countNonEmptyNeighbors` is broken by operator precedence and always
 * returns 0, so the crowding term contributes nothing — see TESTING-BUGS.md.
 */

describe("TemperatureSystem", () => {
  it("declares no ordering constraints", () => {
    expect((new TemperatureSystem() as System).after).toBeUndefined();
  });

  it("writes a temperature component", () => {
    const world = makeWorld(3, 3);
    const cell = placeCell(world, 1, 1);

    new TemperatureSystem().onCellTick(world, cell);

    expect(getComponent(cell, "temperature")).toBeDefined();
  });

  it("is 0 with no light layer and no crowding contribution", () => {
    const world = makeWorld(3, 3);
    const cell = placeCell(world, 1, 1);

    new TemperatureSystem().onCellTick(world, cell);

    expect(getComponent(cell, "temperature")!.temp).toBe(0);
  });

  it("scales the normalized light value by sunFactor", () => {
    const world = makeWorld(3, 3);
    lightLayer(world, () => 255);
    const cell = placeCell(world, 1, 1);
    const system = new TemperatureSystem();
    system.sunFactor = 0.3;

    system.onCellTick(world, cell);

    expect(getComponent(cell, "temperature")!.temp).toBeCloseTo(0.3);
  });

  it("reads light at the cell's own position", () => {
    const world = makeWorld(2, 2);
    lightLayer(world, (_x, y) => (y === 1 ? 255 : 0));
    const top = placeCell(world, 0, 0);
    const bottom = placeCell(world, 1, 1);
    const system = new TemperatureSystem();
    system.sunFactor = 1;

    system.onCellTick(world, top);
    system.onCellTick(world, bottom);

    expect(getComponent(top, "temperature")!.temp).toBe(0);
    expect(getComponent(bottom, "temperature")!.temp).toBe(1);
  });

  it("responds proportionally to sunFactor", () => {
    const world = makeWorld(3, 3);
    lightLayer(world, () => 128);
    const cell = placeCell(world, 1, 1);
    const system = new TemperatureSystem();

    system.sunFactor = 0.5;
    system.onCellTick(world, cell);
    const half = getComponent(cell, "temperature")!.temp;

    system.sunFactor = 1;
    system.onCellTick(world, cell);
    const full = getComponent(cell, "temperature")!.temp;

    expect(full).toBeCloseTo(half * 2);
  });

  it("recomputes on every tick", () => {
    const world = makeWorld(3, 3);
    const layer = lightLayer(world, () => 0);
    const cell = placeCell(world, 1, 1);
    const system = new TemperatureSystem();
    system.sunFactor = 1;

    system.onCellTick(world, cell);
    expect(getComponent(cell, "temperature")!.temp).toBe(0);

    layer.data.fill(255);
    system.onCellTick(world, cell);
    expect(getComponent(cell, "temperature")!.temp).toBe(1);
  });

  it("ignores crowdingFactor entirely today", () => {
    // Pinning the effect of the countNonEmptyNeighbors bug: a cell fully
    // surrounded by neighbors gets the same temperature as an isolated one.
    const world = makeWorld(3, 3);
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        placeCell(world, x, y);
      }
    }
    const crowded = world.cells.get(
      world.grid.data[1 * 3 + 1]!
    )!;
    const system = new TemperatureSystem();
    system.crowdingFactor = 1;
    system.sunFactor = 0;

    system.onCellTick(world, crowded);

    expect(getComponent(crowded, "temperature")!.temp).toBe(0);
  });
});

describe("TemperatureSystem.countNonEmptyNeighbors", () => {
  it("always returns 0, even when every neighbor is occupied", () => {
    // `gridGet(...) ?? -1 !== -1` parses as `gridGet(...) ?? (-1 !== -1)`,
    // so the mapped values are numbers or `false` and the subsequent
    // `=== true` filter never matches. See TESTING-BUGS.md.
    const world = makeWorld(3, 3);
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        placeCell(world, x, y);
      }
    }

    const count = new TemperatureSystem().countNonEmptyNeighbors(world, {
      x: 1,
      y: 1,
    });

    expect(count).toBe(0);
  });
});
