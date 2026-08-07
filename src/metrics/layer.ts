import type { World } from "@/world";
import { BaseMetric, type Metric } from ".";
import type { ConfigSchema } from "@/ui";
import type { Definition } from "@/registry";
import { LAYER_MAX } from "@/grid";

/**
 * Averages one grid layer over every tile.
 *
 * The layer is named rather than hardcoded, so a new layer becomes plottable
 * by registering another instance. A missing layer reports nothing instead of
 * a zero, so switching off the system that owns it flatlines the graph rather
 * than claiming the world ran out.
 */
export class LayerMetric extends BaseMetric implements Metric {
  id: string;
  title: string;
  description: string;

  /** Key into `world.layers`, live so it can be repointed mid-run. */
  layer: string;

  range = LAYER_MAX;
  format = (value: number) => value.toFixed(1);

  config: ConfigSchema = [];

  constructor(id: string, title: string, layer: string) {
    super();

    this.id = id;
    this.title = title;
    this.layer = layer;
    this.description = `Mean of the "${layer}" layer
across the whole grid.`;
  }

  compute(world: World): number | undefined {
    const grid = world.layers[this.layer];
    if (!grid) return undefined;

    let total = 0;
    for (const value of grid.data) total += value;

    return total / grid.data.length;
  }
}

/**
 * Builds a registry definition for one layer. Plotting a new layer is a
 * single call to this.
 */
export function layerMetric(layer: string, title: string): Definition<Metric> {
  const id = `layer-${layer}`;

  return {
    id,
    title,
    description: `Mean of the "${layer}" layer`,
    create: () => new LayerMetric(id, title, layer),
  };
}
