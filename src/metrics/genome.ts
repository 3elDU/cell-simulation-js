import type { World } from "@/world";
import type { Metric } from ".";
import { gridEvery } from "@/grid";
import { getComponent } from "@/components";

export class GenomeMetrics implements Metric {
  id = "genome";
  enabled = false;
  title = "Genome Length";
  description = "Graphs mean genome length in actions across all cells";

  range = 100;

  format(value: number): string {
    return value.toFixed(4);
  }

  compute(world: World): number | undefined {
    let total = 0;
    let cells = 0;

    gridEvery(world.grid, (x, y, id) => {
      const cell = world.cells.get(id)!;

      total += getComponent(cell, "genome")?.genome.length ?? 0;
      cells++;
    });

    return total / cells;
  }
}
