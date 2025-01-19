import { sendToWorker } from "@/ipc";
import type { SimulationInfo } from "@/worker/ipc";
import { defineStore } from "pinia";

export const useSimulationStore = defineStore("simulation", {
  state: () =>
    ({
      width: 0,
      height: 0,
      fps: 0,
      isPaused: true,
      iterations: 0,
      prevIterations: 0,
    } as SimulationInfo),

  actions: {
    togglePause() {
      sendToWorker({
        type: "pause",
      });
    },
  },
});
