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
  const pixel = (y * img.width + x) * 4;
  img.data[pixel + 0] = color.r;
  img.data[pixel + 1] = color.g;
  img.data[pixel + 2] = color.b;
  img.data[pixel + 3] = "a" in color ? color.a : 255;
}
