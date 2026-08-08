import { Registry, type Definition } from "@/registry";
import type { Sensor } from ".";
import { TemperatureSensor } from "./temperature";
import { EnergySensor } from "./energy";
import { LayerSensor, layerSensor } from "./layer";
import { AgeSensor } from "./age";
import { CrowdingSensor } from "./crowding";
import { KinshipSensor } from "./kinship";
import { HostilitySensor } from "./hostility";
import { AnchoredNeighborsSensor } from "./anchored-neighbors";
import { AnchoredSensor } from "./anchored";

export const sensorsRegistry = new Registry<Sensor>();

const d = (ctor: new () => Sensor): Definition<Sensor> => {
  const sensor = new ctor();

  return {
    id: sensor.id,
    title: sensor.title,
    description: sensor.description,
    create: () => new ctor(),
  };
};

sensorsRegistry.register(layerSensor("light", "Light"));
sensorsRegistry.register(layerSensor("minerals", "Minerals"));
sensorsRegistry.register(layerSensor("organics", "Organics"));
sensorsRegistry.register(d(TemperatureSensor));
sensorsRegistry.register(d(EnergySensor));
sensorsRegistry.register(d(AgeSensor));
sensorsRegistry.register(d(CrowdingSensor));
sensorsRegistry.register(d(KinshipSensor));
sensorsRegistry.register(d(HostilitySensor));
sensorsRegistry.register(d(AnchoredSensor));
sensorsRegistry.register(d(AnchoredNeighborsSensor));

export type SensorsMap = {
  light: LayerSensor;
  minerals: LayerSensor;
  organics: LayerSensor;
  temperature: TemperatureSensor;
  energy: EnergySensor;
  age: AgeSensor;
  crowding: CrowdingSensor;
  kinship: KinshipSensor;
  hostility: HostilitySensor;
  anchored: AnchoredSensor;
  "anchored-neighbors": AnchoredNeighborsSensor;
};
