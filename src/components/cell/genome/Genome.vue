<script setup lang="ts">
import { Gene as GeneType } from "@/simulation/genome";

withDefaults(
  defineProps<{
    genome: GeneType[];
    current: number;
    selectable?: boolean;
  }>(),
  {
    selectable: false,
  },
);
</script>

<template>
  <div id="cell-genome">
    <Gene
      v-for="(gene, i) in genome"
      :gene
      :selectable
      :current="i === current"
      :id="i"
    />
  </div>
</template>

<style scoped>
#cell-genome {
  padding: var(--space-sm);

  background-color: var(--body-background);
  border-radius: var(--rounded-lg);

  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: var(--space-xs);
}
</style>
