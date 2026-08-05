/**
 * A cell's reproductive state — both what it wants to do this tick and what it
 * has managed so far.
 *
 * The lineage counters aren't used by any system; they exist so the inspector
 * can answer "is this population actually evolving, or just churning?". A
 * generation number climbing while the genome drifts is the whole point of the
 * simulation, and it's invisible without somewhere to write it down.
 */
export interface Reproduction {
  /**
   * Set by the reproduce action, cleared by the reproduction system whether or
   * not the birth succeeded. Transient, like the harvest intent.
   */
  intent?: boolean;

  /**
   * How many ancestors this cell has. Cells created by the generator start
   * at 0.
   */
  generation: number;

  /**
   * Successful births, not attempts.
   */
  children: number;
}
