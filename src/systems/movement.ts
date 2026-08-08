import type { System } from "@/systems";
import { BaseSystem } from "./base";
import { getCell, type Cell } from "@/cell";
import type { World } from "@/world";
import { gridSet, type Position } from "@/grid";
import { getComponent } from "@/components";

export class MovementSystem extends BaseSystem implements System {
  id = "movement";
  title = "Movement";
  description = "Allows cell to move in any direction";
  enabled = true;

  // Late enough for anything that revokes a move to have done so.
  after = ["anchor"];

  canMoveTo(world: World, to: Position): boolean {
    return getCell(world, to.x, to.y) === undefined;
  }

  onCellTick(world: World, cell: Cell): void {
    const movement = getComponent(cell, "movement");
    if (!movement) return;

    const position: Position = {
      x: cell.position.x,
      y: cell.position.y,
    };

    let vector: Position;
    switch (movement.dir) {
      case "left":
        vector = { x: -1, y: 0 };
        break;
      case "right":
        vector = { x: 1, y: 0 };
        break;
      case "down":
        vector = { x: 0, y: 1 };
        break;
      case "up":
        vector = { x: 0, y: -1 };
        break;
    }

    const prevX = position.x;
    const prevY = position.y;

    position.x += vector.x;
    position.y += vector.y;

    // Clamped rather than wrapped at the edges.
    if (position.x < 0) {
      position.x = 0;
    }
    if (position.x >= world.width) {
      position.x = world.width - 1;
    }
    if (position.y < 0) {
      position.y = 0;
    }
    if (position.y >= world.height) {
      position.y = world.height - 1;
    }

    if (!this.canMoveTo(world, position)) {
      return;
    }

    gridSet(world.grid, { x: prevX, y: prevY }, -1);
    gridSet(world.grid, position, cell.id);

    cell.position = position;

    delete cell.components.movement;
  }
}
