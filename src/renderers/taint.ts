import type { World } from "@/world";
import type { Renderer } from ".";
import { getCell } from "@/cell";
import { drawImage } from "./util";
import { getComponent } from "@/components";

/**
 * Shows every cell in its own inherited color, so a lineage reads as a patch
 * of one shade and a color boundary is a variant that spread.
 */
export class TaintRenderer implements Renderer {
  enabled = false;
  id = "taint-renderer";
  title = "Cell Lineage";
  description = `Shows every cell in its
inherited lineage color.`;

  async render(ctx: CanvasRenderingContext2D, world: World) {
    await drawImage(ctx, (x, y) => {
      const cell = getCell(world, x, y);
      if (!cell) return undefined;

      return getComponent(cell, "taint")?.color;
    });
  }
}
