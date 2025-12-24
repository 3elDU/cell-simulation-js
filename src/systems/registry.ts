import { Registry, type Definition } from "@/registry";
import { type System } from "@/systems";
import { MovementSystem } from "./movement";
import { LightSystem } from "./light";
import { ConstantMoveSystem } from "./constant-move";

export const systemRegistry = new Registry<System>();

// Converts System into a Definition
const d = (constructor: new () => System): Definition<System> => {
  const system = new constructor();

  return {
    title: system.title,
    description: system.description,
    id: system.id,
    create: () => new constructor(),
  };
};

systemRegistry.register(d(MovementSystem));
systemRegistry.register(d(LightSystem));
systemRegistry.register(d(ConstantMoveSystem));
