import type { Cell } from "./cell";
import { gridEvery, type GridLayer, type TypedArray } from "./grid";
import { sortSystems, type System } from "./systems";
import { systemRegistry } from "./systems/registry";

/**
 * World by itself is behavior-less. It only contains the state
 *
 * What produces the behavior are systems.
 */
export interface World {
  /**
   * Current iteration
   */
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

  /**
   * Id handed to the next cell created.
   *
   * A counter rather than `cells.size`, because corpses get pruned once there
   * are enough of them — with reproduction running, deriving an id from the
   * map size would start handing out ids that are already taken.
   */
  nextCellId: number;

  /**
   * Layers allow storing arbitrary information associated with each tile
   */
  layers: Record<string, GridLayer<TypedArray>>;

  /**
   * Systems contain all behavior of the simulation
   */
  systems: System[];
}

/**
 * Finds a system by id, but only if it is switched on.
 *
 * Meant for the "returns nothing when its dependency is missing" pattern —
 * a sensor reading a system's config should go quiet when that system is off,
 * not report a number derived from settings nothing is applying.
 */
export function getEnabledSystem<T extends System>(
  world: World,
  id: string
): T | undefined {
  const system = world.systems.find(system => system.id === id);

  return system?.enabled ? (system as T) : undefined;
}

/**
 * Announces a birth to every enabled system, so what a cell hands down is
 * decided by whoever owns that data rather than by whoever performed the split.
 */
export function emitBirth(world: World, parent: Cell, child: Cell) {
  for (const system of world.systems) {
    if (!system.enabled) continue;
    system.onCellBirth?.(world, parent, child);
  }
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
    nextCellId: 1,
    layers: {},
    systems: [],
  };

  // Add all systems to the world, initially disabled
  for (const def of systemRegistry.list()) {
    const system = def.create();
    world.systems.push(system);
  }

  sortSystems(world.systems);

  // Run onInit on all systems
  for (const system of world.systems) {
    system.onInit?.(world);
  }

  return world;
}

/**
 * Runs a complete iteration on the given world, calling all enabled systems
 */
export function doTick(world: World) {
  for (const system of world.systems) {
    if (!system.enabled) continue;
    system.onTick?.(world);
  }

  for (const id of world.grid.data) {
    if (id == -1) continue;
    const cell = world.cells.get(id)!;

    // Ensure every cell can be processed only once;
    if (cell.components.internal?.processed === true) {
      continue;
    }

    for (const system of world.systems) {
      if (!system.enabled) continue;

      system.onCellTick?.(world, world.cells.get(id)!);

      cell.components.internal = { processed: true };
    }
  }

  // Clear internal components
  gridEvery(
    world.grid,
    (_x, _y, id) => delete world.cells.get(id)!.components.internal
  );

  world.tick++;
}
