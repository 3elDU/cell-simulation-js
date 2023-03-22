import { RGB } from '~/src/color'

export default class Bot {
  color: RGB

  constructor (color?: RGB) {
    this.color = color ?? RGB.random()
  }

  static createEmpty (): Bot {
    const bot = new Bot()
    bot.color = new RGB(0, 0, 0)
    return bot
  }
}
