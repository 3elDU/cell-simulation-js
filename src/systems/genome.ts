import type { Cell } from "@/cell";
import type { World } from "@/world";
import type { System } from ".";
import { BaseSystem } from "./base";
import { getComponent } from "@/components";
import type { ConfigSchema } from "@/ui";
import type { Gene } from "@/components/genome";
import type { Sensors } from "@/components/sensors";
import type { Action } from "@/actions";
import { actionRegistry } from "@/actions/registry";

export class GenomeSystem extends BaseSystem implements System {
  id = "genome";
  title = "Genome";
  description = `Scores every gene against the cell's
sensors, then performs the winning
action`;

  after = ["sensors"];
  enabled = true;

  selection: "softmax" | "argmax" = "softmax";
  gain = 1.5;
  noiseSigma = 0.1;
  threshold = 0;

  config: ConfigSchema = [
    {
      prop: "selection",
      label: "Selection",
      options: {
        "Softmax (probabilistic)": "softmax",
        "Argmax (winner takes all)": "argmax",
      },
    },
    {
      prop: "gain",
      min: 0,
      step: 0.05,
    },
    {
      prop: "noiseSigma",
      min: 0,
      step: 0.01,
    },
    {
      prop: "threshold",
      step: 0.05,
    },
  ];

  /**
   * One instance of every registered action, looked up by the id stored in a
   * gene. Genes naming an action that isn't here are inert rather than an
   * error — that's what lets a genome survive a system being switched off.
   */
  actions = new Map<string, Action>();

  /**
   * The same actions in a fixed order, so a score can be addressed by
   * position instead of by name, and the slot each id sits at.
   */
  private ordered: Action[] = [];
  private slots = new Map<string, number>();

  /**
   * Scratch space for one cell's scoring, sized to the action count and
   * reused for every cell — scoring runs on the whole population every tick,
   * and a fresh map per cell was most of the cost.
   *
   * `scores` is only meaningful at the slots listed in `touched`; `stamped`
   * marks which of them the current cell has written, so nothing has to be
   * cleared between cells.
   */
  private scores = new Float64Array(0);
  private weights = new Float64Array(0);
  private touched = new Int32Array(0);
  private stamped = new Float64Array(0);
  private stamp = 0;

  onInit(): void {
    this.actions.clear();
    this.slots.clear();
    this.ordered = [];

    for (const def of actionRegistry.list()) {
      const action = def.create();

      this.actions.set(action.id, action);
      this.slots.set(action.id, this.ordered.length);
      this.ordered.push(action);
    }

    const count = this.ordered.length;

    this.scores = new Float64Array(count);
    this.weights = new Float64Array(count);
    this.touched = new Int32Array(count);
    this.stamped = new Float64Array(count);
    this.stamp = 0;
  }

  /**
   * Combines a gene's base weight with the sensors it listens to into a raw
   * score for its action.
   */
  computeActivation(gene: Gene, sensors: Sensors): number {
    let activation = gene.base;

    // Readings arrive in 0..1, centered here to -0.5..0.5 so a sensor can
    // inhibit as well as excite, and so listening to more sensors raises
    // sensitivity without inflating the gene's baseline score.
    // A missing reading lands on exactly 0 — no influence either way.
    for (const id of gene.sensors) activation += (sensors[id] ?? 0.5) - 0.5;

    return activation;
  }

  /**
   * Approximates gaussian noise by summing two uniform samples.
   */
  noise(): number {
    return (Math.random() + Math.random() - 1) * this.noiseSigma;
  }

  /**
   * Sums the scores of every gene, grouped by the action it votes for, and
   * returns how many actions came out with a vote. The scores themselves land
   * in the scratch buffers, at the slots `touched` lists.
   */
  private scoreActions(cell: Cell, genes: Gene[]): number {
    const sensors = getComponent(cell, "sensors") ?? {};
    const stamp = ++this.stamp;

    let count = 0;

    for (const gene of genes) {
      const slot = this.slots.get(gene.action);
      if (slot === undefined) continue;

      const score = this.computeActivation(gene, sensors) + this.noise();

      if (this.stamped[slot] === stamp) {
        this.scores[slot] = this.scores[slot]! + score;
      } else {
        this.stamped[slot] = stamp;
        this.scores[slot] = score;
        this.touched[count++] = slot;
      }
    }

    return count;
  }

  /**
   * Picks the action to perform, or nothing if no action clears the threshold.
   *
   * Argmax makes cells deterministic given their inputs; softmax keeps weaker
   * actions occasionally winning, which stops a population from collapsing
   * onto one behavior too early.
   */
  private chooseAction(count: number): string | undefined {
    const { scores, touched, weights } = this;

    let candidates = 0;
    let best = 0;
    let max = -Infinity;

    // Everything clearing the threshold moves to the front of `touched`,
    // keeping the order the votes arrived in.
    for (let i = 0; i < count; i++) {
      const slot = touched[i]!;
      const score = scores[slot]!;
      if (score < this.threshold) continue;

      if (score > max) {
        max = score;
        best = slot;
      }

      touched[candidates++] = slot;
    }

    if (candidates === 0) return undefined;
    if (this.selection === "argmax") return this.ordered[best]!.id;

    // Softmax. The max is subtracted before exponentiating to keep large
    // scores from overflowing; it cancels out in the ratio.
    let total = 0;
    for (let i = 0; i < candidates; i++) {
      const weight = Math.exp((scores[touched[i]!]! - max) * this.gain);

      weights[i] = weight;
      total += weight;
    }

    let roll = Math.random() * total;
    for (let i = 0; i < candidates; i++) {
      roll -= weights[i]!;
      if (roll <= 0) return this.ordered[touched[i]!]!.id;
    }

    return this.ordered[touched[candidates - 1]!]!.id;
  }

  onCellTick(world: World, cell: Cell): void {
    const genome = getComponent(cell, "genome");
    if (!genome) return;

    const count = this.scoreActions(cell, genome.genome);

    // Read off before choosing, which reorders the scratch buffers.
    const scores: Record<string, number> = {};
    for (let i = 0; i < count; i++) {
      const slot = this.touched[i]!;
      scores[this.ordered[slot]!.id] = this.scores[slot]!;
    }

    const chosen = this.chooseAction(count);

    genome.scores = scores;
    genome.lastAction = chosen;

    if (chosen) {
      const counts = (genome.counts ??= {});
      counts[chosen] = (counts[chosen] ?? 0) + 1;

      this.actions.get(chosen)!.perform(world, cell);
    }
  }
}
