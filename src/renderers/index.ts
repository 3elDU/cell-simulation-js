import type { ConfigSchema, UIDescription } from "@/ui";
import type { World } from "@/world";

export interface Renderer extends UIDescription {
  id: string;
  enabled: boolean;

  config?: ConfigSchema;

  render(ctx: CanvasRenderingContext2D, world: World): void | Promise<void>;
}
