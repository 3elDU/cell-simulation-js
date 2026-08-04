import type { Cell } from "@/cell";
import type { World } from "@/world";
import type { Sensor } from ".";
import { gridGet } from "@/grid";

export class LightSensor implements Sensor {
  id = "light";
  title = "Light";
  description = "Reads from the light layer";

  computeValue(cell: Cell, world: World): number | undefined {
    if (!world.layers.light) return undefined;

    return (gridGet(world.layers.light, cell.position) ?? 0) / 255;
  }
}
