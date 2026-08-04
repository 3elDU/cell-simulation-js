import type { Cell } from "@/cell";
import type { World } from "@/world";
import type { Action } from ".";
import { kill } from "@/components/death";

/**
 * Writes a death intent. The death system is what clears the tile and leaves
 * the corpse — with that system off, cells can decide to die and simply won't.
 *
 * Voluntary death looks useless, but it is the same mechanism everything else
 * kills through: starvation, overload and later predation all just call
 * {@link kill}. Exposing it as a registered action means a genome can evolve
 * to use it too, which is how altruistic strategies get a foot in the door.
 */
export class DieAction implements Action {
  id = "die";
  cost = 0;

  perform(world: World, cell: Cell): void {
    kill(cell, "chose to", world.tick);
  }
}
