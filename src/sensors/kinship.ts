import type { Cell } from "@/cell";
import type { World } from "@/world";
import type { Sensor } from ".";
import { getComponent } from "@/components";
import { gridGetAdjacent } from "@/grid";
import type { Gene } from "@/components/genome";

/**
 * Slot every profile stores a given reason under.
 *
 * Positions are handed out on first sight and never move, so two profiles
 * built at different moments still line up. Filled lazily instead of from the
 * registries, which would import this module back.
 */
const slots = new Map<string, number>();

function slotOf(key: string): number {
  let slot = slots.get(key);
  if (slot === undefined) {
    slot = slots.size;
    slots.set(key, slot);
  }

  return slot;
}

/**
 * Weight a genome puts behind each thing it might do, and behind each reason
 * it might do it. Two genomes agreeing on both want the same things for the
 * same reasons.
 *
 * A profile rather than the gene list itself, because genes are variable
 * length and unordered — two identical policies can be written down in any
 * number of ways.
 *
 * Scaled to unit length on the way in, so comparing two of them is a plain
 * dot product. `filled` lists the slots actually carrying weight — a short
 * genome shouldn't pay for the slots of every gene it doesn't have.
 */
type Profile = {
  weights: Float32Array;
  filled: Int32Array;
};

function profileOf(genes: Gene[]): Profile {
  // Sized to fit every slot this genome could claim, including ones nothing
  // has named yet: writing past the end of a typed array is silently dropped.
  let capacity = slots.size;
  for (const gene of genes) capacity += 1 + gene.sensors.length;

  const weights = new Float32Array(capacity);

  const add = (key: string, weight: number) => {
    const slot = slotOf(key);
    weights[slot] = weights[slot]! + weight;
  };

  for (const gene of genes) {
    add(gene.action, gene.base);

    for (const sensor of gene.sensors) {
      add(`${gene.action}:${sensor}`, gene.base);
    }
  }

  let norm = 0;
  for (const weight of weights) norm += weight * weight;
  norm = Math.sqrt(norm);

  const filled: number[] = [];
  for (let i = 0; i < weights.length; i++) {
    const weight = weights[i]!;
    if (weight === 0) continue;

    if (norm > 0) weights[i] = weight / norm;
    filled.push(i);
  }

  return { weights, filled: Int32Array.from(filled) };
}

/**
 * Cosine similarity of two profiles, mapped onto 0..1.
 */
function similarity(a: Profile, b: Profile): number {
  if (a.filled.length === 0 || b.filled.length === 0) return 0;

  let dot = 0;

  for (const slot of a.filled) {
    // A profile built before the other's genome introduced a slot is simply
    // shorter, and holds no weight there.
    if (slot >= b.weights.length) break;

    dot += a.weights[slot]! * b.weights[slot]!;
  }

  return (dot + 1) / 2;
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
