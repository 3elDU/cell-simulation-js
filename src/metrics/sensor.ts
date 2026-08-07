import type { World } from "@/world";
import { BaseMetric, type Metric } from ".";
import type { ConfigSchema } from "@/ui";
import type { Definition } from "@/registry";
import { sensorsRegistry } from "@/sensors/registry";
import type { Sensor } from "@/sensors";
import { gridEvery } from "@/grid";

/**
 * Averages one sensor reading across every cell on the grid.
 *
 * Reuses a sensor for the same reason the sensor renderer does — it is
 * already a number in 0..1 that goes quiet when its dependency is missing —
 * so a newly registered reading becomes plottable without new code here.
 *
 * Cells the sensor cannot answer for are left out of the average rather than
 * counted as zero, and a tick where nothing can answer reports nothing.
 */
export class SensorMetric extends BaseMetric implements Metric {
  id: string;
  title: string;
  description: string;

  /** Id of the sensor to read, live so it can be repointed mid-run. */
  sensor: string;

  range = 1;
  format = (value: number) => value.toFixed(3);

  config: ConfigSchema = [{ prop: "sensor", label: "Sensor" }];

  constructor(id: string, title: string, sensor: string) {
    super();

    this.id = id;
    this.title = title;
    this.sensor = sensor;
    this.description = `Mean of the "${sensor}" sensor
across all cells.`;
  }

  private resolve(): Sensor | undefined {
    return sensorsRegistry.get(this.sensor)?.create();
  }

  compute(world: World): number | undefined {
    const sensor = this.resolve();
    if (!sensor) return undefined;

    let total = 0;
    let count = 0;

    gridEvery(world.grid, (_x, _y, id) => {
      const value = sensor.computeValue(world.cells.get(id)!, world);
      if (value === undefined) return;

      total += value;
      count++;
    });

    return count > 0 ? total / count : undefined;
  }
}

/**
 * Builds a registry definition for one sensor. Plotting a new reading is a
 * single call to this.
 */
export function sensorMetric(
  sensor: string,
  title: string
): Definition<Metric> {
  const id = `sensor-${sensor}`;

  return {
    id,
    title,
    description: `Mean of the "${sensor}" sensor`,
    create: () => new SensorMetric(id, title, sensor),
  };
}
