import { type Cell } from "@/cell";
import type { World } from "@/world";
import type { System } from ".";
import { BaseSystem } from "./base";
import { setComponent } from "@/components";
import { gridMaybeGet } from "@/grid";

export class TemperatureSystem extends BaseSystem implements System {
  id = "temperature";
  title = "Temperature";
  description = `Manages temperature component
of the cell.`;
  enabled = true;

  onCellTick(world: World, cell: Cell): void {
    const lightness = gridMaybeGet(world.layers.light, cell.position, 0) / 255;

    setComponent(cell, "temperature", {
      temp: lightness,
    });
  }
}
