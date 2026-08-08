import type { Cell } from "@/cell";
import type { World } from "@/world";
import { ActionClassification, type Action } from ".";
import { setComponent } from "@/components";

/**
 * Writes an intent to feed on the neighbors. The predation system decides who
 * is close enough to bite and how much of the bite is kept — with that system
 * off, cells still lunge and nothing bleeds.
 *
 * Indiscriminate: it takes from whoever is there, relatives included. Telling
 * family apart is what the kinship reading is for, and leaving that to the
 * genome is what makes sparing kin an evolved restraint rather than a rule.
 */
export class AttackAction implements Action {
  id = "attack";
  class = ActionClassification.hostile;
  cost = 1;

  perform(_world: World, cell: Cell): void {
    setComponent(cell, "attack", { intent: true });
  }
}
