/**
 * How much a cell has left to spend.
 *
 * Deliberately uncapped. Surplus energy isn't clamped away as worthless — it
 * is dangerous, see the overload risk in the energy system. A cell that hoards
 * has to actively spend to stay safe.
 */
export interface Energy {
  energy: number;
}
