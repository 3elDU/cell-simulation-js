import { randomRange } from './rand.js'

export default class RGB {
  constructor (r, g, b) {
    this.r = r
    this.g = g
    this.b = b
  }

  static random () {
    return new RGB(
      randomRange(0, 255),
      randomRange(0, 255),
      randomRange(0, 255)
    )
  }
}
