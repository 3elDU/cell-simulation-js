import type { Cell } from "@/cell";
import { getComponent, setComponent } from ".";
import type { RgbColor } from "@/renderers/util";
import type { World } from "@/world";

/**
 * A marker color, applied by hand and inherited, so a lineage can be followed
 * by eye. Nothing in the simulation reads it.
 */
export interface Taint {
  color: RgbColor;
}

/**
 * A saturated random color, so marked cells stand out from unmarked ones.
 */
export function randomTaintColor(): RgbColor {
  const hue = Math.random() * 360;

  const channel = (offset: number) => {
    const t = Math.abs((((hue + offset) / 60) % 6) - 3) - 1;
    return Math.round(Math.min(Math.max(t, 0), 1) * 255);
  };

  return { r: channel(0), g: channel(240), b: channel(120) };
}

export function taint(cell: Cell, color = randomTaintColor()) {
  setComponent(cell, "taint", { color });
}

/**
 * Marks a cell and its ancestors, one shade for all of them — drifting
 * backwards would invent mutations nothing recorded.
 *
 * Stops at an ancestor already marked, so a second taint claims only the
 * stretch between the two.
 */
export function taintLineage(
  world: World,
  cell: Cell,
  color = randomTaintColor()
) {
  let current: Cell | undefined = cell;

  // Only the walk upwards respects an existing mark; the clicked cell is
  // repainted regardless.
  do {
    taint(current, { ...color });

    const parent = getComponent(current, "reproduction")?.parent;
    current = parent === undefined ? undefined : world.cells.get(parent);
  } while (current && !getComponent(current, "taint"));
}
