/**
 * Intent to draw energy out of a resource layer this tick.
 *
 * The layer is named rather than being an enum of feeding types, so a new food
 * source is a new registered action plus a layer — the feeding system doesn't
 * need to learn about it.
 */
export interface Harvest {
  layer: string;
}
