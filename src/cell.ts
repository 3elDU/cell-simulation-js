import type { Position } from "./grid";

export interface Cell {
  id: number;
  position: Position;

  /**
   * Components contain tagged state
   */
  components: Record<string, object>;
}
