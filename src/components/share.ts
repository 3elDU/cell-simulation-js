/**
 * Intent to hand energy to the surrounding cells this tick.
 *
 * Carries no amount: how much leaves and how much arrives are knobs on the
 * system doing the giving, not something a cell decides.
 */
export interface Share {
  intent: boolean;
}
