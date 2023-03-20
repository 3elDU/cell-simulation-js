export class RGB {
  r: number
  g: number
  b: number

  constructor (r: number, g: number, b: number) {
    this.r = r
    this.g = g
    this.b = b
  }

  static random () {
    return new RGB(
      Math.random() * 255,
      Math.random() * 255,
      Math.random() * 255
    )
  }
}

export class Bot {
  color: RGB

  constructor (color: undefined | RGB) {
    this.color = color ?? RGB.random()
  }
}

export class CellSimulation {
  width: number
  height: number
  field: Bot[][]

  generateMap () {
    for (let y = 0; y < this.height; y++) {
      this.field[y] = new Array(this.width)
      for (let x = 0; x < this.width; x++) {
        if (Math.random() < 0.2) {
          this.field[y][x] = new Bot(undefined)
        } else {
          this.field[y][x] = new Bot(new RGB(0, 0, 0))
        }
      }
    }
  }

  constructor (width: number, height: number) {
    if (width < 0 || height < 0) {
      throw new Error('invalid width and/or height')
    }

    this.width = width
    this.height = height

    this.field = new Array(this.height)
    this.generateMap()
  }

  update () {}
}
