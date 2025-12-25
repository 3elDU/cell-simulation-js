import type { Cell } from "@/cell";
import type { World } from "@/world";
import type { System } from ".";
import { BaseSystem } from "./base";
import { setComponent } from "@/components";
import { gridGet } from "@/grid";
import type { ConfigSchema } from "@/ui";

export class SensorsSystem extends BaseSystem implements System {
  id = "sensors";
  title = "Sensors";
  description = `Exposes information from the
environment to cells`;

  noise = 0.15;

  static options = {
    None: "none",
    Light: "light",
  };

  sensorA = "light";
  sensorB = "none";
  sensorC = "none";
  sensorD = "none";

  config: ConfigSchema = [
    {
      prop: "sensorA",
      label: "Sensor A",
      options: SensorsSystem.options,
    },
    {
      prop: "sensorB",
      label: "Sensor B",
      options: SensorsSystem.options,
    },
    {
      prop: "sensorC",
      label: "Sensor C",
      options: SensorsSystem.options,
    },
    {
      prop: "sensorD",
      label: "Sensor D",
      options: SensorsSystem.options,
    },
    {
      prop: "noise",
      label: "Noise",
      min: 0,
      max: 1,
      step: 0.01,
    },
  ];

  valueForSensorType(
    world: World,
    cell: Cell,
    type: string
  ): number | undefined {
    let value: number;
    switch (type) {
      case "light":
        if (!world.layers.light) return undefined;

        value = (gridGet(world.layers.light, cell.position) ?? 0) / 255;
        break;

      case "none":
      default:
        value = 0;
    }

    console.log("sensors", type, value);

    return Math.min(Math.max(value + Math.random() * this.noise, 0), 1.0);
  }

  onCellTick(world: World, cell: Cell): void {
    setComponent(cell, "sensors", {
      a: this.valueForSensorType(world, cell, this.sensorA) ?? 0,
      b: this.valueForSensorType(world, cell, this.sensorB) ?? 0,
      c: this.valueForSensorType(world, cell, this.sensorC) ?? 0,
      d: this.valueForSensorType(world, cell, this.sensorD) ?? 0,
    });
  }
}
