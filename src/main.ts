import "./styles/index.css";
import { Pane } from "tweakpane";
import { doTick, newWorld } from "./world";
import type { Cell } from "./cell";
import { gridSet } from "./grid";
import { systemRegistry } from "./systems/registry";
import { SystemsPane } from "./panes/systems";

const world = newWorld(32, 32);
console.debug("world object:", world);
const cell: Cell = {
  components: {},
  id: 42,
  position: { x: 0, y: 24 },
};
world.cells.set(cell.id, cell);
gridSet(world.grid, cell.position, cell.id);

const container = document.getElementById("panes-container") as HTMLElement;

const pane = new Pane({
  title: "World",
  container,
});

pane.addBinding(world, "tick", { readonly: true, format: (v) => v.toString() });

const fCell = pane.addFolder({ title: "Cell" });
fCell.addBinding(cell.position, "x");
fCell.addBinding(cell.position, "y");

// Add all systems to the world, initially disabled
for (const def of systemRegistry.list()) {
  const system = def.create();
  system.enabled = false;
  world.systems.push(system);
}

// Run onInit on all systems
for (const system of world.systems) {
  system.onInit?.(world);
}

const toggleSystemsPane = new SystemsPane(container, world);

document.getElementById("tick-btn")?.addEventListener("click", () => {
  doTick(world);
  pane.refresh();
  fCell.refresh();
  toggleSystemsPane.refresh();

  console.log(world);
});
