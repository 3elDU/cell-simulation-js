<script setup lang="ts">
import Bot from "@/simulation/bot";
import config from "@/simulation/config";

const cell = useSelectedCellStore();

function revive() {
  cell.value.energy = Math.min(cell.value.energy, config.startEnergy);
  cell.value.age = 0;
  cell.value.alive = true;
  cell.updateInWorker();
}

function kill() {
  cell.value.alive = false;
  cell.updateInWorker();
}
</script>
<template>
  <div id="cell-controls" class="flex flex-wrap gap-2">
    <div v-if="!cell.value.alive" class="border-red-700 text-red-600">
      <IconMdiInfo />
      <span>Selected cell is dead</span>
    </div>

    <button
      v-if="!cell.value.alive"
      @click="revive()"
      class="border-blue-500 text-blue-500 bg-transparent"
    >
      <IconMdiUndo />
      <span>Revive</span>
    </button>

    <button
      v-if="cell.value.alive"
      @click="kill()"
      class="border-red-600 text-red-600 bg-transparent"
    >
      <IconMdiDelete />
      <span>Kill</span>
    </button>

    <SaveCellButton :cell="cell.value" />
  </div>
</template>

<style scoped>
#cell-controls > :is(div, button) {
  border: 2px solid;
  border-radius: 6px;
  padding-left: 8px;
  padding-right: 8px;

  display: flex;
  gap: 4px;
  align-items: center;
}
</style>
