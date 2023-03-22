import { RGB } from '~/src/color'
import { CellSimulation } from '~/src/simulation'

export default class Bot {
  color: RGB
  health: number

  constructor (color?: RGB) {
    this.color = color ?? RGB.random()
    this.health = 1
  }

  static createEmpty (): Bot {
    const bot = new Bot()
    bot.color = new RGB(0, 0, 0)
    return bot
  }

  update (_: CellSimulation) {
    this.health++
  }
}
