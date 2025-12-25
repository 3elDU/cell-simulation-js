/**
 * Hormones are internal gauges that influence results of systems.
 * One system accumulates a hormone, while a different system can deplete it.
 *
 * Hormones serve as side effect of cell's action - the cell cannot directly
 * accumulate or deplete a hormone.
 */
export interface Hormones {
  stress: number;
}
