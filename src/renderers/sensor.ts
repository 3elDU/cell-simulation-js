import type { World } from "@/world";
import type { Renderer } from ".";
import { drawImage, type RgbColor } from "./util";
import { getCell } from "@/cell";
import type { ConfigSchema } from "@/ui";
import type { Definition } from "@/registry";
import { sensorsRegistry } from "@/sensors/registry";
import type { Sensor } from "@/sensors";

/**
 * Colors cells by one sensor reading, blended between two colors.
 *
 * Reuses a sensor rather than reading components directly — a sensor is
 * already "one number in 0..1, or nothing when its dependency is missing",
 * exactly what a per-cell color needs, and keeps the canvas unable to
 * disagree with the inspector.
 *
 * A missing or unregistered sensor draws nothing, so switching off a
 * dependency quietly empties this layer.
 */
export class SensorRenderer implements Renderer {
  enabled = false;

  id: string;
  title: string;
  description: string;

  /**
   * Id of the sensor to read. Free-form, so this can be pointed at any
   * registered sensor live — including ones registered after this renderer.
   */
  sensor: string;

  low: RgbColor;
  high: RgbColor;

  config: ConfigSchema = [
    { prop: "sensor", label: "Sensor" },
    { prop: "low", label: "At 0", color: { type: "float" } },
    { prop: "high", label: "At 1", color: { type: "float" } },
  ];

  constructor(
    id: string,
    title: string,
    sensor: string,
    low: RgbColor,
    high: RgbColor
  ) {
    this.id = id;
    this.title = title;
    this.sensor = sensor;
    this.low = low;
    this.high = high;
    this.description = `Colors cells by the "${sensor}"
sensor reading.`;
  }

  /**
   * Built per render rather than in the constructor, since the id is a live
   * knob — and sensors are stateless, so there is nothing to preserve.
   */
  private resolve(): Sensor | undefined {
    return sensorsRegistry.get(this.sensor)?.create();
  }

  async render(ctx: CanvasRenderingContext2D, world: World) {
    const sensor = this.resolve();
    if (!sensor) return;

    await drawImage(ctx, (x, y) => {
      const cell = getCell(world, x, y);
      if (!cell) return undefined;

      const value = sensor.computeValue(cell, world);
      if (value === undefined) return undefined;

      const t = Math.min(Math.max(value, 0), 1);
      const mix = (a: number, b: number) => (a + (b - a) * t) * 255;

      return {
        r: mix(this.low.r, this.high.r),
        g: mix(this.low.g, this.high.g),
        b: mix(this.low.b, this.high.b),
      };
    });
  }
}

/**
 * Builds a registry definition for one sensor. Making a new reading visible is
 * a single call to this.
 */
export function sensorRenderer(
  sensor: string,
  title: string,
  low: RgbColor,
  high: RgbColor
): Definition<Renderer> {
  const id = `sensor-${sensor}`;

  return {
    id,
    title,
    description: `Colors cells by the "${sensor}" sensor`,
    create: () => new SensorRenderer(id, title, sensor, low, high),
  };
}
