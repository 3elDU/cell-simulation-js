import type { Cell } from "@/cell";
import type { World } from "@/world";
import type { System } from ".";
import { BaseSystem } from "./base";
import { getComponent } from "@/components";
import type { ConfigSchema } from "@/ui";
import { modifierConfig, type Modifier, type StatId } from "./stats";

/**
 * Settles cells that asked to, and prices the trade.
 *
 * A settled cell gives up moving and gets a discount on the rest of living.
 * The discounts are stat factors rather than reaching into other systems, so
 * each one only applies while the system charging for it is switched on.
 *
 * Settling is one-way and never inherited, which is what makes a cluster a
 * thing cells grow into together rather than a trait that wins once and
 * spreads.
 */
export class AnchorSystem extends BaseSystem implements System, Modifier {
  id = "anchor";
  title = "Anchor";
  description = `Cells settle onto a tile,
trading movement for a
cheaper and longer life.`;
  enabled = true;

  factors: Partial<Record<StatId, number>> = {
    "energy.upkeep": 0.5,
    "energy.overload": 2.5,
    "age.lifespan": 1.5,
    // The one that goes the wrong way: a settled cell takes the whole bite,
    // having given up the option of not being there for it.
    "predation.bite": 1.5,
    "reproduction.cost": 0.7,
    "reproduction.threshold": 0.7,
    "sharing.efficiency": 1.2,
  };

  config: ConfigSchema = [];

  affects(cell: Cell): boolean {
    return getComponent(cell, "anchor")?.anchored === true;
  }

  onInit(world: World): void {
    this.config = modifierConfig(world, this);
  }

  onCellTick(_world: World, cell: Cell): void {
    const anchor = getComponent(cell, "anchor");
    if (!anchor) return;

    if (anchor.intent) {
      anchor.intent = false;
      anchor.anchored = true;
    }

    // Settled cells still get to want to move. Nothing carries it out.
    if (anchor.anchored) delete cell.components.movement;
  }
}
