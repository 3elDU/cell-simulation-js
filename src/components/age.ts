/**
 * How many ticks a cell has been alive.
 *
 * A counter rather than a birth tick, so a cell that existed before the age
 * system was switched on starts from zero like everything else instead of
 * being instantly ancient.
 */
export interface Age {
  age: number;
}
