export function randomRangeF(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

// same as above, but returns integers
export function randomRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min
}

export function randomRangeInclusive(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
