import type { Cell } from "@/cell";
import { getEnabledSystem, type World } from "@/world";
import type { Sensor } from ".";
import { getComponent } from "@/components";
import { gridGetAdjacent } from "@/grid";
import { ActionClassification, type Action } from "@/actions";
import type { GenomeSystem } from "@/systems/genome";
import type { Gene } from "@/components/genome";

/**
 * Share of a genome's votes that go towards harming other cells.
 *
 * Read off the weights rather than off what the cell has done, so a neighbor
 * that hasn't bitten anyone yet still reads as the threat it is.
 *
 * A negative weight is a vote against an action, not a vote for a peaceful
 * one, so it counts towards neither share. Genes naming an action nobody
 * registered are inert and counted nowhere.
 */
function hostilityOf(genes: Gene[], actions: Map<string, Action>): number {
  let hostile = 0;
  let total = 0;

  for (const gene of genes) {
    const action = actions.get(gene.action);
    if (!action) continue;

    const weight = Math.max(0, gene.base);
    total += weight;

    if (action.class === ActionClassification.hostile) hostile += weight;
  }

  return total === 0 ? 0 : hostile / total;
}

/**
 * How dangerous the reachable neighbors are: 0 among cells that never vote to
 * harm anything, 1 among cells that want nothing else.
 *
 * Separate from relatedness on purpose — a lineage can drift into violence and
 * a stranger can be harmless, and a cell that can read both can evolve to flee
 * one without fleeing the other.
 */
export class HostilitySensor implements Sensor {
  id = "hostility";
  title = "Hostility";
  description = "How much the surrounding cells intend to harm";

  computeValue(cell: Cell, world: World): number | undefined {
    // Which actions count as hostile is only meaningful while something is
    // scoring genes against them.
    const system = getEnabledSystem<GenomeSystem>(world, "genome");
    if (!system) return undefined;

    let total = 0;
    let seen = 0;

    for (const { value } of gridGetAdjacent(world.grid, cell.position)) {
      if (value === undefined || value === -1) continue;

      const neighbor = world.cells.get(value);
      const genome = neighbor && getComponent(neighbor, "genome");
      if (!genome) continue;

      total += hostilityOf(genome.genome, system.actions);
      seen++;
    }

    return seen === 0 ? undefined : total / seen;
  }
}
