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

  canMoveTo(world: World, to: Position): boolean {
    return getCell(world, to.x, to.y) === undefined;
  }

  onCellTick(world: World, cell: Cell): void {
    const movement = getComponent(cell, "movement");
    if (!movement) return;

    const position = structuredClone(cell.position);

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

    // Out-of-bounds check.
    // No wrapping here, just don't allow the cell to move any further
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

    // Abort early if the space is occupied by another cell
    if (!this.canMoveTo(world, position)) {
      return;
    }

    // Set previous cell location to empty space
    gridSet(world.grid, { x: prevX, y: prevY }, -1);
    // Move set to current location
    gridSet(world.grid, position, cell.id);

    // Update position
    cell.position = position;

    // Clear movement direction
    delete cell.components.movement;
  }
}
