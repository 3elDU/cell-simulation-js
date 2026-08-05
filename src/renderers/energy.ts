import { getEnabledSystem, type World } from "@/world";
import type { Renderer } from ".";
import { getCell } from "@/cell";
import { drawImage, type RgbColor } from "./util";
import type { ConfigSchema } from "@/ui";
import { getComponent } from "@/components";
import type { EnergySystem } from "@/systems/energy";

/**
 * Colors cells by how full they are, from starving to about to burst.
 *
 * Scaled against the energy system's lethal threshold, like the energy sensor,
 * so what you see is what the cell feels. Draws nothing at all when that
 * system is off, rather than painting every cell the same color and implying
 * they are all equally healthy.
 */
export class EnergyRenderer implements Renderer {
  enabled = false;
  id = "energy";
  title = "Cell Energy";
  description = `Colors cells by energy, from
starving to about to burst.`;

  low: RgbColor = { r: 0.15, g: 0.15, b: 0.25 };
  high: RgbColor = { r: 1, g: 0.2, b: 0.1 };

  config: ConfigSchema = [
    { prop: "low", label: "Starving", color: { type: "float" } },
    { prop: "high", label: "Bursting", color: { type: "float" } },
  ];

  async render(ctx: CanvasRenderingContext2D, world: World) {
    const system = getEnabledSystem<EnergySystem>(world, "energy");
    if (!system) return;

    await drawImage(ctx, (x, y) => {
      const cell = getCell(world, x, y);
      if (!cell) return undefined;

      const energy = getComponent(cell, "energy");
      if (!energy) return undefined;

      const t = Math.min(Math.max(energy.energy / system.lethalEnergy, 0), 1);
      const mix = (a: number, b: number) => (a + (b - a) * t) * 255;

      return {
        r: mix(this.low.r, this.high.r),
        g: mix(this.low.g, this.high.g),
        b: mix(this.low.b, this.high.b),
      };
    });
  }
}
