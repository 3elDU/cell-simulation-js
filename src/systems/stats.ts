import type { Cell } from "@/cell";
import type { ConfigSchema } from "@/ui";
import type { World } from "@/world";

/**
 * Every number a cell's own state is allowed to scale.
 *
 * Listed centrally so both ends of the channel are checked against the same
 * set: the system that owns a number never learns which states bend it, and a
 * state never learns which system owns what it bends.
 */
export type StatId =
  | "energy.upkeep"
  | "age.lifespan"
  | "reproduction.cost"
  | "reproduction.threshold"
  | "sharing.efficiency";

export interface Stat {
  id: StatId;
  title: string;
}

/**
 * What a system declares to scale the stats of other systems.
 *
 * Flat rather than a nested bag, so the factors are saved with the rest of a
 * system's settings instead of being skipped as a live reference.
 */
export interface Modifier {
  /**
   * Cells the factors apply to.
   */
  affects(cell: Cell): boolean;

  /**
   * Multiplier per stat. A modifier declares the ones it exists for and gets
   * the rest handed to it at init, at no effect.
   */
  factors: Partial<Record<StatId, number>>;
}

/**
 * Wires a modifier up to every stat declared in the world and returns the
 * knobs for them.
 *
 * A system declaring a new stat gives every modifier a slider for it, at no
 * effect until someone drags it.
 */
export function modifierConfig(world: World, modifier: Modifier): ConfigSchema {
  const config: ConfigSchema = [];

  for (const system of world.systems) {
    for (const stat of system.stats ?? []) {
      modifier.factors[stat.id] ??= 1;

      config.push({
        prop: stat.id,
        // Bound to the map rather than to a field, since which stats exist
        // isn't known until runtime.
        object: modifier.factors,
        label: stat.title,
        min: 0,
        step: 0.05,
      });
    }
  }

  return config;
}
