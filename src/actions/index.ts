import type { Cell } from "@/cell";
import type { World } from "@/world";

/**
 * Is the action peaceful or hostile towards other cells?
 */
export enum ActionClassification {
  peaceful,
  hostile,
}

export interface Action {
  id: string;
  class: ActionClassification;

  /**
   * What performing this costs, in energy.
   *
   * The action declares what it is naturally worth; the energy system copies
   * it into a knob at startup and charges from there. So a new action arrives
   * with a sane price and a tunable slider for free, and the energy system
   * never has to know the action exists.
   */
  cost?: number;

  perform(world: World, cell: Cell): void;
}
