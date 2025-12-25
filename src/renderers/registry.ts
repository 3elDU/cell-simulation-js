import { Registry, type Definition } from "@/registry";
import { type Renderer } from ".";
import { LightnessRenderer } from "./light";
import { CellRenderer } from "./cell";

export const renderRegistry = new Registry<Renderer>();

// Converts System into a Definition
const d = (constructor: new () => Renderer): Definition<Renderer> => {
  const system = new constructor();

  return {
    title: system.title,
    description: system.description,
    id: system.id,
    create: () => new constructor(),
  };
};

renderRegistry.register(d(LightnessRenderer));
renderRegistry.register(d(CellRenderer));
