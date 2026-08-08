import type { Sensors } from "./sensors";

/**
 * How one gene reads one sensor.
 *
 * Together the pair describes a preferred amount rather than a direction:
 * `target` is the reading the gene likes best, `weight` is how much reaching
 * it is worth. A gene can therefore want a middling reading — something no
 * amount of plain scaling can express, since scaling only ever produces "more
 * is better" or "less is better".
 */
export interface SensorWeight {
  /**
   * Signed. Negative flips the preference inside out: the target becomes the
   * reading the gene most wants to avoid.
   *
   * Magnitude is capped at birth, so no lineage can evolve scores large
   * enough to turn the genome system's softmax into a winner-takes-all.
   */
  weight: number;

  /** The favored reading, on the same 0..1 scale sensors report in. */
  target: number;
}

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
   * Stores the action id, not the reference — a globally disabled action
   * turns the gene into a no-op.
   */
  action: string;

  /**
   * Base weight for execution probability.
   *
   * A float from -1 to 1
   */
  base: number;

  /**
   * Which sensors this gene listens to, and how it reads each.
   *
   * A gene may listen to none (making it react only to its base weight),
   * one, or several. Sensors it doesn't list simply don't affect it.
   */
  sensors: Partial<Record<keyof Sensors, SensorWeight>>;
}

/**
 * Copies a gene's sensor map deeply, so the copy's entries can be nudged
 * without the original drifting with them.
 */
export function copySensors(
  sensors: Gene["sensors"]
): Partial<Record<keyof Sensors, SensorWeight>> {
  const copy: Partial<Record<keyof Sensors, SensorWeight>> = {};

  for (const id in sensors) {
    const key = id as keyof Sensors;
    copy[key] = { ...sensors[key]! };
  }

  return copy;
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

  /**
   * How many times each action was picked over this cell's life, so what it
   * spent that life doing can be read off it long after the fact.
   *
   * Not inherited: a child starts with an empty record, since these count what
   * happened rather than what the genome says should.
   */
  counts?: Record<string, number>;
}
