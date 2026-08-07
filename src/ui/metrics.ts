import type { Metric } from "@/metrics";
import { metricsRegistry } from "@/metrics/registry";
import type { World } from "@/world";
import { Pane } from "tweakpane";

/**
 * Samples kept per graph. Fixed rather than a knob, because tweakpane builds
 * the buffer when the blade is created and cannot resize it afterwards.
 */
const BUFFER_SIZE = 128;

/**
 * Plots registered metrics over time, one graph each.
 *
 * Sampling is driven from the outside rather than by tweakpane's own timer,
 * so a sample is one tick instead of one wall-clock interval — a paused world
 * draws a flat line and a fast one doesn't skip most of its history.
 */
export class MetricsPane extends Pane {
  metrics: Metric[] = [];
  world: World;

  /** Fractions of range the graph bindings read, keyed by metric id. */
  private values: Record<string, number> = {};
  /** The same samples in the metric's own units, for the readout. */
  private raw: Record<string, number> = {};
  /** Raw value each graph tops out at, in the metric's own units. */
  private ceiling: Record<string, number> = {};

  params = { sampleEvery: 30 };

  constructor(container: HTMLElement, world: World) {
    super({ container, title: "Metrics" });

    this.world = world;

    this.addBinding(this.params, "sampleEvery", {
      label: "sample every",
      min: 1,
      max: 100,
      step: 1,
    });

    for (const def of metricsRegistry.list()) {
      const metric = def.create();

      metric.onInit?.(world);

      this.metrics.push(metric);
      this.values[metric.id] = 0;
      this.raw[metric.id] = 0;
      this.ceiling[metric.id] = metric.range;

      this.buildFolder(metric);
    }
  }

  private buildFolder(metric: Metric) {
    const folder = this.addFolder({ title: metric.title, expanded: false });

    folder.addBinding(metric, "description", {
      readonly: true,
      label: undefined,
      multiline: true,
    });

    const enabled = folder.addBinding(metric, "enabled", { label: "Enabled" });

    for (const binding of metric.config ?? []) {
      const target = (binding.object ?? metric) as Record<string, unknown>;
      folder.addBinding(target, binding.prop, binding);
    }

    folder.addBinding(this.ceiling, metric.id, {
      label: "Full at",
      min: metric.range / 1000,
      format: metric.format,
    });

    const graph = folder.addBinding(this.values, metric.id, {
      readonly: true,
      view: "graph",
      // Manual ticker: the graph only takes a sample when refresh() is called.
      interval: 0,
      bufferSize: BUFFER_SIZE,
      label: undefined,
      min: 0,
      max: 1,
      rows: 3,
    });

    const readout = folder.addBinding(this.raw, metric.id, {
      readonly: true,
      label: "current",
      format: metric.format,
    });

    for (const blade of [graph, readout]) {
      blade.hidden = !metric.enabled;
      enabled.on("change", ev => (blade.hidden = !ev.value));
    }
  }

  /**
   * Takes one sample of every enabled metric, unless this tick falls between
   * sampling points.
   *
   * A metric with nothing to report keeps its previous value, so a graph
   * flatlines when its system is switched off instead of claiming the world
   * ran out of whatever it was measuring.
   */
  sample() {
    if (this.world.tick % this.params.sampleEvery !== 0) return;

    for (const metric of this.metrics) {
      if (!metric.enabled) continue;

      const value = metric.compute(this.world);
      if (value === undefined) continue;

      this.raw[metric.id] = value;
      this.values[metric.id] = value / this.ceiling[metric.id]!;
    }

    this.refresh();
  }
}
