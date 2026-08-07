import type { Cell } from "@/cell";
import type { Movement } from "./movement";
import type { Sensors } from "./sensors";
import type { Temperature } from "./temperature";
import type { Genome } from "./genome";
import type { Energy } from "./energy";
import type { Death } from "./death";
import type { Harvest } from "./harvest";
import type { Reproduction } from "./reproduction";
import type { Age } from "./age";
import type { Taint } from "./taint";
import type { Share } from "./share";

// Registry of all components in the system
type Components = {
  movement: Movement;
  sensors: Sensors;
  temperature: Temperature;
  genome: Genome;
  energy: Energy;
  death: Death;
  harvest: Harvest;
  reproduction: Reproduction;
  age: Age;
  taint: Taint;
  share: Share;
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
  // Interfaces have no implicit index signature, so a declared component type
  // never satisfies `Record<string, unknown>` structurally. This function is
  // the type-safe boundary; past it, components are just bags.
  cell.components[id] = component as Record<string, unknown>;
}
