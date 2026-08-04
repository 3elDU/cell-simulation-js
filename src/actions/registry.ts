import { Registry } from "@/registry";
import type { Action } from ".";
import { MoveAction } from "./move";
import { IdleAction } from "./idle";
import { DieAction } from "./die";
import type { MovementDirection } from "@/components/movement";

export const actionRegistry = new Registry<Action>();

const move = (dir: MovementDirection, title: string) =>
  actionRegistry.register({
    id: `move-${dir}`,
    title,
    description: `Intent to move ${dir}`,
    create: () => new MoveAction(dir),
  });

move("up", "Move Up");
move("down", "Move Down");
move("left", "Move Left");
move("right", "Move Right");

actionRegistry.register({
  id: "idle",
  title: "Idle",
  description: "Spend the tick doing nothing",
  create: () => new IdleAction(),
});

actionRegistry.register({
  id: "die",
  title: "Die",
  description: "Give up and leave a corpse",
  create: () => new DieAction(),
});
