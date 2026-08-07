import type { Cell } from "@/cell";
import type { World } from "@/world";
import type { System } from ".";
import { BaseSystem } from "./base";
import { getComponent } from "@/components";
import type { ConfigSchema } from "@/ui";
import type { Energy } from "@/components/energy";
import { gridGetAdjacent } from "@/grid";

/**
 * Moves energy from a cell that offered it into the cells around it, split
 * evenly.
 *
 * A cell holding less than it offered gives everything and starves for it.
 * That is the point: with kinship readable, feeding relatives at your own
 * expense is a strategy selection can price, and a floor stopping the giver
 * short would price it for them.
 */
export class SharingSystem extends BaseSystem implements System {
  id = "sharing";
  title = "Sharing";
  description = `Splits offered energy between
the surrounding cells.

Giving more than you have
is allowed, and fatal.`;
  enabled = true;

  // Reads the energy left after this tick's feeding and upkeep, so a cell
  // can't give away energy it is about to lose anyway.
  after = ["energy"];

  /**
   * Energy handed out per tick, split between the receivers.
   */
  amount = 5;

  /**
   * Share of the gift that arrives. Below 1 generosity costs the world and
   * not only the giver.
   */
  efficiency = 1;

  config: ConfigSchema = [
    { prop: "amount", label: "Amount", min: 0, step: 0.5 },
    { prop: "efficiency", label: "Efficiency", min: 0, max: 1, step: 0.01 },
  ];

  /**
   * Energy of every neighboring cell able to hold some.
   */
  private receivers(world: World, cell: Cell): Energy[] {
    const found: Energy[] = [];

    for (const { value } of gridGetAdjacent(world.grid, cell.position)) {
      if (value === undefined || value === -1) continue;

      const neighbor = world.cells.get(value);
      const energy = neighbor && getComponent(neighbor, "energy");

      if (energy) found.push(energy);
    }

    return found;
  }

  onCellTick(world: World, cell: Cell): void {
    const share = getComponent(cell, "share");

    // Intent lasts one tick. Cleared up front so a cell that stops choosing to
    // give stops giving, rather than coasting on a stale component forever.
    delete cell.components.share;

    if (!share?.intent) return;
    if (getComponent(cell, "death")) return;

    const energy = getComponent(cell, "energy");
    if (!energy) return;

    const receivers = this.receivers(world, cell);
    if (receivers.length === 0) return;

    // Capped by what the cell actually holds — a gift bigger than that would
    // be energy the world never had.
    const given = Math.min(this.amount, energy.energy);
    if (given <= 0) return;

    energy.energy -= given;

    const each = (given / receivers.length) * this.efficiency;
    for (const receiver of receivers) receiver.energy += each;
  }
}
