import type { UIDescription } from "@/ui";
import type { World } from "@/world";

export interface Renderer extends UIDescription {
  id: string;
  enabled: boolean;

  render(ctx: CanvasRenderingContext2D, world: World): void;
}
