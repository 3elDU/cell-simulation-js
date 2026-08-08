import { addCell, type Cell } from "@/cell";
import { emitBirth, statFactor, type World } from "@/world";
import type { Stat } from "./stats";
import type { System } from ".";
import { BaseSystem } from "./base";
import { getComponent, setComponent } from "@/components";
import type { ConfigSchema } from "@/ui";
import { gridGetAdjacent, type Position } from "@/grid";
import { copySensors, type Gene } from "@/components/genome";
import type { Sensors } from "@/components/sensors";
import { actionRegistry } from "@/actions/registry";
import { sensorsRegistry } from "@/sensors/registry";

/**
 * Splits cells that asked to, and mutates the copy of the genome the child
 * gets.
 *
 * Mutation operators are small, local edits over the genome's flat list of
 * votes (see CLAUDE.md) — nudge a weight, add/remove a gene or sensor,
 * retarget an action.
 */
export class ReproductionSystem extends BaseSystem implements System {
  id = "reproduction";
  title = "Reproduction";
  description = `Splits cells into a free
neighboring tile and mutates
the child's genome.`;
  enabled = true;

  // Reads the energy left after this tick's feeding and upkeep, so a cell
  // can't split on energy it is about to lose.
  after = ["energy"];

  /**
   * A cell below this much energy can't split at all, however much it wants
   * to. Keeps a starving population from reproducing itself to death.
   */
  minEnergy = 60;

  /**
   * Charged on a successful birth only, before the split.
   */
  reproduceCost = 5;

  /**
   * Share of the remaining energy handed to the child. At 0.5 the split is
   * even, which also makes reproduction the clean way to shed a dangerous
   * surplus.
   */
  childShare = 0.5;

  /**
   * Genome length bounds, so duplication can't run away and deletion can't
   * empty a genome into something that can never act.
   */
  maxGenes = 40;
  minGenes = 1;

  /**
   * Scales every rate below. Lets overall mutation be dialed up or down
   * mid-run without losing the balance between operators.
   */
  mutationRate = 0.5;

  /** Per gene: shift the base weight. */
  nudgeWeight = 0.2;
  nudgeAmount = 0.15;

  /** Per sensor: shift how much reaching its target is worth. */
  nudgeSensorWeight = 0.15;

  /** Per sensor: shift which reading it favors. */
  nudgeSensorTarget = 0.15;

  /**
   * Ceiling on the magnitude of every weight in a genome.
   *
   * Weights are what a score is built out of, and the score is exponentiated
   * when an action is picked. Left to drift freely they grow, and a lineage
   * ends up deciding the same way every tick regardless of where the
   * selection knobs are set.
   */
  maxWeight = 1;

  /** Per genome: copy a random gene so the copy can drift separately. */
  duplicateGene = 0.02;

  /** Per genome: append a gene voting for a random registered action. */
  addGene = 0.02;

  /** Per genome: drop a random gene. */
  deleteGene = 0.02;

  /** Per gene: point it at a different action, keeping its weight. */
  retargetAction = 0.01;

  /** Per gene: start listening to another sensor. */
  addSensor = 0.05;

  /** Per gene: stop listening to one. */
  removeSensor = 0.05;

  stats: Stat[] = [
    { id: "reproduction.cost", title: "Birth cost" },
    { id: "reproduction.threshold", title: "Birth threshold" },
  ];

  config: ConfigSchema = [
    { prop: "minEnergy", label: "Min energy", min: 0, step: 1 },
    { prop: "reproduceCost", label: "Birth cost", min: 0, step: 0.5 },
    { prop: "childShare", label: "Child share", min: 0, max: 1, step: 0.01 },
    { prop: "maxGenes", label: "Max genes", min: 1, step: 1 },
    { prop: "minGenes", label: "Min genes", min: 1, step: 1 },
    { prop: "mutationRate", label: "Mutation ×", min: 0, max: 4, step: 0.01 },
    { prop: "nudgeWeight", label: "Nudge weight", min: 0, max: 1, step: 0.01 },
    { prop: "nudgeAmount", label: "Nudge amount", min: 0, max: 1, step: 0.01 },
    {
      prop: "nudgeSensorWeight",
      label: "Nudge sensor weight",
      min: 0,
      max: 1,
      step: 0.01,
    },
    {
      prop: "nudgeSensorTarget",
      label: "Nudge sensor target",
      min: 0,
      max: 1,
      step: 0.01,
    },
    { prop: "maxWeight", label: "Max weight", min: 0, max: 4, step: 0.05 },
    {
      prop: "duplicateGene",
      label: "Duplicate gene",
      min: 0,
      max: 1,
      step: 0.005,
    },
    { prop: "addGene", label: "Add gene", min: 0, max: 1, step: 0.005 },
    { prop: "deleteGene", label: "Delete gene", min: 0, max: 1, step: 0.005 },
    {
      prop: "retargetAction",
      label: "Retarget action",
      min: 0,
      max: 1,
      step: 0.005,
    },
    { prop: "addSensor", label: "Add sensor", min: 0, max: 1, step: 0.005 },
    {
      prop: "removeSensor",
      label: "Remove sensor",
      min: 0,
      max: 1,
      step: 0.005,
    },
  ];

  /**
   * True with probability `rate * mutationRate`, clamped — so the multiplier
   * can be pushed past 1 without a rate silently exceeding certainty.
   */
  private rolls(rate: number): boolean {
    return Math.random() < Math.min(rate * this.mutationRate, 1);
  }

  private pick<T>(items: T[]): T | undefined {
    return items[Math.floor(Math.random() * items.length)];
  }

  /** A signed step of at most `nudgeAmount`. */
  private jitter(): number {
    return (Math.random() * 2 - 1) * this.nudgeAmount;
  }

