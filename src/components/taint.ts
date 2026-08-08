import type { Cell } from "@/cell";
import { setComponent } from ".";
import type { RgbColor } from "@/renderers/util";

/**
 * A marker color, handed out at birth and inherited, so a lineage can be
 * followed by eye. Nothing in the simulation reads it.
 */
export interface Taint {
  color: RgbColor;
}

/**
 * Floor every channel sits above, so no shade can sink into a dark background.
 */
export const MIN_TAINT_CHANNEL = 80;

export function clampTaintChannel(value: number): number {
  return Math.round(Math.min(Math.max(value, MIN_TAINT_CHANNEL), 255));
}

/**
 * A saturated random color, so two unrelated lineages rarely look alike.
 */
export function randomTaintColor(): RgbColor {
  const hue = Math.random() * 360;

  const channel = (offset: number) => {
    const t = Math.abs((((hue + offset) / 60) % 6) - 3) - 1;
    const clamped = Math.min(Math.max(t, 0), 1);

    return clampTaintChannel(
      MIN_TAINT_CHANNEL + clamped * (255 - MIN_TAINT_CHANNEL)
    );
  };

  return { r: channel(0), g: channel(240), b: channel(120) };
}

export function taint(cell: Cell, color = randomTaintColor()) {
  setComponent(cell, "taint", { color });
}
