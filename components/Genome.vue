<template>
  <div id="cell-genome">
    <Gene v-for="[i, gene] in genome.entries()" :gene="gene" :current="i === current" :id="i" />
  </div>
</template>

<style scoped>
#cell-genome {
  padding: 0.5rem;

  background-color: black;
  border-radius: 10px;

  display: grid;
  width: auto;
  grid-template-columns: repeat(8, 1fr);
  gap: 5px;
}

#current-instruction {
  background-color: red;
  border-radius: 4px;
}
</style>

<script setup lang="ts">
import simulation from '~/src/simulation';
import { Gene as GeneType } from '~/src/genome';

const { genome, current } = defineProps<{
  genome: GeneType[],
  current: number,
}>();
</script>
