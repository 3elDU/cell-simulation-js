import Bot from '~/src/bot'

export class CellSimulation {
  width: number
  height: number
  field: Bot[][]

  generateMap () {
    for (let y = 0; y < this.height; y++) {
      this.field[y] = new Array(this.width)
      for (let x = 0; x < this.width; x++) {
        if (Math.random() < 0.2) {
          this.field[y][x] = new Bot()
        } else {
          this.field[y][x] = Bot.createEmpty()
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

  update () {

  }
}
