import type { System } from ".";
import type { World } from "@/world";
import type { ConfigSchema } from "@/ui";
import { modifierConfig, type Modifier, type StatId } from "./stats";
import { BaseSystem } from "./base";

/**
 * Scales every stat in the world by hand, for every cell.
 *
 * A modifier with no condition attached: it puts the numbers other systems
 * expose within reach before anything exists to bend them on its own, and
 * makes the whole set visible in one place.
 */
export class ModifiersSystem extends BaseSystem implements System, Modifier {
  id = "modifiers";
  title = "Modifiers";
  description = `Scales the tunable numbers
of other systems, for every
cell at once.

1 leaves a number alone.`;
  enabled = true;

  factors: Partial<Record<StatId, number>> = {};

  config: ConfigSchema = [];

  affects(): boolean {
    return true;
  }

  onInit(world: World): void {
    this.config = modifierConfig(world, this);
  }
}
