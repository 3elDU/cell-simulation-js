import type { Cell } from "@/cell";
import { getEnabledSystem, type World } from "@/world";
import type { Sensor } from ".";
import { getComponent } from "@/components";
import type { EnergySystem } from "@/systems/energy";

/**
 * How close the cell is to bursting: 0 is empty, 1 is certain death.
 *
 * Scaled against the energy system's lethal threshold rather than a constant,
 * so the reading keeps meaning the same thing when that knob is dragged. With
 * the energy system off there is no threshold to scale against and no risk to
 * report, so the sensor goes quiet instead of reporting a number.
 */
export class EnergySensor implements Sensor {
  id = "energy";
  title = "Energy";
  description = "Own energy, as a fraction of the lethal amount";

  computeValue(cell: Cell, world: World): number | undefined {
    const system = getEnabledSystem<EnergySystem>(world, "energy");
    if (!system) return undefined;

    const energy = getComponent(cell, "energy");
    if (!energy) return undefined;

    return Math.min(Math.max(energy.energy / system.lethalEnergy, 0), 1);
  }
}
