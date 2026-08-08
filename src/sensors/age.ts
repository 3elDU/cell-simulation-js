import type { Cell } from "@/cell";
import { getEnabledSystem, statFactor, type World } from "@/world";
import type { Sensor } from ".";
import { getComponent } from "@/components";
import type { AgeSystem } from "@/systems/age";

/**
 * How far through its life the cell is: 0 is newborn, 1 is certain death.
 *
 * Scaled against the age system's lethal threshold rather than a constant, so
 * the reading keeps meaning the same thing when that knob is dragged. With the
 * age system off nothing ages and there is nothing to report, so the sensor
 * goes quiet rather than reporting a confident zero.
 *
 * This is what lets "split before you die" evolve — a gene voting to reproduce
 * that listens to this fires harder the older the cell gets.
 */
export class AgeSensor implements Sensor {
  id = "age";
  title = "Age";
  description = "Own age, as a fraction of the lethal age";

  computeValue(cell: Cell, world: World): number | undefined {
    const system = getEnabledSystem<AgeSystem>(world, "age");
    if (!system) return undefined;

    const age = getComponent(cell, "age");
    if (!age) return undefined;

    const lethal = system.lethalAge * statFactor(world, cell, "age.lifespan");
    if (lethal <= 0) return 1;

    return Math.min(Math.max(age.age / lethal, 0), 1);
  }
}
