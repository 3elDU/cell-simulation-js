<script setup lang="ts">
import simulation from "@/simulation/simulation";
import Bot from "@/simulation/bot";
import config from "@/simulation/config";
import { forceRender } from "@/simulation/render";

const props = defineProps<{
  cell: Bot;
}>();

function revive() {
  if (props.cell.energy < config.startEnergy) {
    props.cell.energy = config.startEnergy;
  }
  props.cell.age = 0;
  props.cell.alive = true;
  simulation.setCellAt(props.cell.x, props.cell.y, props.cell);
  forceRender();
}

function kill() {
  props.cell.alive = false;
  forceRender();
}
</script>
<template>
  <div id="cell-controls" class="flex flex-wrap gap-2">
    <div v-if="!cell.alive" class="border-red-700 text-red-600">
      <IconMdiInfo />
      <span>Selected cell is dead</span>
    </div>

    <button
      v-if="!cell.alive"
      @click="revive()"
      class="border-blue-500 text-blue-500 bg-transparent"
    >
      <IconMdiUndo />
      <span>Revive</span>
    </button>

    <button
      v-if="cell.alive"
      @click="kill()"
      class="border-red-600 text-red-600 bg-transparent"
    >
      <IconMdiDelete />
      <span>Kill</span>
    </button>

    <SaveCellButton :cell="cell" />
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
