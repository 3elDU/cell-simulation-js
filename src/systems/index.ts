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

  onInit?(world: World): void;
  onTick?(world: World): void;
  onCellTick?(world: World, cell: Cell): void;
}
