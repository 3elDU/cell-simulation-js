import type { Cell } from "@/cell";
import type { World } from "@/world";
import type { System } from ".";
import { BaseSystem } from "./base";
import { setComponent } from "@/components";
import type { ConfigSchema } from "@/ui";
import type { Sensor } from "@/sensors";
import { sensorsRegistry } from "@/sensors/registry";
import type { Sensors } from "@/components/sensors";

export class SensorsSystem extends BaseSystem implements System {
  id = "sensors";
  title = "Sensors";
  description = `Exposes information from the
environment to cells`;
  enabled = true;

  // Readings should describe the world as it is this tick, so every system
  // that writes a layer sensors can read runs first.
  after = ["light", "temperature", "minerals", "organics"];

  noise = 0.15;

  config: ConfigSchema = [
    {
      prop: "noise",
      label: "Noise",
      min: 0,
      max: 1,
      step: 0.01,
    },
  ];

  /**
   * One instance of every registered sensor. Every cell reads all of them;
   * which ones a cell actually cares about is decided by its genome, not here.
   */
  sensors: Sensor[] = [];

  onInit(): void {
    this.sensors = Array.from(sensorsRegistry.list(), def => def.create());
  }

  onCellTick(world: World, cell: Cell): void {
    const readings: Sensors = {};

    for (const sensor of this.sensors) {
      const value = sensor.computeValue(cell, world);
      if (value === undefined) continue;

      // Noise is symmetric — the old one-sided version quietly biased every
      // reading upwards, which selection would have exploited.
      const noisy = value + (Math.random() * 2 - 1) * this.noise;
      readings[sensor.id as keyof Sensors] = Math.min(Math.max(noisy, 0), 1);
    }

    setComponent(cell, "sensors", readings);
  }
}
