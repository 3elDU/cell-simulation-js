import type { Cell } from "../cell";
import type { ConfigSchema, UIDescription } from "../ui";
import type { World } from "../world";
import type { Modifier, Stat } from "./stats";

export interface System extends UIDescription {
  id: string;
  enabled: boolean;

  config?: ConfigSchema;

  /**
   * Numbers this system owns that a cell's state is allowed to scale. The
   * system applies the factor itself and never learns where it came from.
   */
  stats?: Stat[];

  /**
   * Set together to scale other systems' stats — see `Modifier`. A system
   * with factors but no `affects` scales nothing.
   */
  affects?: Modifier["affects"];
  factors?: Modifier["factors"];

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
  // Systems that declare `after` sort to the end first
  systems.sort((a, b) => {
    const aDeclared = a.after?.length;
    const bDeclared = b.after?.length;

    if (aDeclared && bDeclared) return 0;
    else if (aDeclared) return 1;
    else return -1;
  });

  systems.forEach((system, idx, arr) => {
    if (!system.after) return;

    arr.splice(idx, 1);

    // Greatest index among its dependencies — the system goes right after it.
    const newIdx = Math.max(
      ...(system.after?.map(id => arr.findIndex(sys => sys.id === id)) ?? [idx])
    );

    arr.splice(newIdx + 1, 0, system);
  });
}
