import type { Cell } from "@/cell";
import { getEnabledSystem, type World } from "@/world";
import type { Sensor } from ".";
import { getComponent } from "@/components";

/**
 * Whether the cell has settled: 1 anchored, 0 free.
 *
 * Reads as 0 rather than as nothing on a cell that never settled — with the
 * system running, being free is a real answer.
 *
 * Lets a genome say something different once it is settled, which is what
 * turns one decision into two ways of living.
 */
export class AnchoredSensor implements Sensor {
  id = "anchored";
  title = "Anchored";
  description = "Whether the cell has settled onto its tile";

  computeValue(cell: Cell, world: World): number | undefined {
    if (!getEnabledSystem(world, "anchor")) return undefined;

    return getComponent(cell, "anchor")?.anchored ? 1 : 0;
  }
}
