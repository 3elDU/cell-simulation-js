import type { Cell } from "@/cell";
import type { World } from "@/world";
import { ActionClassification, type Action } from ".";
import { setComponent } from "@/components";

/**
 * Writes an intent to give energy away. The sharing system decides who is
 * close enough to receive it and how much arrives — with that system off,
 * cells still offer and nobody is fed.
 *
 * Undirected on purpose: nothing a cell can sense distinguishes one side of it
 * from another, so a gift aimed one way would be aimed at random.
 */
export class ShareAction implements Action {
  id = "share";
  class = ActionClassification.peaceful;
  cost = 0.3;

  perform(_world: World, cell: Cell): void {
    setComponent(cell, "share", { intent: true });
  }
}
