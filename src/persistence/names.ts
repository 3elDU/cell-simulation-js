const ADJECTIVES = [
  "amber",
  "brisk",
  "calm",
  "dim",
  "eager",
  "faint",
  "gentle",
  "hazy",
  "idle",
  "jagged",
  "keen",
  "lively",
  "murky",
  "narrow",
  "opal",
  "pale",
  "quiet",
  "rusty",
  "shallow",
  "tidal",
  "umber",
  "vivid",
  "warm",
  "young",
];

const TEXTURES = [
  "brine",
  "coral",
  "drift",
  "ember",
  "fog",
  "glass",
  "husk",
  "ink",
  "jelly",
  "kelp",
  "loam",
  "moss",
  "nectar",
  "ochre",
  "pollen",
  "resin",
  "silt",
  "tide",
  "vapor",
];

const NOUNS = [
  "basin",
  "bloom",
  "colony",
  "delta",
  "fern",
  "garden",
  "hollow",
  "lagoon",
  "marsh",
  "meadow",
  "pool",
  "reef",
  "shoal",
  "spring",
  "thicket",
  "vent",
];

const pick = (words: string[]) =>
  words[Math.floor(Math.random() * words.length)]!;

/**
 * A few words with dashes — memorable enough to tell two dishes apart in the
 * list without asking anyone to name their experiments.
 */
export function randomDishName(): string {
  return [pick(ADJECTIVES), pick(TEXTURES), pick(NOUNS)].join("-");
}
