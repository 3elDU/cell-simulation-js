import type { World } from "@/world";
import type { Metric } from ".";
import { gridEvery } from "@/grid";
import { getComponent } from "@/components";

export class GenerationMetric implements Metric {
  id = "generation";
  title = "Generation";
  description = "Mean generation across all cells";
  enabled = false;

  range = 1;

  compute(world: World): number {
    let generations = 0;
    let cells = 0;

    gridEvery(world.grid, (x, y, id) => {
      generations +=
        getComponent(world.cells.get(id)!, "reproduction")?.generation ?? 0;
      cells++;
    });

    return generations / cells;
  }
}
