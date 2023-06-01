export function randomRangeF (min: number, max: number): number {
  return Math.random() * (max - min) + min
}

// same as above, but returns integers
export function randomRange (min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min
}
