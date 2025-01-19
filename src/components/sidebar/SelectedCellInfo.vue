<template>
  <div class="flex flex-col gap-2">
    <CellControls />

    <div class="flex gap-2">
      <CellDirection />
      <div class="flex flex-col">
        <div>
          <IconMdiCrosshairsGps class="inline-block" />
          Cell position:
        </div>
        <div><strong>X</strong>: {{ selectedCell.x }}</div>
        <div><strong>Y</strong>: {{ selectedCell.y }}</div>
      </div>
    </div>

    <section class="flex flex-col gap-0.5">
      <p>
        <IconMdiLightningBolt class="inline-block" />
        Energy: {{ selectedCell.energy.toFixed(1) }}
      </p>

      <p>
        <IconMdiClock class="inline-block" />
        Age: {{ selectedCell.age }}
      </p>
    </section>

    <p>
      <IconMdiDna class="inline-block" />
      <span>Genome:</span>
    </p>
    <Genome
      :genome="selectedCell.genome"
      :current="selectedCell.currentInstruction"
    ></Genome>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";

const { value: selectedCell } = storeToRefs(useSelectedCellStore());
</script>
