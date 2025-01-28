<script setup lang="ts">
import config from "@/simulation/config";
import { storeToRefs } from "pinia";

const { isPaused } = storeToRefs(useSimulationStore());

const { value: selectedCell } = storeToRefs(useSelectedCellStore());

const energyBarNegative = computed(
  () => selectedCell.value.energy < config.startEnergy
);
const lifetimeBarNegative = computed(
  () => selectedCell.value.age > config.cellMaxAge * (2 / 3)
);
</script>

<template>
  <article id="selected-cell-info">
    <CellControls v-if="isPaused" />

    <div id="position">
      <CellDirection />
      <div>
        <p><strong>X</strong>: {{ selectedCell.x }}</p>
        <p><strong>Y</strong>: {{ selectedCell.y }}</p>
      </div>
    </div>

    <section id="meters">
      <Bar
        id="energy-bar"
        :value="selectedCell.energy"
        :min="0"
        :max="config.reproductionRequiredEnergy"
        :background-filled-color="energyBarNegative ? 'negative' : undefined"
        label="Cell energy"
      >
        <template #label="{ value, max }">
          <IconMdiLightningBolt />
          Energy: {{ value.toFixed(2) }} / {{ max }}
        </template>
      </Bar>
      <Bar
        id="lifetime-bar"
        :value="selectedCell.age"
        :min="0"
        :max="config.cellMaxAge"
        :background-filled-color="lifetimeBarNegative ? 'negative' : undefined"
        :text-color="lifetimeBarNegative ? 'white' : undefined"
        label="Cell age"
      >
        <template #label="{ value, max }">
          <IconMdiHourglass />
          Age: {{ value }} / {{ max }}
        </template>
      </Bar>
    </section>

    <Genome
      :genome="selectedCell.genome"
      :current="selectedCell.currentInstruction"
      selectable
    />
  </article>
</template>

<style scoped>
#selected-cell-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

#meters {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

#position {
  display: flex;
  gap: var(--space-sm);
}
</style>
