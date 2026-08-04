import { describe, it, expect, afterEach } from "vitest";
import { doTick } from "@/world";
import { LightSystem } from "@/systems/light";
import { SensorsSystem } from "@/systems/sensors";
import { GenomeSystem } from "@/systems/genome";
import { MovementSystem } from "@/systems/movement";
import { ConstantMoveSystem } from "@/systems/constant-move";
import { TemperatureSystem } from "@/systems/temperature";
import { getComponent, setComponent } from "@/components";
import type { Gene } from "@/components/genome";
import { gridGet } from "@/grid";
import { resetRandom, setRandom } from "@/random";
import { makeWorld, placeCell, scriptedRng, withSystems } from "../helpers";

afterEach(() => resetRandom());

function gene(overrides: Partial<Gene> = {}): Gene {
  return {
    command: "move",
    base: 0,
    skip: 1,
    sensors: { a: 0, b: 0, c: 0, d: 0 },
    ...overrides,
  };
}

/**
 * Draws for one cell in a light+sensors+genome tick: four sensor noise draws,
 * then genome's two noise draws and its execution roll.
 */
function cellDraws(roll: number): number[] {
  return [0, 0, 0, 0, 0.5, 0.5, roll];
}

describe("light -> sensors", () => {
  it("gives cells lower on the grid a stronger light reading", () => {
    const world = makeWorld(2, 8);
    const light = new LightSystem();
    const sensors = new SensorsSystem();
    sensors.noise = 0;
    withSystems(world, light, sensors);

    const top = placeCell(world, 0, 0);
    const bottom = placeCell(world, 1, 7);

    doTick(world);

    expect(getComponent(top, "sensors")!.a).toBe(0);
    expect(getComponent(bottom, "sensors")!.a).toBeGreaterThan(
      getComponent(top, "sensors")!.a
    );
  });

  it("refreshes sensor readings every tick", () => {
    const world = makeWorld(2, 4);
    const sensors = new SensorsSystem();
    sensors.noise = 0;
    withSystems(world, new LightSystem(), sensors);
    const cell = placeCell(world, 0, 2);

    doTick(world);
    const first = getComponent(cell, "sensors")!.a;
    world.layers.light!.data.fill(0);
    doTick(world);

    expect(first).toBeGreaterThan(0);
    expect(getComponent(cell, "sensors")!.a).toBe(0);
  });
});

describe("light -> temperature -> sensors", () => {
  it("derives a cell's temperature from the light layer", () => {
    const world = makeWorld(2, 4);
    const temperature = new TemperatureSystem();
    temperature.sunFactor = 1;
    withSystems(world, new LightSystem(), temperature);
    const cell = placeCell(world, 0, 3);

    doTick(world);

    // Row 3 of 4 -> 191/255 after Uint8 truncation.
    expect(getComponent(cell, "temperature")!.temp).toBeCloseTo(191 / 255);
  });
});

describe("genome -> movement", () => {
  it("moves the cell within a single tick when genome runs first", () => {
    const world = makeWorld(3, 3);
    const genome = new GenomeSystem();
    withSystems(world, genome, new MovementSystem());
    const cell = placeCell(world, 1, 0);
    setComponent(cell, "genome", { ip: 0, genome: [gene()] });
    setRandom(scriptedRng([0.5, 0.5, 0.4]));

    doTick(world);

    expect(cell.position).toEqual({ x: 1, y: 1 });
    expect(gridGet(world.grid, { x: 1, y: 1 })).toBe(cell.id);
    expect(getComponent(cell, "movement")).toBeUndefined();
  });

  it("applies the intent a tick late when movement runs first", () => {
    // movement declares no `after`, so nothing guarantees it runs downstream
    // of the systems that write the movement component. In this order the
    // intent is only consumed on the following tick. See TESTING-BUGS.md.
    const world = makeWorld(3, 3);
    withSystems(world, new MovementSystem(), new GenomeSystem());
    const cell = placeCell(world, 1, 0);
    setComponent(cell, "genome", { ip: 0, genome: [gene({ skip: 0 })] });

    setRandom(scriptedRng([0.5, 0.5, 0.4]));
    doTick(world);
    expect(cell.position).toEqual({ x: 1, y: 0 });
    expect(getComponent(cell, "movement")).toEqual({ dir: "down" });

    setRandom(scriptedRng([0.5, 0.5, 0.6]));
    doTick(world);
    expect(cell.position).toEqual({ x: 1, y: 1 });
  });

  it("does not move a cell whose gene did not fire", () => {
    const world = makeWorld(3, 3);
    withSystems(world, new GenomeSystem(), new MovementSystem());
    const cell = placeCell(world, 1, 0);
    setComponent(cell, "genome", { ip: 0, genome: [gene()] });
    setRandom(scriptedRng([0.5, 0.5, 0.6]));

    doTick(world);

    expect(cell.position).toEqual({ x: 1, y: 0 });
  });
});

describe("sensors -> genome", () => {
  it("lets a sensor reading decide whether a gene fires", () => {
    const world = makeWorld(2, 4);
    const sensors = new SensorsSystem();
    sensors.noise = 0;
    const genome = new GenomeSystem();
    genome.noiseSigma = 0;
    genome.gain = 1;
    withSystems(world, new LightSystem(), sensors, genome, new MovementSystem());

    // A negative base that only a bright light reading can overcome.
    const lightSeeking = gene({
      base: -5,
      sensors: { a: 20, b: 0, c: 0, d: 0 },
    });
    const dark = placeCell(world, 0, 0);
    const bright = placeCell(world, 1, 2);
    setComponent(dark, "genome", { ip: 0, genome: [lightSeeking] });
    setComponent(bright, "genome", { ip: 0, genome: [lightSeeking] });

    // Same execution roll for both cells: only the sensor reading differs.
    setRandom(scriptedRng([...cellDraws(0.4), ...cellDraws(0.4)]));
    doTick(world);

    expect(dark.position).toEqual({ x: 0, y: 0 });
    expect(bright.position).toEqual({ x: 1, y: 3 });
  });
});

describe("constant-move -> movement", () => {
  it("marches a cell one tile per tick when ordered correctly", () => {
    const world = makeWorld(1, 4);
    const constant = new ConstantMoveSystem();
    constant.direction = "down";
    withSystems(world, constant, new MovementSystem());
    const cell = placeCell(world, 0, 0);

    doTick(world);
    expect(cell.position).toEqual({ x: 0, y: 1 });
    doTick(world);
    expect(cell.position).toEqual({ x: 0, y: 2 });
  });

  it("stops at the wall and keeps the stale intent", () => {
    const world = makeWorld(1, 2);
    const constant = new ConstantMoveSystem();
    constant.direction = "down";
    withSystems(world, constant, new MovementSystem());
    const cell = placeCell(world, 0, 1);

    doTick(world);

    expect(cell.position).toEqual({ x: 0, y: 1 });
    expect(getComponent(cell, "movement")).toEqual({ dir: "down" });
  });

  it("does not let two cells occupy the same tile", () => {
    const world = makeWorld(1, 3);
    const constant = new ConstantMoveSystem();
    constant.direction = "down";
    withSystems(world, constant, new MovementSystem());
    placeCell(world, 0, 1);
    placeCell(world, 0, 2);

    doTick(world);
    doTick(world);

    const occupied = Array.from(world.grid.data).filter((id) => id !== -1);
    expect(new Set(occupied).size).toBe(2);
  });
});
