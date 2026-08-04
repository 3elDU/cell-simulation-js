import { describe, it, expect } from "vitest";
import { LightSystem } from "@/systems/light";
import type { System } from "@/systems";
import { gridGet, type GridLayer } from "@/grid";
import { makeWorld } from "../helpers";

describe("LightSystem.luminanceForPosition", () => {
  it("is a vertical gradient: 0 at the top row", () => {
    const world = makeWorld(4, 8);

    expect(new LightSystem().luminanceForPosition(0, 0, world)).toBe(0);
  });

  it("scales linearly with y / height", () => {
    const world = makeWorld(4, 10);
    const system = new LightSystem();

    expect(system.luminanceForPosition(0, 5, world)).toBeCloseTo(127.5);
    expect(system.luminanceForPosition(0, 9, world)).toBeCloseTo(229.5);
  });

  it("does not depend on x", () => {
    const world = makeWorld(4, 8);
    const system = new LightSystem();

    const values = [0, 1, 2, 3].map((x) =>
      system.luminanceForPosition(x, 3, world)
    );

    expect(new Set(values).size).toBe(1);
  });
});

describe("LightSystem.onInit", () => {
  it("creates a light layer matching the world size", () => {
    const world = makeWorld(4, 8);

    new LightSystem().onInit(world);

    const layer = world.layers.light as GridLayer<Uint8Array>;
    expect(layer.width).toBe(4);
    expect(layer.height).toBe(8);
    expect(layer.data.length).toBe(32);
    expect(layer.data).toBeInstanceOf(Uint8Array);
  });

  it("reuses an existing layer object instead of replacing it", () => {
    const world = makeWorld(4, 8);
    const existing: GridLayer<Uint8Array> = {
      width: 4,
      height: 8,
      data: new Uint8Array(32),
    };
    world.layers.light = existing;

    new LightSystem().onInit(world);

    expect(world.layers.light).toBe(existing);
  });

  it("writes the gradient into the layer", () => {
    const world = makeWorld(2, 4);

    new LightSystem().onInit(world);

    const layer = world.layers.light as GridLayer<Uint8Array>;
    // Uint8Array truncates, so (y / 4) * 255 becomes 0, 63, 127, 191.
    expect(gridGet(layer, { x: 0, y: 0 })).toBe(0);
    expect(gridGet(layer, { x: 0, y: 1 })).toBe(63);
    expect(gridGet(layer, { x: 0, y: 2 })).toBe(127);
    expect(gridGet(layer, { x: 0, y: 3 })).toBe(191);
  });

  it("never reaches 255, since the gradient is over y / height", () => {
    const world = makeWorld(1, 16);

    new LightSystem().onInit(world);

    const layer = world.layers.light as GridLayer<Uint8Array>;
    expect(Math.max(...layer.data)).toBeLessThan(255);
  });

  it("is idempotent", () => {
    const world = makeWorld(3, 5);
    const system = new LightSystem();

    system.onInit(world);
    const first = Array.from((world.layers.light as GridLayer<Uint8Array>).data);
    system.onInit(world);
    const second = Array.from(
      (world.layers.light as GridLayer<Uint8Array>).data
    );

    expect(second).toEqual(first);
  });
});

describe("LightSystem lifecycle", () => {
  it("has no per-tick behavior, so light is static after init", () => {
    const system: System = new LightSystem();

    expect(system.onTick).toBeUndefined();
    expect(system.onCellTick).toBeUndefined();
  });
});
