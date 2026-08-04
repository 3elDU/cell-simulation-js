import type { Cell } from "@/cell";
import type { World } from "@/world";
import type { System } from ".";
import { BaseSystem } from "./base";
import { getComponent, setComponent } from "@/components";
import type { ConfigSchema } from "@/ui";
import type { Gene } from "@/components/genome";
import type { Sensors } from "@/components/sensors";
import { random } from "@/random";

export class GenomeSystem extends BaseSystem implements System {
  id = "genome";
  title = "Genome";
  description = `Computes activation for genes and
advances the instruction pointer`;

  after = ["sensors"];

  gain = 1.5;
  noiseSigma = 0.1;

  config: ConfigSchema = [
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
  ];

  sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  instructionShouldExecute(gene: Gene, sensors?: Sensors): boolean {
    let activation: number;
    if (sensors) {
      activation =
        gene.base +
        sensors.a * gene.sensors.a +
        sensors.b * gene.sensors.b +
        sensors.c * gene.sensors.c +
        sensors.d * gene.sensors.d;
    } else {
      // If sensors don't exist, continue activation directly from base
      activation = gene.base;
    }

    // Add gaussian noise
    activation += (random() + random() - 1) * this.noiseSigma;

    const prob = this.sigmoid(activation * this.gain);
    return random() < prob;
  }

  onCellTick(world: World, cell: Cell): void {
    const component = getComponent(cell, "genome");
    if (!component) return;

    const sensors = getComponent(cell, "sensors");

    // Current instruction
    const inst = component.genome[component.ip]!;

    const execute = this.instructionShouldExecute(inst, sensors);

    if (execute && inst.command == "move") {
      // Instructions should be handled by separate systems

      setComponent(cell, "movement", { dir: "down" });
    }
    component.ip += execute ? inst.skip : 1;

    // Instruction pointer wraps around
    if (component.ip >= component.genome.length) {
      component.ip -= component.genome.length;
    }
  }
}
