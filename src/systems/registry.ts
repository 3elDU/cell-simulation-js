import { Registry, type Definition } from "@/registry";
import { type System } from "@/systems";
import { MovementSystem } from "./movement";
import { LightSystem } from "./light";
import { ConstantMoveSystem } from "./constant-move";
import { CellGenerator } from "./cell-generator";
import { SensorsSystem } from "./sensors";
import { TemperatureSystem } from "./temperature";
import { GenomeSystem } from "./genome";
import { MineralsSystem } from "./minerals";
import { OrganicsSystem } from "./organics";
import { EnergySystem } from "./energy";
import { DeathSystem } from "./death";

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
systemRegistry.register(d(CellGenerator));
systemRegistry.register(d(SensorsSystem));
systemRegistry.register(d(TemperatureSystem));
systemRegistry.register(d(GenomeSystem));
systemRegistry.register(d(MineralsSystem));
systemRegistry.register(d(OrganicsSystem));
systemRegistry.register(d(EnergySystem));
systemRegistry.register(d(DeathSystem));
