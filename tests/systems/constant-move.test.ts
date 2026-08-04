import { describe, it, expect } from "vitest";
import { ConstantMoveSystem } from "@/systems/constant-move";
import { getComponent, setComponent } from "@/components";
import type { MovementDirection } from "@/components/movement";
import { doTick } from "@/world";
import { makeWorld, placeCell, withSystems } from "../helpers";

describe("ConstantMoveSystem", () => {
  it("defaults to moving up", () => {
    expect(new ConstantMoveSystem().direction).toBe("up");
  });

  const directions: MovementDirection[] = ["left", "right", "up", "down"];

  it.each(directions)("writes movement { dir: %s }", (dir) => {
    const world = makeWorld(3, 3);
    const cell = placeCell(world, 1, 1);
    const system = new ConstantMoveSystem();
    system.direction = dir;

    system.onCellTick(world, cell);

    expect(getComponent(cell, "movement")).toEqual({ dir });
  });

  it("overwrites an existing movement component", () => {
    const world = makeWorld(3, 3);
    const cell = placeCell(world, 1, 1);
    setComponent(cell, "movement", { dir: "down" });
    const system = new ConstantMoveSystem();
    system.direction = "left";

    system.onCellTick(world, cell);

    expect(getComponent(cell, "movement")).toEqual({ dir: "left" });
  });

  it("writes the intent to every cell on the grid", () => {
    const world = makeWorld(3, 3);
    const system = new ConstantMoveSystem();
    system.direction = "right";
    withSystems(world, system);
    const cells = [
      placeCell(world, 0, 0),
      placeCell(world, 2, 0),
      placeCell(world, 1, 2),
    ];

    doTick(world);

    for (const cell of cells) {
      expect(getComponent(cell, "movement")).toEqual({ dir: "right" });
    }
  });
});