  private clamp(weight: number): number {
    return Math.min(Math.max(weight, -this.maxWeight), this.maxWeight);
  }

  /**
   * Ids of everything currently registered. Read fresh each birth so a system
   * being toggled mid-run changes what mutation can reach, rather than
   * handing out ids for actions that no longer exist.
   */
  private actionIds(): string[] {
    return Array.from(actionRegistry.list(), def => def.id);
  }

  private sensorIds(): (keyof Sensors)[] {
    return Array.from(sensorsRegistry.list(), def => def.id as keyof Sensors);
  }

  /**
   * Returns a mutated deep copy, and whether any operator actually fired —
   * most births change nothing. The parent's genome is never touched.
   */
  mutate(genome: Gene[]): { genes: Gene[]; mutated: boolean } {
    const actions = this.actionIds();
    const sensors = this.sensorIds();

    let mutated = false;

    const genes = genome.map(gene => {
      const copy: Gene = { ...gene, sensors: copySensors(gene.sensors) };

      if (this.rolls(this.nudgeWeight)) {
        copy.base = this.clamp(copy.base + this.jitter());
        mutated = true;
      }

      if (actions.length > 0 && this.rolls(this.retargetAction)) {
        copy.action = this.pick(actions)!;
        mutated = true;
      }

      for (const id in copy.sensors) {
        const entry = copy.sensors[id as keyof Sensors]!;

        if (this.rolls(this.nudgeSensorWeight)) {
          entry.weight = this.clamp(entry.weight + this.jitter());
          mutated = true;
        }

        if (this.rolls(this.nudgeSensorTarget)) {
          // Targets live on the 0..1 scale readings arrive in; outside it a
          // gene would be chasing a value no sensor can ever report.
          entry.target = Math.min(Math.max(entry.target + this.jitter(), 0), 1);
          mutated = true;
        }
      }

      if (this.rolls(this.addSensor)) {
        const added = this.pick(sensors.filter(id => !(id in copy.sensors)));
        if (added) {
          // Inert on arrival: at zero weight the target is not yet worth
          // anything, so the new listener costs nothing until drift gives it
          // a weight, and selection judges it only once it does something.
          // That also makes the starting target free to be anything.
          copy.sensors[added] = { weight: 0, target: Math.random() };
          mutated = true;
        }
      }

      const listened = Object.keys(copy.sensors) as (keyof Sensors)[];
      if (listened.length > 0 && this.rolls(this.removeSensor)) {
        delete copy.sensors[this.pick(listened)!];
        mutated = true;
      }

      return copy;
    });

    if (genes.length > this.minGenes && this.rolls(this.deleteGene)) {
      genes.splice(Math.floor(Math.random() * genes.length), 1);
      mutated = true;
    }

    if (genes.length < this.maxGenes && this.rolls(this.duplicateGene)) {
      const source = this.pick(genes);
      if (source) {
        genes.push({ ...source, sensors: copySensors(source.sensors) });
        mutated = true;
      }
    }

    if (
      actions.length > 0 &&
      genes.length < this.maxGenes &&
      this.rolls(this.addGene)
    ) {
      genes.push({
        action: this.pick(actions)!,
        // Near zero, so a brand-new gene barely shifts behavior and gets a
        // chance to drift before selection judges it.
        base: (Math.random() * 2 - 1) * 0.05,
        // Its sensors arrive weak for the same reason, but not silent: a gene
        // that says nothing at all gives selection nothing to judge, and
        // would need several more births before it ever mattered.
        sensors: Object.fromEntries(
          sensors
            .filter(() => Math.random() < 0.25)
            .map(id => [
              id,
              { weight: (Math.random() * 2 - 1) * 0.25, target: Math.random() },
            ])
        ),
      });
      mutated = true;
    }

    return { genes, mutated };
  }

  /**
   * An empty neighboring tile, chosen at random, or nothing if boxed in.
   */
  freeNeighbor(world: World, position: Position): Position | undefined {
    const free = gridGetAdjacent(world.grid, position).filter(
      ({ value }) => value === -1
    );

    return this.pick(free);
  }

  onCellTick(world: World, cell: Cell): void {
    const reproduction = getComponent(cell, "reproduction");
    if (!reproduction?.intent) return;

    // Intent lasts one tick, whether or not the birth happens — otherwise a
    // boxed-in cell would split the instant a neighbor died, ticks later.
    reproduction.intent = false;

    // Marked for death earlier this tick. Letting it split would be a free
    // extra child every time a cell starves.
    if (getComponent(cell, "death")) return;

    const threshold =
      this.minEnergy * statFactor(world, cell, "reproduction.threshold");

    const energy = getComponent(cell, "energy");
    if (!energy || energy.energy < threshold) return;

    const target = this.freeNeighbor(world, cell.position);
    if (!target) return;

    const cost =
      this.reproduceCost * statFactor(world, cell, "reproduction.cost");

    const remaining = energy.energy - cost;
    if (remaining <= 0) return;

    const child = addCell(world, target.x, target.y);

    energy.energy = remaining * (1 - this.childShare);
    setComponent(child, "energy", { energy: remaining * this.childShare });

    const genome = getComponent(cell, "genome");
    if (genome) {
      const { genes, mutated } = this.mutate(genome.genome);
      setComponent(child, "genome", { genome: genes, mutated });
    }

    setComponent(child, "reproduction", {
      generation: reproduction.generation + 1,
      children: 0,
      parent: cell.id,
    });

    emitBirth(world, cell, child);

    reproduction.children++;

    // Newborns sit out the rest of the tick they were born in. doTick walks
    // the grid, so a child placed on a tile the walk hasn't reached yet would
    // otherwise act, feed and possibly split again on its own birth tick.
    child.components.internal = { processed: true };
  }
}
