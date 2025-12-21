import Bot from "@/simulation/bot";
import Map2D from "./map";

export class CellSimulation {
  map: Map2D;

  // Keep reference to the selected cell
  selectedCell?: Bot;

  private pause: boolean;
  public get isPaused(): boolean {
    return this.pause;
  }

  iterations: number;
  prevIterations: number;
  fps: number;

  togglePause() {
    this.pause = !this.pause;
  }

  generateMap() {
    this.iterations = 0;
    this.prevIterations = 0;
    this.fps = 0;
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        if (Math.random() < 0.2) {
          this.map.set(x, y, Bot.generateRandom(x, y));
        } else {
          this.map.set(x, y, Bot.createEmpty(x, y));
        }
      }
    }
  }

  // assumes the map is already generated
  clearMap() {
    this.iterations = 0;
    this.prevIterations = 0;
    this.fps = 0;
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        this.map.set(x, y, Bot.createEmpty(x, y));
      }
    }
  }

  getCellAt(x: number, y: number): Bot {
    return this.map.get(x, y);
  }
  setCellAt(x: number, y: number, cell: Bot) {
    this.map.set(x, y, cell);
    // If setting cell at selected cell's coordinates, update reference to selected cell.
    if (
      this.selectedCell &&
      this.selectedCell.x == x &&
      this.selectedCell.y == y
    ) {
      this.selectCell(x, y);
    }
  }

  selectCell(x: number, y: number) {
    this.selectedCell = this.getCellAt(x, y);
  }

  constructor(width: number, height: number) {
    this.map = new Map2D(width, height);
    this.generateMap();

    this.pause = true;
    this.iterations = 0;
    this.prevIterations = 0;
    this.fps = 0;

    setInterval(() => {
      this.fps = this.iterations - this.prevIterations;
      this.prevIterations = this.iterations;
    }, 1000);
  }

  update() {
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        const bot = this.getCellAt(x, y);
        if (bot.alive) {
          bot.update(this);
        }
      }
    }

    this.iterations++;
  }
}
