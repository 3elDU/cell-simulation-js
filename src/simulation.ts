import Bot from '~/src/bot'
import { Config } from '~/src/config'

export class CellSimulation {
  width: number
  height: number
  bots: Array<Bot>
  config: Config

  generateMap () {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (Math.random() < 0.2) {
          this.bots[y * this.width + x] = Bot.generateRandom(x, y, this.config)
        } else {
          this.bots[y * this.width + x] = Bot.createEmpty(x, y)
        }
      }
    }
  }

  // assumes the map is already generated
  clearMap () {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.bots[y * this.width + x] = Bot.createEmpty(x, y)
      }
    }
  }

  constructor (width: number, height: number, config: Config) {
    if (width < 0 || height < 0) {
      throw new Error('invalid width and/or height')
    }

    this.width = width
    this.height = height
    this.config = config

    this.bots = new Array<Bot>(this.width * this.height)
    this.generateMap()
  }

  update () {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.bots[y * this.width + x].update(this, this.config)
      }
    }
  }
}
