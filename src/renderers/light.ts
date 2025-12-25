import type { World } from "@/world";
import type { Renderer } from ".";
import { drawImage, type RgbColor } from "./util";
import { gridGet } from "@/grid";
import type { ConfigSchema } from "@/ui";

export class LightnessRenderer implements Renderer {
  enabled = true;
  id = "lightness";
  title = "Lightness";
  description = `Shows amount of light on each
pixel, with a gradient from
black to the specified color.`;

  color: RgbColor = { r: 1, g: 1, b: 0 };

  config: ConfigSchema = [
    {
      prop: "color",
      label: "Light color",
      color: { type: "float" },
    },
  ];

  computeColor(world: World, x: number, y: number): RgbColor {
    const lightness = gridGet<Uint8Array>(world.layers.light!, { x, y }) ?? 0;

    return {
      r: this.color.r * lightness,
      g: this.color.g * lightness,
      b: this.color.b * lightness,
    };
  }

  async render(ctx: CanvasRenderingContext2D, world: World) {
    if (!world.layers.light) {
      return;
    }

    await drawImage(ctx, (x, y) => this.computeColor(world, x, y));
  }
}
