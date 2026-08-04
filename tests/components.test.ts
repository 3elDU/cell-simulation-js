import { describe, it, expect } from "vitest";
import { getComponent, setComponent } from "@/components";
import type { Cell } from "@/cell";

function emptyCell(): Cell {
  return { id: 1, position: { x: 0, y: 0 }, components: {} };
}

describe("getComponent", () => {
  it("returns undefined when the component is absent", () => {
    expect(getComponent(emptyCell(), "movement")).toBeUndefined();
  });

  it("returns the exact object that was set", () => {
    const cell = emptyCell();
    const movement = { dir: "left" } as const;

    setComponent(cell, "movement", movement);

    expect(getComponent(cell, "movement")).toBe(movement);
  });
});

describe("setComponent", () => {
  it("round-trips every registered component shape", () => {
    const cell = emptyCell();

    setComponent(cell, "movement", { dir: "up" });
    setComponent(cell, "sensors", { a: 0.1, b: 0.2, c: 0.3, d: 0.4 });
    setComponent(cell, "temperature", { temp: 0.5 });
    setComponent(cell, "hormones", { stress: 0.6 });
    setComponent(cell, "signals", { alpha: 1, beta: 2, gamma: 3, delta: 4 });
    setComponent(cell, "genome", { ip: 0, genome: [] });

    expect(getComponent(cell, "movement")).toEqual({ dir: "up" });
    expect(getComponent(cell, "sensors")).toEqual({
      a: 0.1,
      b: 0.2,
      c: 0.3,
      d: 0.4,
    });
    expect(getComponent(cell, "temperature")).toEqual({ temp: 0.5 });
    expect(getComponent(cell, "hormones")).toEqual({ stress: 0.6 });
    expect(getComponent(cell, "signals")).toEqual({
      alpha: 1,
      beta: 2,
      gamma: 3,
      delta: 4,
    });
    expect(getComponent(cell, "genome")).toEqual({ ip: 0, genome: [] });
  });

  it("overwrites an existing component", () => {
    const cell = emptyCell();

    setComponent(cell, "movement", { dir: "up" });
    setComponent(cell, "movement", { dir: "down" });

    expect(getComponent(cell, "movement")).toEqual({ dir: "down" });
  });

  it("leaves other components untouched", () => {
    const cell = emptyCell();

    setComponent(cell, "movement", { dir: "up" });
    setComponent(cell, "temperature", { temp: 0.5 });

    expect(getComponent(cell, "movement")).toEqual({ dir: "up" });
  });

  it("makes a deleted component read as absent again", () => {
    const cell = emptyCell();
    setComponent(cell, "movement", { dir: "up" });

    delete cell.components.movement;

    expect(getComponent(cell, "movement")).toBeUndefined();
  });
});
