import { sendToWorker } from "@/ipc";
import Bot from "@/simulation/bot";
import { defineStore } from "pinia";

export const useSelectedCellStore = defineStore("selected-cell", {
  state: () => ({
    selected: false,
    // This will be an empty object when selected is false
    value: {} as Bot,
  }),
  actions: {
    // Sends the cell object to the worker, allowing
    // for the cell to be modified from the main thread
    updateInWorker() {
      if (!this.selected) {
        return;
      }

      sendToWorker({
        type: "setcell",
        x: this.value.x,
        y: this.value.y,
        cell: toRaw(this.value),
      });
    },
  },
});
