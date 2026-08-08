/**
 * Whether the cell has settled onto its tile, and whether it is asking to.
 *
 * Nothing hands this down at a birth, so settling is a decision every cell
 * makes for itself rather than one a lineage makes once.
 */
export interface Anchor {
  anchored: boolean;

  /**
   * Intent to settle. Carries no terms: what settling costs and what it is
   * worth are knobs on the system that grants it.
   */
  intent: boolean;
}
