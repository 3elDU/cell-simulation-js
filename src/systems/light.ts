import type { System } from "@/systems";
import { BaseSystem } from "./base";
import type { World } from "@/world";
import { gridSet, type GridLayer } from "@/grid";

/**
 * Fills the light layer.
 *
 * Value on every pixel determines how much energy the cell will get from
 * photosynthesis
 */
export class LightSystem extends BaseSystem implements System {
  id = "light";
  title = "Light";
  description = "Manages the light layer";

  /**
   * Computes luminance
   */
  luminanceForPosition(x: number, y: number, world: World): number {
    // Compute a gradient with light being at max strength at y=world height,
    // and mininum strength at y=0
    return (y / world.height) * 255;
  }

  onInit(world: World): void {
    if (!world.layers.light) {
      world.layers.light = {
        width: world.width,
        height: world.height,
        data: new Uint8Array(world.width * world.height),
      };
    }

    const grid = world.layers.light as GridLayer<Uint8Array>;

    for (let x = 0; x < world.width; x++) {
      for (let y = 0; y < world.height; y++) {
        gridSet(grid, { x, y }, this.luminanceForPosition(x, y, world));
      }
    }
  }
}
