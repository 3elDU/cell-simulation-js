import { randomRange, randomRangeInclusive } from "@/simulation/rand";
import clamp from "./clamp";

export class RGB {
  r: number;
  g: number;
  b: number;

  constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  static random() {
    return new RGB(
      randomRange(0, 255),
      randomRange(0, 255),
      randomRange(0, 255)
    );
  }

  toCSS(): string {
    return `rgb(${this.r}, ${this.g}, ${this.b})`;
  }

  mutate() {
    const colorToChange = randomRangeInclusive(0, 2);

    switch (colorToChange) {
      case 0:
        this.r += randomRangeInclusive(-16, 16);
      case 1:
        this.g += randomRangeInclusive(-16, 16);
      case 2:
        this.b += randomRangeInclusive(-16, 16);
    }

    this.r = clamp(this.r, 0, 255);
    this.g = clamp(this.g, 0, 255);
    this.b = clamp(this.b, 0, 255);
  }
}
