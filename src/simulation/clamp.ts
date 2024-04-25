export default function clamp (val: number, min: number, max: number): number {
  if (val < min) {
    return min
  } else if (val > max) {
    return max
  } else {
    return val
  }
}
