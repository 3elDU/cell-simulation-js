import type { Cell } from "@/cell";
import type { GridLayer, TypedArray } from "@/grid";
import type { Renderer } from "@/renderers";
import { newWorld, type World } from "@/world";
import { restoreProps, snapshotProps } from "./props";

export { randomDishName } from "./names";
export { listDishes, loadSnapshot, deleteDish, saveDish } from "./db";

/**
 * Bumped when the snapshot shape changes in a way old saves can't be read
 * through. Restoring is forgiving by design — unknown systems are ignored,
 * missing ones keep their defaults — so this is only for a real break.
 */
export const SNAPSHOT_VERSION = 1;

/**
 * What the dish list needs, without the megabytes behind it.
 */
export interface DishMeta {
  id: string;
  name: string;

  /** Wall-clock time of the last save, used to sort the list. */
  savedAt: number;

  tick: number;
  width: number;
  height: number;
  cells: number;
}

interface UnitSnapshot {
  id: string;
  enabled: boolean;
  props: Record<string, unknown>;
}

/**
 * Everything needed to put a world back exactly as it was.
 *
 * Stored as live structures rather than JSON: IndexedDB structured-clones on
 * write, so typed arrays keep their element type and the cell `Map` stays a
 * `Map`.
 */
export interface Snapshot {
  version: number;

  tick: number;
  width: number;
  height: number;
  nextCellId: number;

  grid: GridLayer<Int32Array>;
  layers: Record<string, GridLayer<TypedArray>>;
  cells: Map<number, Cell>;

  systems: UnitSnapshot[];
  renderers: UnitSnapshot[];
}

export function snapshotWorld(world: World, renderers: Renderer[]): Snapshot {
  return {
    version: SNAPSHOT_VERSION,

    tick: world.tick,
    width: world.width,
    height: world.height,
    nextCellId: world.nextCellId,

    grid: world.grid,
    layers: world.layers,
    cells: world.cells,

    systems: world.systems.map(system => ({
      id: system.id,
      enabled: system.enabled,
      props: snapshotProps(system),
    })),
    renderers: renderers.map(renderer => ({
      id: renderer.id,
      enabled: renderer.enabled,
      props: snapshotProps(renderer),
    })),
  };
}

export function dishMeta(id: string, name: string, world: World): DishMeta {
  return {
    id,
    name,
    savedAt: Date.now(),
    tick: world.tick,
    width: world.width,
    height: world.height,
    cells: world.cells.size,
  };
}

/**
 * Rebuilds a world from a snapshot.
 *
 * Goes through `newWorld` rather than assembling the world by hand, so
 * systems still get their usual `onInit` — the state it generates is then
 * overwritten wholesale by what was saved.
 */
export function worldFromSnapshot(snapshot: Snapshot): World {
  const world = newWorld(snapshot.width, snapshot.height);

  world.tick = snapshot.tick;
  world.nextCellId = snapshot.nextCellId;
  world.grid = snapshot.grid;
  world.layers = snapshot.layers;
  world.cells = snapshot.cells;

  for (const saved of snapshot.systems) {
    const system = world.systems.find(system => system.id === saved.id);
    // A system present in the save but gone from the registry is simply
    // dropped, the same way a genome's gene for a missing action goes inert.
    if (!system) continue;

    system.enabled = saved.enabled;
    restoreProps(system, saved.props);
  }

  return world;
}

/**
 * Applies saved renderer state onto instances the renderers pane already
 * created. Renderers aren't owned by the world, so they're restored separately.
 */
export function restoreRenderers(renderers: Renderer[], snapshot: Snapshot) {
  for (const saved of snapshot.renderers) {
    const renderer = renderers.find(renderer => renderer.id === saved.id);
    if (!renderer) continue;

    renderer.enabled = saved.enabled;
    restoreProps(renderer, saved.props);
  }
}
