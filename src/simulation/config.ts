import { sendToWorker } from "@/ipc";

export interface Config {
  mutationPercent: number;
  genomeLength: number;
  startEnergy: number;
  reproductionRequiredEnergy: number;
  cellMaxAge: number;
  photosynthesisEnergy: number;
  attackRequiredEnergy: number;
  attackEnergy: number;
  movementCost: number;
  turnCost: number;
  noopCost: number;
}

let config: Config = {
  mutationPercent: 50,
  genomeLength: 32,
  startEnergy: 5.0,
  reproductionRequiredEnergy: 16,
  cellMaxAge: 2048,
  photosynthesisEnergy: 1,
  attackRequiredEnergy: 2,
  attackEnergy: 4,
  movementCost: 1,
  turnCost: 0.5,
  noopCost: 0.1,
};
export default config;

export function updateConfig(newConfig: Partial<Config>) {
  Object.assign(config, newConfig);
  if (
    // @ts-expect-error Check if we're running inside in the main thread
    typeof WorkerGlobalScope === "undefined"
  ) {
    // Send the updated configuration to the worker automatically
    sendToWorker({
      type: "updateconfig",
      config,
    });
  }
}
