import type { Cell } from "@/cell";
import type { Movement } from "./movement";
import type { Sensors } from "./sensors";

// Registry of all components in the system
type Components = {
  movement: Movement;
  sensors: Sensors;
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
