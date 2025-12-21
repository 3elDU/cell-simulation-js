import "./styles/index.css";
import { Pane } from "tweakpane";
import { doTick, newWorld } from "./world";
import { ConstantMoveSystem } from "./systems/constant-move";
import type { Cell } from "./cell";
import { gridSet } from "./grid";
import { MovementSystem } from "./systems/movement";
import type { System } from "./system";

const world = newWorld(32, 32);
const cell: Cell = {
  components: {},
  id: 42,
  position: { x: 0, y: 24 },
};
world.cells.set(cell.id, cell);
gridSet(world.grid, cell.position, cell.id);

world.systems.push(new ConstantMoveSystem());
world.systems.push(new MovementSystem());

const container = document.getElementById("panes-container") as HTMLElement;

const pane = new Pane({
  title: "World",
  container,
});

pane.addBinding(world, "tick", { readonly: true, format: (v) => v.toString() });

const fCell = pane.addFolder({ title: "Cell" });
fCell.addBinding(cell.position, "x");
fCell.addBinding(cell.position, "y");

const systemsPane = new Pane({ title: "Systems", container });

for (const system of world.systems) {
  const folder = systemsPane.addFolder({ title: system.title });
  folder.addBinding(system, "enabled");

  for (const item of system.config ?? []) {
    folder.addBinding(system, item.prop as keyof System, item);
  }
}

document.getElementById("tick-btn")?.addEventListener("click", () => {
  doTick(world);
  pane.refresh();
  fCell.refresh();
  systemsPane.refresh();

  console.log(world);
});
