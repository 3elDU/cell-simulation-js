/**
 * Signals can be accumulated directly by the cell, and can trigger
 * various actions and side effects.
 *
 * They are somewhat similar to hormones, except hormones are a side effect
 * of direct actions or environmental causes, while signals can be controlled
 * directly by the cell.
 */
export interface Signals {
  alpha: number;
  beta: number;
  gamma: number;
  delta: number;
}
