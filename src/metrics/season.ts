import { getEnabledSystem, type World } from "@/world";
import type { Metric } from ".";
import { LightSystem } from "@/systems/light";

export class SeasonMetric implements Metric {
  id = "season";
  title = "Season";
  description =
    "Graphs seasonal regrow rate. 0 - winter with 0 regrow rate. 1 - summer";
  enabled = false;

  range = 1;
  compute(world: World): number | undefined {
    return getEnabledSystem<LightSystem>(world, "light")?.seasonFactor?.(
      world.tick
    );
  }
}
