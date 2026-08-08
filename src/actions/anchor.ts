import type { Cell } from "@/cell";
import type { World } from "@/world";
import { ActionClassification, type Action } from ".";
import { getComponent, setComponent } from "@/components";

/**
 * Writes an intent to settle onto the current tile, trading movement for a
 * cheaper and longer life. With the anchoring system off, cells still ask and
 * nothing settles.
 *
 * There is no matching action to pull free again: what a cell gains by
 * settling is worth having only while leaving stays off the table.
 */
export class AnchorAction implements Action {
  id = "anchor";
  class = ActionClassification.peaceful;
  cost = 2;

  perform(_world: World, cell: Cell): void {
    const anchor = getComponent(cell, "anchor");

    if (anchor) anchor.intent = true;
    else setComponent(cell, "anchor", { anchored: false, intent: true });
  }
}
