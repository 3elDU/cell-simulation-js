import type { World } from "@/world";
import type { Renderer } from ".";
import { getCell } from "@/cell";
import { drawImage, type RgbColor } from "./util";
import type { ConfigSchema } from "@/ui";
import { getComponent } from "@/components";

/**
 * Shows every cell, colored by how it has spent its life — the balance
 * between two actions it chose over time, blended between two colors.
 *
 * Reads what a cell did rather than what its genome votes for: a gene can
 * favor an action the cell never gets to take, and a lineage's diet is a
 * question about behavior, not about weights.
 */
export class CellRenderer implements Renderer {
  enabled = true;
  id = "cell-renderer";
  title = "Cell Renderer";
  description = `Shows every cell, colored by
the balance between two actions
it has taken over its life.

A taint color wins over both.`;

  /**
   * Drawn for a cell that has taken neither action, so "no diet yet" stays
   * distinguishable from either end of the gradient.
   */
  color: RgbColor = { r: 120, g: 120, b: 120 };

  /**
   * Ids of the two actions weighed against each other. Free-form, so this can
   * be pointed at any pair of registered actions live.
   */
  lowAction = "photosynthesize";
  highAction = "attack";

  low: RgbColor = { r: 0, g: 255, b: 0 };
  high: RgbColor = { r: 255, g: 0, b: 0 };

  config: ConfigSchema = [
    { prop: "lowAction", label: "Action at 0" },
    { prop: "highAction", label: "Action at 1" },
    { prop: "low", label: "At 0" },
    { prop: "high", label: "At 1" },
    { prop: "color", label: "Neither" },
  ];

  async render(ctx: CanvasRenderingContext2D, world: World) {
    await drawImage(ctx, (x, y) => {
      const cell = getCell(world, x, y);
      if (!cell) return undefined;

      // A marked lineage keeps its own color, whatever it eats.
      const taint = getComponent(cell, "taint")?.color;
      if (taint) return taint;

      const counts = getComponent(cell, "genome")?.counts;
      const lows = counts?.[this.lowAction] ?? 0;
      const highs = counts?.[this.highAction] ?? 0;

      const total = lows + highs;
      if (total === 0) return this.color;

      const t = highs / total;
      const mix = (a: number, b: number) => a + (b - a) * t;

      return {
        r: mix(this.low.r, this.high.r),
        g: mix(this.low.g, this.high.g),
        b: mix(this.low.b, this.high.b),
      };
    });
  }
}
