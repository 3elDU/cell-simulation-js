/**
 * A single, swappable source of randomness for the whole simulation.
 *
 * Every system draws from {@link random} instead of calling `Math.random`
 * directly. That makes a run reproducible: seed the generator and the same
 * world unfolds the same way every time.
 */

/**
 * Anything that behaves like `Math.random`: returns a float in `[0, 1)`.
 */
export type Rng = () => number;

/**
 * Mulberry32 — a small, fast PRNG with a 32-bit state.
 *
 * Not cryptographically secure, which is exactly fine here.
 */
export function mulberry32(seed: number): Rng {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;

    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The generator every system draws from.
 *
 * This is a live binding, so importers see replacements made through
 * {@link setRandom}.
 */
export let random: Rng = Math.random;

/**
 * Replaces the global generator, e.g. with a seeded one.
 */
export function setRandom(rng: Rng) {
  random = rng;
}

/**
 * Restores the default, unseeded generator.
 */
export function resetRandom() {
  random = Math.random;
}
