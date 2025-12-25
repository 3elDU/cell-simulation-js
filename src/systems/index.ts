import type { Cell } from "../cell";
import type { ConfigSchema, UIDescription } from "../ui";
import type { World } from "../world";

export interface System extends UIDescription {
  id: string;
  enabled: boolean;

  config?: ConfigSchema;

  /**
   * A system can depend on outputs or actions of another system.
   * This property establishes explicit ordering.
   */
  dependsOn?: string[];

  /**
   * Called when a system is first registered into the World
   */
  onInit?(world: World): void;

  /**
   * Called on every world tick
   */
  onTick?(world: World): void;

  /**
   * Called on every world tick, for every cell that is
   * currently present on the map.
   */
  onCellTick?(world: World, cell: Cell): void;
}
