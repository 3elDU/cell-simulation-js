import { describe, it, expect, afterEach } from "vitest";
import { SensorsSystem } from "@/systems/sensors";
import { getComponent } from "@/components";
import { mulberry32, resetRandom, setRandom } from "@/random";
import { lightLayer, makeWorld, placeCell, scriptedRng } from "../helpers";

afterEach(() => resetRandom());

/**
 * Note: the "temperature" sensor type is deliberately not covered here — the
 * switch in valueForSensorType is missing a `break`, so it can never return a
 * temperature. See TESTING-BUGS.md.
 */

describe("SensorsSystem declaration", () => {
  it("runs after the systems it reads from", () => {
    expect(new SensorsSystem().after).toEqual(["light", "temperature"]);
  });

  it("defaults sensor A to light and the rest to none", () => {
    const system = new SensorsSystem();

    expect(system.sensorA).toBe("light");
    expect(system.sensorB).toBe("none");
    expect(system.sensorC).toBe("none");
    expect(system.sensorD).toBe("none");
  });
});

describe("SensorsSystem.valueForSensorType", () => {
  it("returns undefined for light when there is no light layer", () => {
    const world = makeWorld(2, 2);
    const cell = placeCell(world, 0, 0);
    const system = new SensorsSystem();

    expect(system.valueForSensorType(world, cell, "light")).toBeUndefined();
  });

  it("normalizes the light layer to 0..1", () => {
    const world = makeWorld(2, 2);
    lightLayer(world, () => 255);
    const cell = placeCell(world, 0, 0);
    const system = new SensorsSystem();
    system.noise = 0;

    expect(system.valueForSensorType(world, cell, "light")).toBe(1);
  });

  it("reads the light value at the cell's own position", () => {
    const world = makeWorld(2, 2);
    lightLayer(world, (_x, y) => (y === 1 ? 128 : 0));
    const top = placeCell(world, 0, 0);
    const bottom = placeCell(world, 1, 1);
    const system = new SensorsSystem();
    system.noise = 0;

    expect(system.valueForSensorType(world, top, "light")).toBe(0);
    expect(system.valueForSensorType(world, bottom, "light")).toBeCloseTo(
      128 / 255
    );
  });

  it("returns 0 for the none sensor", () => {
    const world = makeWorld(2, 2);
    const cell = placeCell(world, 0, 0);
    const system = new SensorsSystem();
    system.noise = 0;

    expect(system.valueForSensorType(world, cell, "none")).toBe(0);
  });

  it("returns 0 for an unknown sensor type", () => {
    const world = makeWorld(2, 2);
    const cell = placeCell(world, 0, 0);
    const system = new SensorsSystem();
    system.noise = 0;

    expect(system.valueForSensorType(world, cell, "nonsense")).toBe(0);
  });

  it("adds noise scaled by the noise setting, using one draw", () => {
    const world = makeWorld(2, 2);
    lightLayer(world, () => 0);
    const cell = placeCell(world, 0, 0);
    const system = new SensorsSystem();
    system.noise = 0.2;
    setRandom(scriptedRng([0.5]));

    expect(system.valueForSensorType(world, cell, "light")).toBeCloseTo(0.1);
  });

  it("clamps the result to 1", () => {
    const world = makeWorld(2, 2);
    lightLayer(world, () => 255);
    const cell = placeCell(world, 0, 0);
    const system = new SensorsSystem();
    system.noise = 0.5;
    setRandom(scriptedRng([1]));

    expect(system.valueForSensorType(world, cell, "light")).toBe(1);
  });

  it("only ever biases readings upward", () => {
    // Current behavior: noise is `random() * this.noise`, which is
    // non-negative, so it is a positive bias rather than symmetric noise.
    const world = makeWorld(2, 2);
    lightLayer(world, () => 100);
    const cell = placeCell(world, 0, 0);
    const system = new SensorsSystem();
    system.noise = 0.3;
    setRandom(mulberry32(42));

    const baseline = 100 / 255;
    for (let i = 0; i < 50; i++) {
      expect(system.valueForSensorType(world, cell, "light")!).toBeGreaterThan(
        baseline - 1e-9
      );
    }
  });
});

describe("SensorsSystem.onCellTick", () => {
  it("writes all four sensor slots", () => {
    const world = makeWorld(2, 2);
    lightLayer(world, () => 255);
    const cell = placeCell(world, 0, 0);
    const system = new SensorsSystem();
    system.noise = 0;

    system.onCellTick(world, cell);

    expect(getComponent(cell, "sensors")).toEqual({ a: 1, b: 0, c: 0, d: 0 });
  });

  it("routes each slot through its own configured sensor type", () => {
    const world = makeWorld(2, 2);
    lightLayer(world, () => 255);
    const cell = placeCell(world, 0, 0);
    const system = new SensorsSystem();
    system.noise = 0;
    system.sensorA = "none";
    system.sensorD = "light";

    system.onCellTick(world, cell);

    expect(getComponent(cell, "sensors")).toEqual({ a: 0, b: 0, c: 0, d: 1 });
  });

  it("falls back to 0 when a sensor returns undefined", () => {
    // No light layer at all: valueForSensorType returns undefined and the
    // `?? 0` in onCellTick turns it into a reading of 0.
    const world = makeWorld(2, 2);
    const cell = placeCell(world, 0, 0);
    const system = new SensorsSystem();
    system.noise = 0;

    system.onCellTick(world, cell);

    expect(getComponent(cell, "sensors")).toEqual({ a: 0, b: 0, c: 0, d: 0 });
  });

  it("draws randomness once per sensor slot", () => {
    const world = makeWorld(2, 2);
    lightLayer(world, () => 0);
    const cell = placeCell(world, 0, 0);
    const system = new SensorsSystem();
    setRandom(scriptedRng([0, 0, 0, 0]));

    expect(() => system.onCellTick(world, cell)).not.toThrow();
  });

  it("overwrites the previous reading each tick", () => {
    const world = makeWorld(2, 2);
    const layer = lightLayer(world, () => 255);
    const cell = placeCell(world, 0, 0);
    const system = new SensorsSystem();
    system.noise = 0;

    system.onCellTick(world, cell);
    layer.data.fill(0);
    system.onCellTick(world, cell);

    expect(getComponent(cell, "sensors")!.a).toBe(0);
  });
});
