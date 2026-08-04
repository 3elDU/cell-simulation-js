import { Registry, type Definition } from "@/registry";
import { type Renderer } from ".";
import { CellRenderer } from "./cell";
import { layerRenderer } from "./layer";

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

renderRegistry.register(layerRenderer("light", "Light", { r: 1, g: 1, b: 0 }));
renderRegistry.register(
  layerRenderer("minerals", "Minerals", { r: 0.2, g: 0.7, b: 1 }),
);
renderRegistry.register(
  layerRenderer("organics", "Organics", { r: 0.7, g: 0.35, b: 0.1 }),
);
renderRegistry.register(d(CellRenderer));
