import type { Cell } from "@/cell";
import { statFactor, type World } from "@/world";
import type { System } from ".";
import { BaseSystem } from "./base";
import { getComponent } from "@/components";
import type { ConfigSchema } from "@/ui";
import { gridGetAdjacent } from "@/grid";
import type { Stat } from "./stats";

/**
 * Takes energy out of the cells around one that attacked, and hands part of it
 * to the attacker.
 *
 * The bite is charged per neighbor rather than split between them, so a crowd
 * is a bigger meal than a lone cell. Nothing caps the haul: an attacker that
 * empties four neighbors at once may well burst on what it took.
 */
export class PredationSystem extends BaseSystem implements System {
  id = "predation";
  title = "Predation";
  description = `Drains the cells surrounding
one that attacked.

A crowd is a bigger meal, and
a bigger risk of bursting.`;
  enabled = true;

  // Reads the energy left after this tick's feeding and upkeep, so a bite
  // can't land on energy the victim was about to lose anyway.
  after = ["energy"];

  /**
   * Energy taken from each neighbor, or everything it has left if it holds
   * less.
   */
  amount = 5;

  /**
   * Share of what was taken that reaches the attacker. The rest is destroyed —
   * below 1, predation costs the world more than it feeds anyone.
   */
  efficiency = 1;

  stats: Stat[] = [{ id: "predation.bite", title: "Bite taken" }];

  config: ConfigSchema = [
    { prop: "amount", label: "Amount", min: 0, step: 0.5 },
    { prop: "efficiency", label: "Efficiency", min: 0, max: 1, step: 0.01 },
  ];

  /**
   * Every neighboring cell holding energy. The cell comes along with it: how
   * much a bite takes is the victim's business as much as the attacker's.
   */
  private victims(world: World, cell: Cell): Cell[] {
    const found: Cell[] = [];

    for (const { value } of gridGetAdjacent(world.grid, cell.position)) {
      if (value === undefined || value === -1) continue;

      const neighbor = world.cells.get(value);

      if (neighbor && getComponent(neighbor, "energy")) found.push(neighbor);
    }

    return found;
  }

  onCellTick(world: World, cell: Cell): void {
    const attack = getComponent(cell, "attack");

    // Intent lasts one tick. Cleared up front so a cell that stops choosing to
    // attack stops attacking, rather than coasting on a stale component
    // forever.
    delete cell.components.attack;

    if (!attack?.intent) return;
    if (getComponent(cell, "death")) return;

    const energy = getComponent(cell, "energy");
    if (!energy) return;

    let taken = 0;

    for (const victim of this.victims(world, cell)) {
      const held = getComponent(victim, "energy")!;

      const amount = this.amount * statFactor(world, victim, "predation.bite");
      const bite = Math.min(amount, held.energy);
      if (bite <= 0) continue;

      held.energy -= bite;
      taken += bite;
    }

    energy.energy += taken * this.efficiency;
  }
}
