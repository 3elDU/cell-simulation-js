import type { Cell } from "@/cell";
import { statFactor, type World } from "@/world";
import type { System } from ".";
import type { Stat } from "./stats";
import { BaseSystem } from "./base";
import { getComponent, setComponent } from "@/components";
import { kill } from "@/components/death";
import type { ConfigSchema } from "@/ui";

/**
 * Ages cells and eventually kills them for it.
 *
 * Shaped like the energy system's overload risk — a safe stretch, a ramp,
 * then certain death.
 *
 * Unlike starvation, this adds a cost to lasting: it's what keeps a cell
 * sitting on a good tile from being immortal.
 */
export class AgeSystem extends BaseSystem implements System {
  id = "age";
  title = "Age";
  description = `Cells accumulate age and grow
steadily more likely to die of
it.`;
  enabled = true;

  /**
   * Below this many ticks old, dying of age is impossible.
   */
  safeAge = 400;

  /**
   * At this many ticks old, dying of age is certain within a tick.
   */
  lethalAge = 1000;

  /**
   * Bends the ramp between the two. 1 is a straight line; above 1 is forgiving
   * until close to lethal, below 1 starts culling early.
   */
  mortalityCurve = 2;

  stats: Stat[] = [{ id: "age.lifespan", title: "Lifespan" }];

  config: ConfigSchema = [
    { prop: "safeAge", label: "Safe below", min: 0, step: 10 },
    { prop: "lethalAge", label: "Lethal at", min: 1, step: 10 },
    {
      prop: "mortalityCurve",
      label: "Mortality curve",
      min: 0.1,
      max: 8,
      step: 0.1,
    },
  ];

  /**
   * Chance of dying of age this tick, from 0 below `safeAge` to 1 at
   * `lethalAge`.
   *
   * A lifespan above 1 makes the cell count its own age slower, stretching
   * both ends of the ramp rather than only the far one.
   */
  mortalityChance(age: number, lifespan = 1): number {
    const span = this.lethalAge - this.safeAge;
    const scaled = lifespan > 0 ? age / lifespan : Infinity;

    if (span <= 0) return scaled >= this.lethalAge ? 1 : 0;

    const excess = (scaled - this.safeAge) / span;

    return Math.min(Math.max(excess, 0), 1) ** this.mortalityCurve;
  }

  onCellTick(world: World, cell: Cell): void {
    // Already doomed by something else this tick. Ageing it further would
    // only muddy what the inspector shows.
    if (getComponent(cell, "death")) return;

    let age = getComponent(cell, "age");
    if (!age) {
      age = { age: 0 };
      setComponent(cell, "age", age);
    }

    age.age++;

    const lifespan = statFactor(world, cell, "age.lifespan");

    if (Math.random() < this.mortalityChance(age.age, lifespan)) {
      kill(cell, "old age", world.tick);
    }
  }
}
