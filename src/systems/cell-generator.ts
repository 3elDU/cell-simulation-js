import type { ConfigSchema, UIAction, UIActionable } from "@/ui";
import type { System } from ".";
import { BaseSystem } from "./base";
import type { World } from "@/world";
import { addCell } from "@/cell";

export class CellGenerator extends BaseSystem implements System, UIActionable {
  id = "cell-generator";

  title = "Cell Generator";
  description = `Fills the map with randomly-generated
cells

Generates cells and automatically
disables itself.`;

  generationChance = 0.25;

  config: ConfigSchema = [
    {
      prop: "generationChance",
      min: 0,
      max: 1,
      step: 0.01,
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
        const hasCell = Math.random() < this.generationChance;

        if (!hasCell) continue;

        addCell(this.world, x, y);
      }
    }
  }
}
