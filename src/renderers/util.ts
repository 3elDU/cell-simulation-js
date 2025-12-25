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

/**
 * A utility function to quickly draw an ImageData that matches
 * canvas' width and height.
 *
 * Calls the provided function to determine color of every pixel.
 * The function can return undefined, in which case the pixel will
 * be transparent.
 *
 * The resulting image gets drawn onto the canvas automatically.
 */
export async function drawImage(
  ctx: CanvasRenderingContext2D,
  callback: (x: number, y: number) => RgbColor | RgbaColor | undefined
) {
  const img = ctx.createImageData(ctx.canvas.width, ctx.canvas.height);

  for (let x = 0; x < ctx.canvas.width; x++) {
    for (let y = 0; y < ctx.canvas.height; y++) {
      const color = callback(x, y);

      if (!color) continue;

      drawColor(img, x, y, color);
    }
  }

  // Convert ImageData into ImageBitmap to support transparency when merging
  // outputs from multiple renderers into one canvas
  const bitmap = await window.createImageBitmap(img);

  ctx.drawImage(bitmap, 0, 0);
}
