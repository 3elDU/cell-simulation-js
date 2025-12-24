import type { World } from "@/world";
import type { Renderer } from ".";
import { drawColor, type RgbColor } from "./util";
import { gridGet } from "@/grid";

export class LightnessRenderer implements Renderer {
  enabled = true;
  id = "lightness";
  title = "Lightness";
  description = "The more yellow the area is, the more light is there";

  computeColor(world: World, x: number, y: number): RgbColor {
    const lightness = gridGet<Uint8Array>(world.layers.light!, { x, y }) ?? 0;

    return {
      r: lightness,
      g: lightness,
      b: 0,
    };
  }

  render(ctx: CanvasRenderingContext2D, world: World) {
    if (!world.layers.light) {
      return;
    }

    const img = ctx.createImageData(world.width, world.height);

    for (let x = 0; x < world.width; x++) {
      for (let y = 0; y < world.height; y++) {
        drawColor(img, x, y, this.computeColor(world, x, y));
      }
    }

    ctx.putImageData(img, 0, 0);
  }
}
