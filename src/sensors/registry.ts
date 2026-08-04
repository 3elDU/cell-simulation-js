import { Registry, type Definition } from "@/registry";
import type { Sensor } from ".";
import { LightSensor } from "./light";
import { TemperatureSensor } from "./temperature";

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

sensorsRegistry.register(d(LightSensor));
sensorsRegistry.register(d(TemperatureSensor));

export type SensorsMap = {
  light: LightSensor;
  temperature: TemperatureSensor;
};
