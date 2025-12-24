import type { Cell } from "./cell";
import type { GridLayer } from "./grid";
import type { Renderer } from "./renderers";
import type { System } from "./systems";
import { systemRegistry } from "./systems/registry";

/**
 * World by itself is behavior-less. It only contains the state
 *
 * What produces the behavior are systems.
 */
export interface World {
  tick: number;

  width: number;
  height: number;

  /**
   * Main grid layer containing ids of cells. -1 in case the space is empty.
   */
  grid: GridLayer<Int32Array>;

  /**
   * Storing cells by their ID in a map allows us to retain cells even after
   * they are no longer present on the field
   */
  cells: Map<number, Cell>;
  layers: Record<string, GridLayer<any>>;

  /**
   * Systems contain the behavior of the simulation
   */
  systems: System[];
}

/**
 * Creates a new world object with no systems, layers or cells, and an empty grid.
 */
export function newWorld(width: number, height: number): World {
  const world: World = {
    tick: 0,
    width: width,
    height: height,
    grid: {
      width,
      height,
      data: new Int32Array(width * height).fill(-1),
    },
    cells: new Map(),
    layers: {},
    systems: [],
  };

  // Add all systems to the world, initially disabled
  for (const def of systemRegistry.list()) {
    const system = def.create();
    system.enabled = false;
    world.systems.push(system);
  }

  // Run onInit on all systems
  for (const system of world.systems) {
    system.onInit?.(world);
  }

  return world;
}

/**
 * Runs a complete iteration on the given world
 */
export function doTick(world: World) {
  for (const system of world.systems) {
    if (!system.enabled) continue;
    system.onTick?.(world);
  }

  for (const id of world.grid.data) {
    if (id == -1) continue;

    for (const system of world.systems) {
      if (!system.enabled) continue;

      system.onCellTick?.(world, world.cells.get(id)!);
    }
  }

  world.tick++;
}
