import type { ConfigSchema, UIAction, UIActionable } from "@/ui";
import type { System } from ".";
import { BaseSystem } from "./base";
import type { World } from "@/world";
import { addCell } from "@/cell";
import { setComponent } from "@/components";
import { randomCommand } from "@/components/genome";
import { random } from "@/random";

export class CellGenerator extends BaseSystem implements System, UIActionable {
  id = "cell-generator";

  title = "Cell Generator";
  description = `Fills the map with randomly-generated
cells

Generates cells and automatically
disables itself.`;

  generationChance = 0.25;
  genomeLength = 24;

  config: ConfigSchema = [
    {
      prop: "generationChance",
      min: 0,
      max: 1,
      step: 0.01,
    },
    {
      prop: "genomeLength",
      min: 1,
      step: 1,
    },
  ];

  actions: UIAction[] = [
    {
      title: "Generate",
      callback: this.generate.bind(this),
    },
  ];

  world: World | undefined;

  onInit(world: World): void {
    this.world = world;
  }

  generate() {
    if (!this.world) return;

    for (let x = 0; x < this.world.width; x++) {
      for (let y = 0; y < this.world.height; y++) {
        const hasCell = random() < this.generationChance;

        if (!hasCell) continue;

        const cell = addCell(this.world, x, y);

        setComponent(cell, "genome", {
          ip: 0,
          // This is very much a PoC at this point
          // Sensor weights should be generated with normal distribution
          genome: Array.from({ length: this.genomeLength }, () => ({
            base: random() * 0.6 - 0.3,
            command: randomCommand(),
            skip: Math.floor(random() * 4),
            sensors: {
              a: random() * 2 - 1,
              b: random() * 2 - 1,
              c: random() * 2 - 1,
              d: random() * 2 - 1,
            },
          })),
        });
      }
    }
  }
}
