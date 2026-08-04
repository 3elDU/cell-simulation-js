import { describe, it, expect, afterEach } from "vitest";
import { GenomeSystem } from "@/systems/genome";
import { getComponent, setComponent } from "@/components";
import type { Command, Gene } from "@/components/genome";
import { resetRandom, setRandom } from "@/random";
import { makeWorld, placeCell, scriptedRng } from "../helpers";

afterEach(() => resetRandom());

function gene(overrides: Partial<Gene> = {}): Gene {
  return {
    command: "noop",
    base: 0,
    skip: 1,
    sensors: { a: 0, b: 0, c: 0, d: 0 },
    ...overrides,
  };
}

/**
 * The two noise draws cancel out at 0.5 each, so activation stays exactly at
 * `base`. The third value is the execution roll.
 */
function decideWith(roll: number) {
  setRandom(scriptedRng([0.5, 0.5, roll]));
}

describe("GenomeSystem.sigmoid", () => {
  it("is 0.5 at zero", () => {
    expect(new GenomeSystem().sigmoid(0)).toBe(0.5);
  });

  it("is symmetric about 0.5", () => {
    const system = new GenomeSystem();

    expect(system.sigmoid(2) + system.sigmoid(-2)).toBeCloseTo(1);
  });

  it("is monotonically increasing", () => {
    const system = new GenomeSystem();
    const values = [-4, -1, 0, 1, 4].map((x) => system.sigmoid(x));

    for (let i = 1; i < values.length; i++) {
      expect(values[i]!).toBeGreaterThan(values[i - 1]!);
    }
  });

  it("saturates towards 0 and 1", () => {
    const system = new GenomeSystem();

    expect(system.sigmoid(-50)).toBeCloseTo(0);
    expect(system.sigmoid(50)).toBeCloseTo(1);
  });
});

describe("GenomeSystem.instructionShouldExecute", () => {
  it("declares that it runs after sensors", () => {
    expect(new GenomeSystem().after).toEqual(["sensors"]);
  });

  it("consumes exactly three random draws", () => {
    const system = new GenomeSystem();
    setRandom(scriptedRng([0.5, 0.5, 0.5]));

    expect(() => system.instructionShouldExecute(gene())).not.toThrow();
  });

  it("executes when the roll lands under the probability", () => {
    const system = new GenomeSystem();
    // base 0 -> probability 0.5
    decideWith(0.4);

    expect(system.instructionShouldExecute(gene())).toBe(true);
  });

  it("does not execute when the roll lands above the probability", () => {
    const system = new GenomeSystem();
    decideWith(0.6);

    expect(system.instructionShouldExecute(gene())).toBe(false);
  });

  it("uses base alone when there is no sensors component", () => {
    const system = new GenomeSystem();
    system.gain = 1;
    // A strongly negative base makes the probability tiny.
    decideWith(0.4);

    expect(system.instructionShouldExecute(gene({ base: -10 }))).toBe(false);
  });

  it("combines base with the weighted sensor readings", () => {
    const system = new GenomeSystem();
    system.gain = 1;
    const sensors = { a: 1, b: 1, c: 0, d: 0 };

    // base -10, but sensor a contributes +20 -> activation +10
    decideWith(0.4);
    const withSensors = system.instructionShouldExecute(
      gene({ base: -10, sensors: { a: 20, b: 0, c: 0, d: 0 } }),
      sensors
    );

    expect(withSensors).toBe(true);
  });

  it("weighs each sensor by its own gene weight", () => {
    const system = new GenomeSystem();
    system.noiseSigma = 0;
    system.gain = 1;
    const sensors = { a: 0.5, b: 0.5, c: 0.5, d: 0.5 };
    // activation = 0 + 0.5*1 + 0.5*1 + 0.5*(-1) + 0.5*(-1) = 0
    const balanced = gene({ sensors: { a: 1, b: 1, c: -1, d: -1 } });

    setRandom(scriptedRng([0.5, 0.5, 0.49]));
    expect(system.instructionShouldExecute(balanced, sensors)).toBe(true);

    setRandom(scriptedRng([0.5, 0.5, 0.51]));
    expect(system.instructionShouldExecute(balanced, sensors)).toBe(false);
  });

  it("still draws noise when noiseSigma is 0, but it has no effect", () => {
    const system = new GenomeSystem();
    system.noiseSigma = 0;
    // Extreme noise draws that would otherwise dominate.
    setRandom(scriptedRng([1, 1, 0.49]));

    expect(system.instructionShouldExecute(gene())).toBe(true);
  });

  it("scales the activation by gain", () => {
    const system = new GenomeSystem();
    system.noiseSigma = 0;
    const positive = gene({ base: 0.5 });

    system.gain = 0;
    setRandom(scriptedRng([0.5, 0.5, 0.6]));
    expect(system.instructionShouldExecute(positive)).toBe(false);

    system.gain = 10;
    setRandom(scriptedRng([0.5, 0.5, 0.6]));
    expect(system.instructionShouldExecute(positive)).toBe(true);
  });
});

