<script setup lang="ts">
import m from "@/i18n/message";
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
  <div id="cell-controls">
    <RoundedButton
      v-if="!cell.value.alive"
      :clickable="false"
      id="cell-is-dead"
    >
      <IconMdiInfo />
      <p>{{ m("selectedCell.isDead") }}</p>
    </RoundedButton>

    <RoundedButton v-if="!cell.value.alive" @click="revive()" id="revive">
      <IconMdiUndo />
      <span>{{ m("selectedCell.revive") }}</span>
    </RoundedButton>

    <RoundedButton v-if="cell.value.alive" @click="kill()" id="kill">
      <IconMdiDelete />
      <span>{{ m("selectedCell.kill") }}</span>
    </RoundedButton>

    <SaveCellButton :cell="cell.value" />
  </div>
</template>

<style scoped>
#cell-controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

#cell-is-dead,
#kill {
  background-color: var(--negative);
  color: var(--on-negative);
  &:not(#cell-is-dead):active {
    background-color: var(--negative-active);
  }
}
#revive {
  background-color: var(--positive);
  color: var(--on-positive);
  &:active {
    background-color: var(--positive-active);
  }
}
</style>
