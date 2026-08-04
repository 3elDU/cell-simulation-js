import { describe, it, expect, afterEach } from "vitest";
import { CellGenerator } from "@/systems/cell-generator";
import { getComponent } from "@/components";
import { mulberry32, resetRandom, setRandom } from "@/random";
import { makeWorld, gridSnapshot } from "../helpers";

afterEach(() => resetRandom());

function generator(world: ReturnType<typeof makeWorld>) {
  const system = new CellGenerator();
  system.onInit(world);
  return system;
}

describe("CellGenerator.generate", () => {
  it("does nothing when onInit was never called", () => {
    const system = new CellGenerator();

    expect(() => system.generate()).not.toThrow();
  });

  it("creates no cells when the chance is 0", () => {
    setRandom(mulberry32(1));
    const world = makeWorld(5, 5);
    const system = generator(world);
    system.generationChance = 0;

    system.generate();

    expect(world.cells.size).toBe(0);
  });

  it("fills every tile when the chance is 1", () => {
    setRandom(mulberry32(1));
    const world = makeWorld(4, 3);
    const system = generator(world);
    system.generationChance = 1;

    system.generate();

    expect(world.cells.size).toBe(12);
    expect(gridSnapshot(world).flat().every((id) => id !== -1)).toBe(true);
  });

  it("is reproducible under the same seed", () => {
    const run = () => {
      setRandom(mulberry32(1234));
      const world = makeWorld(6, 6);
      const system = generator(world);
      system.generate();
      return {
        grid: gridSnapshot(world),
        genomes: [...world.cells.values()].map((cell) =>
          getComponent(cell, "genome")
        ),
      };
    };

    expect(run()).toEqual(run());
  });

  it("produces different worlds under different seeds", () => {
    const run = (seed: number) => {
      setRandom(mulberry32(seed));
      const world = makeWorld(8, 8);
      generator(world).generate();
      return gridSnapshot(world);
    };

    expect(run(1)).not.toEqual(run(2));
  });

  it("gives every generated cell a genome starting at ip 0", () => {
    setRandom(mulberry32(7));
    const world = makeWorld(4, 4);
    const system = generator(world);
    system.generationChance = 1;

    system.generate();

    for (const cell of world.cells.values()) {
      const genome = getComponent(cell, "genome");
      expect(genome).toBeDefined();
      expect(genome!.ip).toBe(0);
    }
  });

  it("respects genomeLength", () => {
    setRandom(mulberry32(7));
    const world = makeWorld(3, 3);
    const system = generator(world);
    system.generationChance = 1;
    system.genomeLength = 5;

    system.generate();

    for (const cell of world.cells.values()) {
      expect(getComponent(cell, "genome")!.genome).toHaveLength(5);
    }
  });

  it("generates genes within their documented ranges", () => {
    setRandom(mulberry32(99));
    const world = makeWorld(6, 6);
    const system = generator(world);
    system.generationChance = 1;

    system.generate();

    const commands = ["noop", "left", "right", "move"];
    for (const cell of world.cells.values()) {
      for (const gene of getComponent(cell, "genome")!.genome) {
        expect(commands).toContain(gene.command);
        expect(gene.base).toBeGreaterThanOrEqual(-0.3);
        expect(gene.base).toBeLessThan(0.3);
        expect([0, 1, 2, 3]).toContain(gene.skip);
        for (const weight of Object.values(gene.sensors)) {
          expect(weight).toBeGreaterThanOrEqual(-1);
          expect(weight).toBeLessThan(1);
        }
      }
    }
  });

  it("places cells on the grid consistently with the cells map", () => {
    setRandom(mulberry32(3));
    const world = makeWorld(5, 5);
    const system = generator(world);

    system.generate();

    for (const cell of world.cells.values()) {
      const { x, y } = cell.position;
      expect(world.grid.data[y * world.width + x]).toBe(cell.id);
    }
  });

  it("does not disable itself, despite what its description claims", () => {
    // Current behavior — the description says "Generates cells and
    // automatically disables itself", but `enabled` is never touched.
    setRandom(mulberry32(3));
    const world = makeWorld(3, 3);
    const system = generator(world);
    system.enabled = true;

    system.generate();

    expect(system.enabled).toBe(true);
  });

  it("exposes a Generate action wired to generate()", () => {
    setRandom(mulberry32(3));
    const world = makeWorld(3, 3);
    const system = generator(world);
    system.generationChance = 1;

    expect(system.actions).toHaveLength(1);
    expect(system.actions[0]!.title).toBe("Generate");

    system.actions[0]!.callback();

    expect(world.cells.size).toBe(9);
  });
});
