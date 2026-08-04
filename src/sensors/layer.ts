import type { Cell } from "@/cell";
import type { World } from "@/world";
import type { Sensor } from ".";
import { gridGet, LAYER_MAX } from "@/grid";
import type { Definition } from "@/registry";

/**
 * Reads one resource layer at the cell's own tile, normalized to 0..1.
 *
 * Named rather than hardcoded, so a new layer becomes something genes can
 * react to by registering another instance. Returns nothing when the layer
 * is absent — a cell in a world with no minerals should be unable to tell
 * mineral-poor ground from mineral-free ground, not read a confident zero.
 */
export class LayerSensor implements Sensor {
  id: string;
  title: string;
  description: string;

  layer: string;

  constructor(id: string, title: string, layer: string) {
    this.id = id;
    this.title = title;
    this.layer = layer;
    this.description = `Reads the "${layer}" layer`;
  }

  computeValue(cell: Cell, world: World): number | undefined {
    const grid = world.layers[this.layer];
    if (!grid) return undefined;

    const value = (gridGet(grid, cell.position) ?? 0) / LAYER_MAX;

    return Math.min(Math.max(value, 0), 1);
  }
}

/**
 * Builds a registry definition for one layer sensor.
 */
export function layerSensor(
  layer: string,
  title: string,
): Definition<LayerSensor> {
  return {
    id: layer,
    title,
    description: `Reads the "${layer}" layer`,
    create: () => new LayerSensor(layer, title, layer),
  };
}
