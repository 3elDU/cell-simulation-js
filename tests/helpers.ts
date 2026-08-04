import { addCell, type Cell } from "@/cell";
import type { GridLayer } from "@/grid";
import type { Rng } from "@/random";
import type { System } from "@/systems";
import type { World } from "@/world";

/**
 * Builds a bare world: an empty grid, no layers, no systems.
 *
 * Unlike {@link newWorld} this doesn't touch the system registry, so a test
 * only ever runs the systems it explicitly asked for.
 */
export function makeWorld(width: number, height: number): World {
  return {
    tick: 0,
    width,
    height,
    grid: {
      width,
      height,
      data: new Int32Array(width * height).fill(-1),
    },
    cells: new Map(),
    layers: {},
    systems: [],
  };
}

/**
 * Adds systems to the world, enables them and runs their onInit.
 *
 * Order is preserved as given — sortSystems is not applied, so a test that
 * cares about ordering has to call it itself.
 */
export function withSystems<T extends System[]>(
  world: World,
  ...systems: T
): T {
  for (const system of systems) {
    system.enabled = true;
    world.systems.push(system);
    system.onInit?.(world);
  }

  return systems;
}

/**
 * Places a cell at the given position.
 */
export function placeCell(world: World, x: number, y: number): Cell {
  return addCell(world, x, y);
}

/**
 * Seeds `world.layers.light` without needing the LightSystem.
 *
 * `value` is called per tile and truncated to a byte by the Uint8Array.
 */
export function lightLayer(
  world: World,
  value: (x: number, y: number) => number
): GridLayer<Uint8Array> {
  const layer: GridLayer<Uint8Array> = {
    width: world.width,
    height: world.height,
    data: new Uint8Array(world.width * world.height),
  };

  for (let x = 0; x < world.width; x++) {
    for (let y = 0; y < world.height; y++) {
      layer.data[y * world.width + x] = value(x, y);
    }
  }

  world.layers.light = layer;

  return layer;
}

/**
 * An Rng that hands out the given values in order, then throws.
 *
 * Throwing on exhaustion is deliberate: it pins down exactly how many draws
 * a system makes, so an extra or missing draw fails loudly.
 */
export function scriptedRng(values: number[]): Rng {
  let index = 0;

  return () => {
    if (index >= values.length) {
      throw new Error(
        `scriptedRng exhausted after ${values.length} draw(s); something asked for more`
      );
    }

    return values[index++]!;
  };
}

/**
 * The cell-id grid as rows of numbers, for readable assertions.
 */
export function gridSnapshot(world: World): number[][] {
  const rows: number[][] = [];

  for (let y = 0; y < world.height; y++) {
    const row: number[] = [];
    for (let x = 0; x < world.width; x++) {
      row.push(world.grid.data[y * world.width + x]!);
    }
    rows.push(row);
  }

  return rows;
}
