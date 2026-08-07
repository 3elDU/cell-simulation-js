import type { ConfigSchema, UIDescription } from "@/ui";
import type { World } from "@/world";

/**
 * One number read off the world each sample, plotted over time.
 *
 * Deliberately unaware of how it is drawn: a metric produces a value in its
 * own units and says what the top of a graph would be, so the same registry
 * can back a different plotting surface later.
 */
export interface Metric extends UIDescription {
  id: string;
  enabled: boolean;

  /** Raw value a full graph would represent, used as its starting ceiling. */
  range: number;

  config?: ConfigSchema;

  /** How the raw value is printed next to the graph. */
  format?: (value: number) => string;

  /**
   * Called once per world, for a metric whose range only exists once there is
   * a world to measure.
   */
  onInit?(world: World): void;

  /**
   * Undefined when the metric has nothing to report — an absent layer, or a
   * world with no cells in it.
   */
  compute(world: World): number | undefined;
}

/**
 * A metric that is off until asked for.
 */
export class BaseMetric {
  enabled = false;
}
