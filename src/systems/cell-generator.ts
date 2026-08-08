import type { ConfigSchema, UIAction, UIActionable } from "@/ui";
import type { System } from ".";
import { BaseSystem } from "./base";
import type { World } from "@/world";
import { addCell } from "@/cell";
import { setComponent } from "@/components";
import { taint } from "@/components/taint";
import { actionRegistry } from "@/actions/registry";
import { sensorsRegistry } from "@/sensors/registry";
import type { Sensors } from "@/components/sensors";
import { gridEvery, gridSet } from "@/grid";

export class CellGenerator extends BaseSystem implements System, UIActionable {
  id = "cell-generator";

  title = "Cell Generator";
  description = `Fills the map with randomly-generated
cells`;
  enabled = true;

  generationChance = 0.25;
  genomeMinLength = 2;
  genomeMaxLength = 10;
  sensorChance = 0.5;

  config: ConfigSchema = [
    {
      prop: "generationChance",
      min: 0,
      max: 1,
      step: 0.01,
    },
    {
      prop: "genomeMinLength",
      min: 1,
      step: 1,
    },
    {
      prop: "genomeMaxLength",
      min: 1,
      step: 1,
    },
    {
      prop: "sensorChance",
      label: "Sensor Chance",
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
    {
      title: "Kill all cells",
      callback: this.killAll.bind(this),
    },
  ];

  world: World | undefined;

  onInit(world: World): void {
    this.world = world;
    this.generate();
    this.enabled = false;
  }

  generate() {
    if (!this.world) return;

    // Genomes are drawn from whatever is registered right now, so a new
    // action or sensor becomes evolvable without touching this system.
    const actionIds = Array.from(actionRegistry.list(), def => def.id);
    const sensorIds = Array.from(
      sensorsRegistry.list(),
      def => def.id as keyof Sensors
    );
    if (actionIds.length === 0) return;

    for (let x = 0; x < this.world.width; x++) {
      for (let y = 0; y < this.world.height; y++) {
        const hasCell = Math.random() < this.generationChance;

        if (!hasCell) continue;

        const cell = addCell(this.world, x, y);

        const genomeLength = Math.floor(
          Math.random() * (this.genomeMaxLength - this.genomeMinLength + 1) +
            this.genomeMinLength
        );

        taint(cell);

        setComponent(cell, "genome", {
          genome: Array.from({ length: genomeLength }, () => ({
            // Base weights start near zero so no gene is born decisive —
            // a gene that fires hard from tick one gets selected away before
            // it ever has a chance to drift into something useful.
            base: Math.random() * 0.6 - 0.3,
            action: actionIds[Math.floor(Math.random() * actionIds.length)]!,
            sensors: sensorIds.filter(() => Math.random() < this.sensorChance),
          })),
        });
      }
    }
  }

  killAll() {
    if (
      this.world === undefined ||
      !window.confirm("This will erase all cells. Are you sure?")
    )
      return;

    gridEvery(this.world.grid, (x, y, value) => {
      gridSet(this.world!.grid, { x, y }, -1);
      this.world!.cells.delete(value);
    });
  }
}
