import Bot from '~/src/bot'

export class CellSimulation {
  width: number
  height: number
  bots: Array<Bot>

  generateMap () {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (Math.random() < 0.2) {
          this.bots[y * this.width + x] = new Bot()
        } else {
          this.bots[y * this.width + x] = Bot.createEmpty()
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

    this.bots = new Array<Bot>(this.width * this.height)
    this.generateMap()
  }

  update () {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.bots[y * this.width + x].update(this)
      }
    }
  }
}
