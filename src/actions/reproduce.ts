import type { Cell } from "@/cell";
import type { World } from "@/world";
import type { Action } from ".";
import { getComponent, setComponent } from "@/components";

/**
 * Writes an intent to split. The reproduction system decides whether it can
 * actually happen — enough energy, a free neighboring tile — and charges for
 * it only if it does.
 *
 * The action's own `cost` is what trying costs, charged by the
 * energy system whether or not a child appears. The real price of a birth is
 * the reproduction system's knob. Splitting them means a boxed-in cell
 * spamming this pays a small tax rather than nothing, without paying full
 * price for children it never has.
 */
export class ReproduceAction implements Action {
  id = "reproduce";
  cost = 0.5;

  perform(_world: World, cell: Cell): void {
    const reproduction = getComponent(cell, "reproduction");

    if (reproduction) {
      reproduction.intent = true;
      return;
    }

    setComponent(cell, "reproduction", {
      intent: true,
      generation: 0,
      children: 0,
    });
  }
}
