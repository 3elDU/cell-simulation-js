import type { World } from "@/world";
import { BaseMetric, type Metric } from ".";
import { gridEvery } from "@/grid";

/**
 * How many cells are alive on the grid.
 *
 * The graph tops out at a full grid, so the same plot reads the same on any
 * world size without rescaling when a bigger dish is opened.
 */
export class PopulationMetric extends BaseMetric implements Metric {
  id = "population";
  title = "Population";
  description = "Cells currently alive on the grid";

  enabled = true;
  range = 1;
  format = (value: number) => value.toFixed(0);

  onInit(world: World) {
    this.range = world.width * world.height;
  }

  compute(world: World): number {
    let count = 0;
    gridEvery(world.grid, () => count++);

    return count;
  }
}
