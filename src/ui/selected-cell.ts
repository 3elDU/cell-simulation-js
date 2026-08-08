import { getCell, type Cell } from "@/cell";
import type { World } from "@/world";
import { Pane } from "tweakpane";

export class SelectedCellController extends Pane {
  world: World;
  canvas: HTMLCanvasElement;
  selectedCell: Cell | undefined;

  stringified = "";
  x = 0;
  y = 0;

  constructor(container: HTMLElement, canvas: HTMLCanvasElement, world: World) {
    super({
      container,
      title: "Selected Cell",
      expanded: false,
    });

    this.disabled = true;

    this.addBinding(this, "x", {
      readonly: true,
    });
    this.addBinding(this, "y", {
      readonly: true,
    });

    this.addBinding(this, "stringified", {
      label: undefined,
      readonly: true,
      multiline: true,
      rows: 10,
    });

    this.canvas = canvas;
    this.world = world;

    canvas.addEventListener("click", this.handleClick.bind(this));
  }

  handleClick(event: MouseEvent) {
    // Compute pixel coordinates for the click
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = Math.trunc((event.clientX - rect.left) * scaleX);
    const y = Math.trunc((event.clientY - rect.top) * scaleY);

    const cell = getCell(this.world, x, y);
    if (!cell) {
      this.disabled = true;
      return;
    }

    this.selectedCell = cell;
    this.disabled = false;
    this.refresh();
  }

  selectCell(cell: Cell) {
    this.selectedCell = cell;
  }

  refresh() {
    if (this.selectedCell) {
      this.x = this.selectedCell.position.x;
      this.y = this.selectedCell.position.y;
      this.stringified = JSON.stringify(this.selectedCell, null, 2);
    }

    super.refresh();
  }
}
