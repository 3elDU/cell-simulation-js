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
