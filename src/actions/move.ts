import type { Cell } from "@/cell";
import type { World } from "@/world";
import type { Action } from ".";
import { setComponent } from "@/components";
import type { MovementDirection } from "@/components/movement";

/**
 * Writes a movement intent. The movement system is what actually relocates
 * the cell — with that system disabled, cells still want to move, they just
 * never get anywhere.
 */
export class MoveAction implements Action {
  id: string;
  dir: MovementDirection;

  constructor(dir: MovementDirection) {
    this.dir = dir;
    this.id = `move-${dir}`;
  }

  perform(_world: World, cell: Cell): void {
    setComponent(cell, "movement", { dir: this.dir });
  }
}
