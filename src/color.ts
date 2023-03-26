import { randomRange } from '~/src/rand'

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
      randomRange(0, 255),
      randomRange(0, 255),
      randomRange(0, 255)
    )
  }
}
