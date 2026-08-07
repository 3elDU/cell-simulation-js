import type { Cell } from "@/cell";
import type { GridLayer, TypedArray } from "@/grid";
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

/** Anything the registries hand out: an id, a switch and some knobs. */
interface Unit {
  id: string;
  enabled: boolean;
}

interface UnitSnapshot extends Unit {
  props: Record<string, unknown>;
}

/**
 * Settings that belong to the panes rather than to the world, so that
 * reopening a dish resumes at the speed and sampling resolution it was left
 * at.
 */
export interface UISnapshot {
  maxTps: number;
  sampleEvery: number;

  /** Raw value each graph tops out at, keyed by metric id. */
  ceiling: Record<string, number>;
}

/**
 * The parts of a session that outlive the world object: instances the panes
 * own, and the panes' own settings.
 */
export interface Session {
  renderers: Unit[];
  metrics: Unit[];
  ui: UISnapshot;
}

function unitSnapshot(unit: Unit): UnitSnapshot {
  return { id: unit.id, enabled: unit.enabled, props: snapshotProps(unit) };
}

/**
 * Applies saved state onto instances matched by id.
 *
 * A unit present in the save but gone from the registry is simply dropped,
 * the same way a genome's gene for a missing action goes inert.
 */
export function restoreUnits(units: Unit[], saved: UnitSnapshot[] = []) {
  for (const state of saved) {
    const unit = units.find(unit => unit.id === state.id);
    if (!unit) continue;

    unit.enabled = state.enabled;
    restoreProps(unit, state.props);
  }
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

  /** Absent in dishes saved before metrics existed. */
  metrics?: UnitSnapshot[];
  ui?: UISnapshot;
}

export function snapshotWorld(world: World, session: Session): Snapshot {
  return {
    version: SNAPSHOT_VERSION,

    tick: world.tick,
    width: world.width,
    height: world.height,
    nextCellId: world.nextCellId,

    grid: world.grid,
    layers: world.layers,
    cells: world.cells,

    systems: world.systems.map(unitSnapshot),
    renderers: session.renderers.map(unitSnapshot),
    metrics: session.metrics.map(unitSnapshot),
    ui: { ...session.ui, ceiling: { ...session.ui.ceiling } },
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

  restoreUnits(world.systems, snapshot.systems);

  return world;
}
