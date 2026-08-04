import type { Cell } from "@/cell";
import { setComponent } from ".";

/**
 * Marks a cell as doomed. The death system is what actually clears the tile
 * and leaves the corpse behind, on the tick after this is written.
 *
 * Kept on the cell afterwards rather than discarded, so the inspector can
 * still answer what killed it.
 */
export interface Death {
  /**
   * Free-form, so any system can name its own cause without a shared enum
   * everything has to be added to.
   */
  reason: string;

  /**
   * Tick the cell was marked on, not the tick it was cleared.
   */
  tick: number;
}

/**
 * Marks a cell for death, unless it is already marked — the first cause wins,
 * so a starving cell that also bursts is recorded as having starved.
 */
export function kill(cell: Cell, reason: string, tick: number) {
  if (cell.components.death) return;

  setComponent(cell, "death", { reason, tick });
}
