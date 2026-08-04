import type { Action } from ".";

/**
 * Does nothing, on purpose.
 *
 * An explicit idle action lets "stay put" compete with everything else instead
 * of only happening when no other action clears the threshold.
 */
export class IdleAction implements Action {
  id = "idle";
  cost = 0;

  perform(): void {}
}
