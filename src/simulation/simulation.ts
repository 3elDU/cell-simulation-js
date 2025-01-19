import Bot from "@/simulation/bot";

export class CellSimulation {
  width: number;
  height: number;
  bots: Array<Bot>;

  // Keep reference to the selected cell
  selectedCell: Bot | null;

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
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (Math.random() < 0.2) {
          this.bots[y * this.width + x] = Bot.generateRandom(x, y);
        } else {
          this.bots[y * this.width + x] = Bot.createEmpty(x, y);
        }
      }
    }
  }

  // assumes the map is already generated
  clearMap() {
    this.iterations = 0;
    this.prevIterations = 0;
    this.fps = 0;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.bots[y * this.width + x] = Bot.createEmpty(x, y);
      }
    }
  }

  getCellAt(x: number, y: number): Bot {
    return this.bots[y * this.width + x];
  }
  setCellAt(x: number, y: number, cell: Bot) {
    cell.x = x;
    cell.y = y;
    this.bots[y * this.width + x] = cell;
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
    this.width = width;
    this.height = height;

    this.selectedCell = null;

    this.bots = new Array<Bot>(this.width * this.height);
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
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const bot = this.getCellAt(x, y);
        bot.update(this);
      }
    }

    this.iterations++;
  }
}
