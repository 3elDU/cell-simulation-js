import type { Cell } from "@/cell";
import type { World } from "@/world";
import { ActionClassification, type Action } from ".";
import { kill } from "@/components/death";

/**
 * Writes a death intent. The death system is what clears the tile and leaves
 * the corpse — with that system off, cells can decide to die and simply won't.
 *
 * Voluntary death is the same mechanism everything else kills through —
 * starvation and overload both just call `kill`. Exposing it as a registered
 * action means a genome can evolve to use it too.
 */
export class DieAction implements Action {
  id = "die";
  class = ActionClassification.peaceful;
  cost = 0;

  perform(world: World, cell: Cell): void {
    kill(cell, "chose to", world.tick);
  }
}
