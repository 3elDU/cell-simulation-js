import type { Cell } from "@/cell";
import type { World } from "@/world";

export interface Sensor {
  id: string;
  title: string;
  description: string;

  /**
   * Undefined can be returned if the necessary dependency (a system or a component)
   * is not satisfied.
   */
  computeValue(cell: Cell, world: World): number | undefined;
}
