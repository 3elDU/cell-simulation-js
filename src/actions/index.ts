import type { Cell } from "@/cell";
import type { World } from "@/world";

export interface Action {
  id: string;

  perform(world: World, cell: Cell): void;
}
