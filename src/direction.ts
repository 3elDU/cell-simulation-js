import { randomRangeInclusive } from "./rand";

export enum Direction {
  Left,
  Up,
  Right,
  Down,
}

export function randomDirection(): Direction {
  return randomRangeInclusive(0, Direction.Down)
}

// Returns the direction left from given one
export function rotateLeft(dir: Direction): Direction {
  switch (dir) {
    case Direction.Left: return Direction.Down;
    case Direction.Up: return Direction.Left;
    case Direction.Right: return Direction.Up;
    case Direction.Down: return Direction.Right;
  }
}

// Returns the direction right from given one
export function rotateRight(dir: Direction): Direction {
  switch (dir) {
    case Direction.Left: return Direction.Up;
    case Direction.Up: return Direction.Right;
    case Direction.Right: return Direction.Down;
    case Direction.Down: return Direction.Left;
  }
}

// 'Move' the given coordinates towards the direction by one
export function applyDirection(x: number, y: number, dir: Direction): { x: number, y: number } {
  switch (dir) {
    case Direction.Left: return { x: x - 1, y: y };
    case Direction.Right: return { x: x + 1, y: y };
    case Direction.Up: return { x: x, y: y + 1 };
    case Direction.Down: return { x: x, y: y - 1 };
  }
}
