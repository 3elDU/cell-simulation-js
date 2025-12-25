import type { Cell } from "@/cell";
import type { Movement } from "./movement";
import type { Sensors } from "./sensors";
import type { Temperature } from "./temperature";
import type { Hormones } from "./hormones";
import type { Signals } from "./signal";
import type { Genome } from "./genome";

// Registry of all components in the system
type Components = {
  movement: Movement;
  sensors: Sensors;
  temperature: Temperature;
  hormones: Hormones;
  signals: Signals;
  genome: Genome;
};

/**
 * Type-safe function to retrieve a registered component from the cell
 */
export function getComponent<T extends keyof Components>(
  cell: Cell,
  id: T
): Components[T] | undefined {
  if ((id as string) in cell.components) {
    return cell.components[id] as Components[T];
  }
  return undefined;
}

/**
 * Type-safe function to set a component on the cell
 */
export function setComponent<T extends keyof Components>(
  cell: Cell,
  id: T,
  component: Components[T]
) {
  cell.components[id] = component;
}
