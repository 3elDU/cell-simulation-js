import type { Sensors } from "./sensors";

/**
 * A single vote for an action.
 *
 * A gene combines its base weight with the sensors it listens to into a score.
 * Every tick all genes are scored, scores for the same action add up, and one
 * action wins — so a genome is a policy, not a program. Several genes may push
 * the same action for different reasons ("move when dark", "move when hot").
 */
export interface Gene {
  /**
   * Stores the action id, not the reference.
   *
   * This is intentional. If action is disabled globaly, gene becomes a no-op.
   */
  action: string;

  /**
   * Base weight for execution probability.
   *
   * A float from -1 to 1
   */
  base: number;

  /**
   * Which sensors this gene listens to, by id.
   *
   * A gene may listen to none (making it react only to its base weight),
   * one, or several. Sensors it doesn't list simply don't affect it.
   */
  sensors: (keyof Sensors)[];
}

export interface Genome {
  genome: Gene[];

  /**
   * Whether this genome came out of birth different from the parent's. Absent
   * on cells that were never born from another.
   */
  mutated?: boolean;

  /**
   * Action chosen on the last tick, and the score every action reached.
   *
   * Written by the genome system purely so a cell can be inspected — a
   * simulation you can't ask "why did it do that?" isn't much use.
   */
  lastAction?: string;
  scores?: Record<string, number>;
}
