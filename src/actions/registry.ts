import { Registry } from "@/registry";
import type { Action } from ".";
import { MoveAction } from "./move";
import { IdleAction } from "./idle";
import { DieAction } from "./die";
import { HarvestAction } from "./harvest";
import { ReproduceAction } from "./reproduce";
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

const harvest = (
  id: string,
  title: string,
  description: string,
  layer: string,
  rate: number,
  cost: number,
) =>
  actionRegistry.register({
    id,
    title,
    description,
    create: () => new HarvestAction(id, layer, rate, cost),
  });

harvest(
  "photosynthesize",
  "Photosynthesize",
  "Draw energy from the light layer",
  "light",
  2,
  0.1,
);

harvest(
  "chemosynthesize",
  "Chemosynthesize",
  "Draw energy from the minerals layer",
  "minerals",
  2,
  0.1,
);

actionRegistry.register({
  id: "reproduce",
  title: "Reproduce",
  description: "Split into a free neighbouring tile",
  create: () => new ReproduceAction(),
});

actionRegistry.register({
  id: "die",
  title: "Die",
  description: "Give up and leave a corpse",
  create: () => new DieAction(),
});
