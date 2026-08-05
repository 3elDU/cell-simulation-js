import type { Cell } from "@/cell";
import type { World } from "@/world";
import type { System } from ".";
import { BaseSystem } from "./base";
import { getComponent, setComponent } from "@/components";
import { kill } from "@/components/death";
import type { ConfigSchema } from "@/ui";
import { actionRegistry } from "@/actions/registry";

/**
 * Charges cells for living and for what they did, and kills them when it goes
 * badly in either direction.
 *
 * Nothing here *grants* energy — that belongs to whichever system feeds cells
 * (photosynthesis, chemosynthesis, predation). This is only the sink, so a
 * world with feeding switched off is a world that runs down and dies, which is
 * the correct thing for it to do rather than a bug.
 */
export class EnergySystem extends BaseSystem implements System {
  id = "energy";
  title = "Energy";
  description = `Charges upkeep and the cost of
whatever the cell just did.

Runs out and the cell starves;
hoard too much and it bursts.`;
  enabled = true;

  // Charges for the action the genome picked this tick, so it has to know it.
  // After feeding too, so a cell that just ate gets to spend what it earned
  // rather than starving with a full tile underneath it.
  after = ["genome", "feeding"];

  /**
   * Given to a cell the first tick it is seen with no energy component. Cells
   * are created by other systems that have no business knowing energy exists,
   * so this system hands it out rather than expecting it to arrive.
   */
  startingEnergy = 40;

  /**
   * Paid every tick just for being alive, before any action cost.
   */
  upkeep = 0.2;

  /**
   * Cost charged for an action that hasn't declared one.
   */
  defaultCost = 0.5;

  /**
   * Below this much energy, bursting is impossible.
   */
  safeEnergy = 150;

  /**
   * At this much energy, bursting is certain within a tick.
   */
  lethalEnergy = 300;

  /**
   * Bends the ramp between the two. 1 is a straight line; above 1 is forgiving
   * until close to lethal, below 1 punishes early.
   */
  overloadCurve = 1;

  /**
   * Per-action energy costs, seeded from what each action declares and then
   * tunable. Built at init from whatever is registered, so a new action shows
   * up here with its own slider and no change to this file.
   */
  costs: Record<string, number> = {};

  config: ConfigSchema = [];

  private baseConfig: ConfigSchema = [
    { prop: "startingEnergy", label: "Starting energy", min: 0, step: 1 },
    { prop: "upkeep", label: "Upkeep / tick", min: 0, step: 0.05 },
    { prop: "safeEnergy", label: "Safe below", min: 0, step: 1 },
    { prop: "lethalEnergy", label: "Lethal at", min: 1, step: 1 },
    {
      prop: "overloadCurve",
      label: "Overload curve",
      min: 0.1,
      max: 8,
      step: 0.1,
    },
    { prop: "defaultCost", label: "Default cost", min: 0, step: 0.05 },
  ];

  onInit(): void {
    this.costs = {};
    const costConfig: ConfigSchema = [];

    for (const def of actionRegistry.list()) {
      const action = def.create();

      this.costs[action.id] = action.cost ?? this.defaultCost;

      costConfig.push({
        prop: action.id,
        // Bound to the map rather than to a field on this system, since the
        // set of actions isn't known until runtime.
        object: this.costs,
        label: def.title,
        min: 0,
        step: 0.05,
      });
    }

    this.config = [...this.baseConfig, ...costConfig];
  }

  /**
   * Chance of bursting this tick, from 0 below {@link safeEnergy} to 1 at
   * {@link lethalEnergy}.
   */
  overloadChance(energy: number): number {
    const span = this.lethalEnergy - this.safeEnergy;
    if (span <= 0) return energy >= this.lethalEnergy ? 1 : 0;

    const excess = (energy - this.safeEnergy) / span;

    return Math.min(Math.max(excess, 0), 1) ** this.overloadCurve;
  }

  onCellTick(world: World, cell: Cell): void {
    // Already doomed — the death system clears it next tick, until then it
    // shouldn't be charged or killed a second time.
    if (getComponent(cell, "death")) return;

    let energy = getComponent(cell, "energy");
    if (!energy) {
      energy = { energy: this.startingEnergy };
      setComponent(cell, "energy", energy);
    }

    energy.energy -= this.upkeep;

    const chosen = getComponent(cell, "genome")?.lastAction;
    if (chosen) energy.energy -= this.costs[chosen] ?? this.defaultCost;

    if (energy.energy <= 0) {
      energy.energy = 0;
      kill(cell, "starved", world.tick);
      return;
    }

    if (Math.random() < this.overloadChance(energy.energy)) {
      kill(cell, "burst", world.tick);
    }
  }
}
