import Bot from "@/simulation/bot";
import { defineStore } from "pinia";

export const useSelectedCellStore = defineStore("selected-cell", {
  state: () => ({
    value: null as null | Bot,
  }),
});
