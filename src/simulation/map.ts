import Bot from "./bot";

/**
 * Two-dimensional map, describing a simulation field. Can resize in both directions.
 * Internally represented by nesting arrays.
 */
export default class Map2D {
  private _width: number;
  private _height: number;

  private map: Array<Array<Bot>>;

  get width() {
    return this._width;
  }
  get height() {
    return this._height;
  }
  set width(newWidth: number) {
    this.resizeTo(newWidth, this._height);
  }
  set height(newHeight: number) {
    this.resizeTo(this._width, newHeight);
  }

  private _assembleLine(x: number, height: number): Array<Bot> {
    const line = new Array(height);
    for (let y = 0; y < height; y++) {
      line[y] = Bot.createEmpty(x, y);
    }
    return line;
  }

  constructor(width: number, height: number) {
    this._width = width;
    this._height = height;

    this.map = new Array(width);
    for (let x = 0; x < width; x++) {
      this.map[x] = this._assembleLine(x, height);
    }
  }

  resizeTo(newWidth: number, newHeight: number) {
    // Handle vertical resize
    for (const [x, line] of this.map.entries()) {
      line.length = newHeight;

      // Fill with elements up to new height
      if (newHeight > this._height) {
        for (let y = this._height; y < newHeight; y++) {
          line[y] = Bot.createEmpty(x, y);
        }
      }
    }

    // Handle horizontal resize
    this.map.length = newWidth;
    if (newWidth > this._width) {
      // Fill with new lines up to new width
      for (let x = this.width; x < newWidth; x++) {
        this.map[x] = this._assembleLine(x, newHeight);
      }
    }

    this._width = newWidth;
    this._height = newHeight;
  }

  get(x: number, y: number): Bot {
    return this.map[x][y];
  }
  set(x: number, y: number, bot: Bot) {
    bot.x = x;
    bot.y = y;
    this.map[x][y] = bot;
  }
}
