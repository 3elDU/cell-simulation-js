import type { World } from "@/world";
import type { Renderer } from ".";
import { getCell } from "@/cell";
import { drawImage, type RgbColor } from "./util";
import type { ConfigSchema } from "@/ui";

export class CellRenderer implements Renderer {
  enabled = true;
  id = "cell-renderer";
  title = "Cell Renderer";
  description = `Shows every cell
with the specified color`;

  color: RgbColor = { r: 0, g: 255, b: 0 };

  config: ConfigSchema = [
    {
      prop: "color",
    },
  ];

  async render(ctx: CanvasRenderingContext2D, world: World) {
    await drawImage(ctx, (x, y) => {
      const cell = getCell(world, x, y);
      if (cell) return this.color;
    });
  }
}