describe("GenomeSystem.onCellTick", () => {
  it("is a no-op without a genome component", () => {
    const world = makeWorld(3, 3);
    const cell = placeCell(world, 1, 1);

    new GenomeSystem().onCellTick(world, cell);

    expect(getComponent(cell, "movement")).toBeUndefined();
  });

  it("writes a movement intent for an executed move gene", () => {
    const world = makeWorld(3, 3);
    const cell = placeCell(world, 1, 1);
    setComponent(cell, "genome", {
      ip: 0,
      genome: [gene({ command: "move" })],
    });
    decideWith(0.4);

    new GenomeSystem().onCellTick(world, cell);

    expect(getComponent(cell, "movement")).toEqual({ dir: "down" });
  });

  it("does not write movement when the gene does not fire", () => {
    const world = makeWorld(3, 3);
    const cell = placeCell(world, 1, 1);
    setComponent(cell, "genome", {
      ip: 0,
      genome: [gene({ command: "move" })],
    });
    decideWith(0.6);

    new GenomeSystem().onCellTick(world, cell);

    expect(getComponent(cell, "movement")).toBeUndefined();
  });

  const inertCommands: Command[] = ["noop", "left", "right"];

  it.each(inertCommands)("does nothing for the %s command", (command) => {
    // Only "move" is implemented; the rest are parsed but have no effect.
    const world = makeWorld(3, 3);
    const cell = placeCell(world, 1, 1);
    setComponent(cell, "genome", { ip: 0, genome: [gene({ command })] });
    decideWith(0.4);

    new GenomeSystem().onCellTick(world, cell);

    expect(getComponent(cell, "movement")).toBeUndefined();
  });

  it("advances ip by 1 when the gene does not fire", () => {
    const world = makeWorld(3, 3);
    const cell = placeCell(world, 1, 1);
    setComponent(cell, "genome", {
      ip: 0,
      genome: [gene({ skip: 3 }), gene(), gene(), gene()],
    });
    decideWith(0.6);

    new GenomeSystem().onCellTick(world, cell);

    expect(getComponent(cell, "genome")!.ip).toBe(1);
  });

  it("advances ip by skip when the gene fires", () => {
    // Note this is the opposite of what the Gene.skip docstring describes
    // ("how many instructions to skip, if this instruction is not fired").
    const world = makeWorld(3, 3);
    const cell = placeCell(world, 1, 1);
    setComponent(cell, "genome", {
      ip: 0,
      genome: [gene({ skip: 3 }), gene(), gene(), gene()],
    });
    decideWith(0.4);

    new GenomeSystem().onCellTick(world, cell);

    expect(getComponent(cell, "genome")!.ip).toBe(3);
  });

  it("leaves ip in place for a firing gene with skip 0", () => {
    const world = makeWorld(3, 3);
    const cell = placeCell(world, 1, 1);
    setComponent(cell, "genome", {
      ip: 0,
      genome: [gene({ skip: 0 }), gene()],
    });

    const system = new GenomeSystem();
    decideWith(0.4);
    system.onCellTick(world, cell);
    decideWith(0.4);
    system.onCellTick(world, cell);

    expect(getComponent(cell, "genome")!.ip).toBe(0);
  });

  it("wraps ip around the end of the genome", () => {
    const world = makeWorld(3, 3);
    const cell = placeCell(world, 1, 1);
    setComponent(cell, "genome", { ip: 2, genome: [gene(), gene(), gene()] });
    decideWith(0.6);

    new GenomeSystem().onCellTick(world, cell);

    expect(getComponent(cell, "genome")!.ip).toBe(0);
  });

  it("reads the gene at the current ip, not always the first", () => {
    const world = makeWorld(3, 3);
    const cell = placeCell(world, 1, 1);
    setComponent(cell, "genome", {
      ip: 1,
      genome: [gene({ command: "noop" }), gene({ command: "move" })],
    });
    decideWith(0.4);

    new GenomeSystem().onCellTick(world, cell);

    expect(getComponent(cell, "movement")).toEqual({ dir: "down" });
  });

  it("can leave ip out of range when skip overshoots a short genome", () => {
    // Wrap-around subtracts the genome length only once, so ip = 1 + 3 = 4
    // on a 2-gene genome lands at 2, which is still out of range.
    const world = makeWorld(3, 3);
    const cell = placeCell(world, 1, 1);
    setComponent(cell, "genome", {
      ip: 1,
      genome: [gene(), gene({ skip: 3 })],
    });
    decideWith(0.4);

    new GenomeSystem().onCellTick(world, cell);

    expect(getComponent(cell, "genome")!.ip).toBe(2);
  });

  it("throws on an empty genome", () => {
    const world = makeWorld(3, 3);
    const cell = placeCell(world, 1, 1);
    setComponent(cell, "genome", { ip: 0, genome: [] });
    decideWith(0.4);

    expect(() => new GenomeSystem().onCellTick(world, cell)).toThrow();
  });
});
