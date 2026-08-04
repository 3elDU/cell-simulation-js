import type { SensorsMap } from "@/sensors/registry";

/**
 * Sensors expose arbitrary information from cells' surroundings to
 * the cell, as floating point numbers from 0 to 1.
 *
 * Readings are optional: a sensor whose dependency is missing (a disabled
 * system, an absent layer) leaves its key out entirely, rather than reporting
 * a 0 that genes would read as a real measurement.
 */
export type Sensors = {
  [k in keyof SensorsMap]?: number;
};
