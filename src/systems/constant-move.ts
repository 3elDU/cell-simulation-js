import type { System } from "@/systems";
import { BaseSystem } from "./base";
import type { Cell } from "@/cell";
import type { World } from "@/world";
import { setMovement, type MovementDirection } from "@/components/movement";

export class ConstantMoveSystem extends BaseSystem implements System {
  id = "sys-constant-move";
  title = "Constant Move";
  description = "Moves every cell in a given direction, every tick";

  direction: MovementDirection = "up";

  config = [
    {
      prop: "direction",
      title: "abcd",
      id: "abcd",
      options: {
        left: "left",
        right: "right",
        up: "up",
        down: "down",
      },
    },
  ];

  constructor() {
    super();
  }

  onCellTick(world: World, cell: Cell): void {
    setMovement(cell, this.direction);
  }
}
