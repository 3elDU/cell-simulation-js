import { Registry, type Definition } from "@/registry";
import type { Metric } from ".";
import { layerMetric } from "./layer";
import { sensorMetric } from "./sensor";
import { PopulationMetric } from "./population";

export const metricsRegistry = new Registry<Metric>();

// Converts a Metric class into a Definition
const d = (ctor: new () => Metric): Definition<Metric> => {
  const metric = new ctor();

  return {
    id: metric.id,
    title: metric.title,
    description: metric.description,
    create: () => new ctor(),
  };
};

metricsRegistry.register(d(PopulationMetric));
metricsRegistry.register(layerMetric("light", "Light"));
metricsRegistry.register(layerMetric("minerals", "Minerals"));
metricsRegistry.register(layerMetric("organics", "Organics"));
metricsRegistry.register(sensorMetric("energy", "Cell Energy"));
metricsRegistry.register(sensorMetric("age", "Cell Age"));
metricsRegistry.register(sensorMetric("temperature", "Temperature"));
metricsRegistry.register(sensorMetric("crowding", "Crowding"));
metricsRegistry.register(sensorMetric("kinship", "Kinship"));
