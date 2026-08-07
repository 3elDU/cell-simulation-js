import { countAdjacentCells, type Cell } from "@/cell";
import type { World } from "@/world";
import type { System } from ".";
import { BaseSystem } from "./base";
import { setComponent } from "@/components";
import type { ConfigSchema } from "@/ui";
import { ADJACENT_TILES, gridMaybeGet } from "@/grid";

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

  onCellTick(world: World, cell: Cell): void {
    const lightness = gridMaybeGet(world.layers.light, cell.position, 0) / 255;

    const crowding = countAdjacentCells(world, cell.position) / ADJACENT_TILES;

    setComponent(cell, "temperature", {
      temp: lightness * this.sunFactor + crowding * this.crowdingFactor,
    });
  }
}
