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

  onInit(): void {
    this.actions.clear();
    for (const def of actionRegistry.list()) {
      const action = def.create();
      this.actions.set(action.id, action);
    }
  }

  /**
   * Combines a gene's base weight with the sensors it listens to into a raw
   * score for its action.
   */
  computeActivation(gene: Gene, sensors: Sensors): number {
    return (
      gene.base +
      gene.sensors
        // Readings arrive in 0..1, centered here to -0.5..0.5 so a sensor can
        // inhibit as well as excite, and so listening to more sensors raises
        // sensitivity without inflating the gene's baseline score.
        // A missing reading lands on exactly 0 — no influence either way.
        .map(id => (sensors[id] ?? 0.5) - 0.5)
        // Seeded with 0 — a gene listening to no sensors is legal, and an
        // unseeded reduce throws on an empty array.
        .reduce((prev, cur) => prev + cur, 0)
    );
  }

  /**
   * Approximates gaussian noise by summing two uniform samples.
   */
  noise(): number {
    return (Math.random() + Math.random() - 1) * this.noiseSigma;
  }

  /**
   * Sums the scores of every gene, grouped by the action it votes for.
   */
  scoreActions(cell: Cell): Map<string, number> {
    const scores = new Map<string, number>();

    const genome = getComponent(cell, "genome");
    if (!genome) return scores;

    const sensors = getComponent(cell, "sensors") ?? {};

    for (const gene of genome.genome) {
      if (!this.actions.has(gene.action)) continue;

      const score = this.computeActivation(gene, sensors) + this.noise();
      scores.set(gene.action, (scores.get(gene.action) ?? 0) + score);
    }

    return scores;
  }

  /**
   * Picks the action to perform, or nothing if no action clears the threshold.
   *
   * Argmax makes cells deterministic given their inputs; softmax keeps weaker
   * actions occasionally winning, which stops a population from collapsing
   * onto one behavior too early.
   */
  chooseAction(scores: Map<string, number>): string | undefined {
    const candidates = Array.from(scores).filter(
      ([, score]) => score >= this.threshold
    );
    if (candidates.length === 0) return undefined;

    if (this.selection === "argmax") {
      return candidates.reduce((best, current) =>
        current[1] > best[1] ? current : best
      )[0];
    }

    // Softmax. The max is subtracted before exponentiating to keep large
    // scores from overflowing; it cancels out in the ratio.
    const max = Math.max(...candidates.map(([, score]) => score));
    const weights = candidates.map(([, score]) =>
      Math.exp((score - max) * this.gain)
    );
    const total = weights.reduce((sum, weight) => sum + weight, 0);

    let roll = Math.random() * total;
    for (let i = 0; i < candidates.length; i++) {
      roll -= weights[i]!;
      if (roll <= 0) return candidates[i]![0];
    }

    return candidates[candidates.length - 1]![0];
  }

  onCellTick(world: World, cell: Cell): void {
    const genome = getComponent(cell, "genome");
    if (!genome) return;

    const scores = this.scoreActions(cell);
    const chosen = this.chooseAction(scores);

    genome.scores = Object.fromEntries(scores);
    genome.lastAction = chosen;

    if (chosen) {
      this.actions.get(chosen)!.perform(world, cell);
    }
  }
}
