import type { Cell } from "@/cell";
import type { World } from "@/world";
import { ActionClassification, type Action } from ".";
import { setComponent } from "@/components";

/**
 * Writes an intent to feed from one resource layer. The feeding system is what
 * moves the value out of the layer and into the cell — with that system off,
 * cells still try to eat and simply get nothing.
 *
 * Photosynthesis and chemosynthesis are the same action pointed at different
 * layers. What makes them different strategies isn't the mechanic, it's how
 * the layers behave: light is a renewing gradient that rewards a fixed good
 * address, minerals are a depletable stock that rewards moving on.
 */
export class HarvestAction implements Action {
  id: string;
  class = ActionClassification.peaceful;
  cost: number;

  /**
   * Key into `world.layers` this draws from.
   */
  layer: string;

  /**
   * Amount taken per tick when the tile has that much left. Seeded into a knob
   * on the feeding system, like `cost` is into the energy system.
   */
  rate: number;

  constructor(id: string, layer: string, rate: number, cost: number) {
    this.id = id;
    this.layer = layer;
    this.rate = rate;
    this.cost = cost;
  }

  perform(_world: World, cell: Cell): void {
    setComponent(cell, "harvest", { layer: this.layer });
  }
}
