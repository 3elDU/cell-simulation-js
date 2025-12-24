/**
 * Utilities for working with ImageData objects
 */

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export function drawColor(
  img: ImageData,
  x: number,
  y: number,
  color: RgbColor | RgbaColor
) {
  img.data[y * img.width + x + 0] = color.r;
  img.data[y * img.width + x + 1] = color.g;
  img.data[y * img.width + x + 2] = color.b;
  img.data[y * img.width + x + 3] = "a" in color ? color.a : 255;
}
