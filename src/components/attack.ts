/**
 * Intent to drain the surrounding cells this tick.
 *
 * Carries no target: how much is taken and how much of it is kept are knobs
 * on the system doing the draining.
 */
export interface Attack {
  intent: boolean;
}
