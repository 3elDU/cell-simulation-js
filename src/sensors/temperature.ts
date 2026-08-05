import type { Cell } from "@/cell";
import type { World } from "@/world";
import type { Sensor } from ".";
import { getComponent } from "@/components";

export class TemperatureSensor implements Sensor {
  id = "temperature";
  title = "Temperature";
  description = "Computes cell temperature";

  computeValue(cell: Cell, _world: World): number | undefined {
    return getComponent(cell, "temperature")?.temp;
  }
}
