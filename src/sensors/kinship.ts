import type { Cell } from "@/cell";
import type { World } from "@/world";
import type { Sensor } from ".";
import { getComponent } from "@/components";
import { gridGetAdjacent } from "@/grid";
import type { Gene } from "@/components/genome";

/**
 * Weight a genome puts behind each thing it might do, and behind each reason
 * it might do it. Two genomes agreeing on both want the same things for the
 * same reasons.
 *
 * A profile rather than the gene list itself, because genes are variable
 * length and unordered — two identical policies can be written down in any
 * number of ways.
 */
type Profile = Map<string, number>;

function profileOf(genes: Gene[]): Profile {
  const profile: Profile = new Map();

  const add = (key: string, weight: number) =>
    profile.set(key, (profile.get(key) ?? 0) + weight);

  for (const gene of genes) {
    add(gene.action, gene.base);

    for (const sensor of gene.sensors) {
      add(`${gene.action}:${sensor}`, gene.base);
    }
  }

  return profile;
}

/**
 * Cosine similarity of two profiles, mapped onto 0..1.
 */
function similarity(a: Profile, b: Profile): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const [key, weight] of a) {
    dot += weight * (b.get(key) ?? 0);
    normA += weight * weight;
  }

  for (const weight of b.values()) normB += weight * weight;

  if (normA === 0 || normB === 0) return 0;

  return (dot / Math.sqrt(normA * normB) + 1) / 2;
}

/**
 * How much the reachable neighbors look like this cell: 0 among strangers,
 * 1 among copies of itself.
 *
 * Goes quiet when there is nobody to compare against — being alone is not a
 * degree of relatedness, and reporting one would let a gene mistake an empty
 * neighborhood for hostile company.
 */
export class KinshipSensor implements Sensor {
  id = "kinship";
  title = "Kinship";
  description = "How closely the surrounding cells are related";

  /**
   * Genomes are fixed at birth, so a profile is built once per cell. Keyed by
   * the cell itself, so a pruned corpse takes its entry with it.
   */
  private profiles = new WeakMap<Cell, Profile>();

  computeValue(cell: Cell, world: World): number | undefined {
    const own = this.profile(cell);
    if (!own) return undefined;

    let total = 0;
    let seen = 0;

    for (const { value } of gridGetAdjacent(world.grid, cell.position)) {
      if (value === undefined || value === -1) continue;

      const neighbor = world.cells.get(value);
      const other = neighbor && this.profile(neighbor);
      if (!other) continue;

      total += similarity(own, other);
      seen++;
    }

    return seen === 0 ? undefined : total / seen;
  }

  private profile(cell: Cell): Profile | undefined {
    const cached = this.profiles.get(cell);
    if (cached) return cached;

    const genome = getComponent(cell, "genome");
    if (!genome) return undefined;

    const profile = profileOf(genome.genome);
    this.profiles.set(cell, profile);

    return profile;
  }
}
