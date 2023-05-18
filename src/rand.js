export function randomRangeF (min, max) {
  return Math.random() * (max - min) + min
}

// same as `randomRangeF`, but returns integers
export function randomRange (min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}
