import type { Cell } from "../cell";
import type { ConfigSchema, UIDescription } from "../ui";
import type { World } from "../world";

export interface System extends UIDescription {
  id: string;
  enabled: boolean;

  config?: ConfigSchema;

  /**
   * A system can be specified to run after another system, if it uses
   * output of the former. This establishes loose but explicit ordering.
   *
   * This doesn't signal dependence on the system, only a preference to run
   * after it if the dependency exists.
   */
  after?: string[];

  /**
   * Called when a system is first registered into the World
   */
  onInit?(world: World): void;

  /**
   * Called on every world tick
   */
  onTick?(world: World): void;

  /**
   * Called on every world tick, for every cell that is
   * currently present on the map.
   */
  onCellTick?(world: World, cell: Cell): void;

  /**
   * Called when a cell is born from another one, before the child takes its
   * first tick. Lets a system decide what its own data does across a birth —
   * inherited, dropped, or inherited with a change.
   */
  onCellBirth?(world: World, parent: Cell, child: Cell): void;
}

/**
 * Sorts the array of systems in-place, placing systems that need
 * outputs of other systems after their dependencies.
 *
 * Doesn't handle circular dependencies.
 */
export function sortSystems(systems: System[]) {
  // First, place systems that have declared after or dependsOr in the end
  systems.sort((a, b) => {
    const aDeclared = a.after?.length;
    const bDeclared = b.after?.length;

    if (aDeclared && bDeclared) return 0;
    else if (aDeclared) return 1;
    else return -1;
  });

  // Iterate of each system and place it after its dependencies
  systems.forEach((system, idx, arr) => {
    // Don't do anything if system doesn't have dependencies
    if (!system.after) return;

    // Remove system from an array
    arr.splice(idx, 1);

    // Find the greatest index of a dependency, and place this system after it.
    const newIdx = Math.max(
      ...(system.after?.map(id => arr.findIndex(sys => sys.id === id)) ?? [idx])
    );

    // Insert system after the dependency with greatest index
    arr.splice(newIdx + 1, 0, system);
  });
}
