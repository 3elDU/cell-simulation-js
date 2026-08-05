import type { Cell } from "@/cell";
import type { World } from "@/world";
import type { System } from ".";
import { BaseSystem } from "./base";
import { setComponent } from "@/components";
import type { ConfigSchema } from "@/ui";
import { gridGet, gridGetNeighbors, gridMaybeGet, type Position } from "@/grid";

export class TemperatureSystem extends BaseSystem implements System {
  id = "temperature";
  title = "Temperature";
  description = `Manages temperature component
of the cell.

Environmental factors can be
configured to influence the
temperature.`;
  enabled = true;

  crowdingFactor = 0.7;
  sunFactor = 0.3;

  config: ConfigSchema = [
    {
      prop: "crowdingFactor",
      min: 0,
      max: 1,
    },
    {
      prop: "sunFactor",
      min: 0,
      max: 1,
    },
  ];

  countNonEmptyNeighbors(world: World, base: Position) {
    // Returns the count of neighboring cells.
    return gridGetNeighbors(world.grid, base).filter(
      (neighbor) => neighbor.value !== undefined,
    ).length;
  }

  onCellTick(world: World, cell: Cell): void {
    const lightness = gridMaybeGet(world.layers.light, cell.position, 0) / 255;

    // Divide by 8 (cell has 8 neighboring tiles) to get a value from 0 to 1
    const crowding = this.countNonEmptyNeighbors(world, cell.position) / 8;

    setComponent(cell, "temperature", {
      temp: lightness * this.sunFactor + crowding * this.crowdingFactor,
    });
  }
}
