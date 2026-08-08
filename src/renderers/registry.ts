import { Registry, type Definition } from "@/registry";
import { type Renderer } from ".";
import { CellRenderer } from "./cell";
import { layerRenderer } from "./layer";
import { sensorRenderer } from "./sensor";
import { TaintRenderer } from "./taint";

export const renderRegistry = new Registry<Renderer>();

// Converts a Renderer class into a Definition
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
  layerRenderer("minerals", "Minerals", { r: 0.2, g: 0.7, b: 1 })
);
renderRegistry.register(
  layerRenderer("organics", "Organics", { r: 0.7, g: 0.35, b: 0.1 })
);
renderRegistry.register(d(CellRenderer));
renderRegistry.register(d(TaintRenderer));
renderRegistry.register(
  sensorRenderer(
    "energy",
    "Cell Energy",
    { r: 0.15, g: 0.15, b: 0.25 },
    { r: 1, g: 0.2, b: 0.1 }
  )
);
renderRegistry.register(
  sensorRenderer(
    "age",
    "Cell Age",
    { r: 0.1, g: 0.7, b: 0.35 },
    { r: 0.85, g: 0.85, b: 0.9 }
  )
);
renderRegistry.register(
  sensorRenderer(
    "crowding",
    "Cell Crowding",
    { r: 0.1, g: 0.2, b: 0.3 },
    { r: 1, g: 0.85, b: 0.2 }
  )
);
renderRegistry.register(
  sensorRenderer(
    "kinship",
    "Cell Kinship",
    { r: 0.35, g: 0.1, b: 0.5 },
    { r: 0.3, g: 0.95, b: 0.9 }
  )
);
renderRegistry.register(
  sensorRenderer(
    "hostility",
    "Cell Hostility",
    { r: 0.15, g: 0.3, b: 0.2 },
    { r: 1, g: 0.15, b: 0.25 }
  )
);
