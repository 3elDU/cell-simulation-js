import type { World } from "@/world";
import type { Renderer } from ".";
import { drawImage, type RgbaColor, type RgbColor } from "./util";
import { gridGet } from "@/grid";
import type { ConfigSchema } from "@/ui";
import type { Definition } from "@/registry";

/**
 * Draws any grid layer as a black-to-color gradient.
 *
 * The layer is named rather than hardcoded, so a new layer becomes visible by
 * registering another instance of this renderer — no new renderer code. A
 * missing layer draws nothing instead of failing, which is what keeps the
 * picture coherent when the system that owns the layer is switched off.
 */
export class LayerRenderer implements Renderer {
  enabled = true;

  id: string;
  title: string;
  description: string;

  /**
   * Key into `world.layers`. Free-form on purpose — layers are created by
   * systems at runtime, so there is no fixed list the UI could offer.
   */
  layer: string;

  color: RgbColor;

  /**
   * Layer value that maps to full brightness. Layers are not required to
   * share a scale, so each renderer carries its own.
   */
  scale = 255;

  config: ConfigSchema = [
    {
      prop: "layer",
      label: "Layer",
    },
    {
      prop: "color",
      label: "Color",
      color: { type: "float" },
    },
    {
      prop: "scale",
      label: "Full at",
      min: 1,
    },
  ];

  constructor(id: string, title: string, layer: string, color: RgbColor) {
    this.id = id;
    this.title = title;
    this.layer = layer;
    this.color = color;
    this.description = `Draws the "${layer}" layer as a
gradient from black to the
chosen color.`;
  }

  /**
   * Brightness is carried by alpha rather than by darkening the color, so
   * several layers can be shown at once — an empty tile is transparent and
   * lets whatever is underneath through, instead of painting it black.
   */
  computeColor(world: World, x: number, y: number): RgbaColor | undefined {
    const raw = gridGet(world.layers[this.layer]!, { x, y }) ?? 0;
    const value = Math.min(Math.max(raw / this.scale, 0), 1);

    if (value <= 0) return undefined;

    return {
      r: this.color.r * 255,
      g: this.color.g * 255,
      b: this.color.b * 255,
      a: value * 255,
    };
  }

  async render(ctx: CanvasRenderingContext2D, world: World) {
    if (!world.layers[this.layer]) {
      return;
    }

    await drawImage(ctx, (x, y) => this.computeColor(world, x, y));
  }
}

/**
 * Builds a registry definition for one layer. Adding a layer to the UI is a
 * single call to this.
 */
export function layerRenderer(
  layer: string,
  title: string,
  color: RgbColor
): Definition<Renderer> {
  const id = `layer-${layer}`;

  return {
    id,
    title,
    description: `Draws the "${layer}" layer`,
    create: () => new LayerRenderer(id, title, layer, color),
  };
}
