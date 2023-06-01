<template>
  <div id="gene" :class="current ? 'selected' : null" :style="{ color: textColor, backgroundColor: background }"
    :title="title">
    {{ abbreviation }}
  </div>
</template>

<script setup lang="ts">
import { Gene, Instruction } from '~/src/genome';

const { id, gene, current } = defineProps({
  id: Number,
  gene: Gene,
  current: Boolean,
})

// Different gene groups have different colors
const background = ref('white');
const textColor = ref('black');
// One-letter abbreviation for the gene
const abbreviation = ref('-');
// Description for the gene
const title = ref('');

const mapping = {
  [Instruction.NOOP]: ['red', 'white', 'N', 'No-op'],
  [Instruction.TURN_LEFT]: ['#b55088', 'white', 'L', 'Turn left'],
  [Instruction.TURN_RIGHT]: ['#b55088', 'white', 'R', 'Turn right'],
  [Instruction.MOVE_FORWARDS]: ['#68386c', 'white', 'M', 'Move forwards'],
  [Instruction.PHOTOSYNTHESIS]: ['#63c74d', 'black', 'P', 'Produce energy by photosynthesis'],
  [Instruction.GIVE_ENERGY]: ['#f77622', 'white', 'G', 'Give energy to cell in front'],
  [Instruction.ATTACK_CELL]: ['#e43b44', 'white', 'A', 'Attack cell in front'],
  [Instruction.RECYCLE_DEAD_CELL]: ['#3e8948', 'white', 'R', 'Recycle dead cell in front'],
  [Instruction.CHECK_ENERGY]: ['#124e89', 'white', 'E', 'Check energy'],
  [Instruction.CHECK_ROTATION]: ['#124e89', 'white', 'R', 'Check rotation'],
  [Instruction.JMP_IF_FACING_ALIVE_CELL]: ['#124e89', 'white', 'A', 'Jump if facing alive cell'],
  [Instruction.JMP_IF_FACING_DEAD_CELL]: ['#124e89', 'white', 'D', 'Jump if facing dead cell'],
  [Instruction.JMP_IF_FACING_VOID]: ['#124e89', 'white', 'V', 'Jump if facing void'],
  [Instruction.JMP_IF_FACING_RELATIVE]: ['#124e89', 'white', 'S', 'Jump if facing relative'],
  [Instruction.MAKE_CHILD]: ['#2ce8f5', 'black', 'M', 'Make child'],
}

if (Object.keys(mapping).includes(gene.instruction.toString())) {
  background.value = mapping[gene.instruction][0];
  textColor.value = mapping[gene.instruction][1];
  abbreviation.value = mapping[gene.instruction][2];
  title.value = `${id}: ${mapping[gene.instruction][3]}

Option: ${gene.opt}
Energy: ${gene.e}
B1: ${gene.b1}
B2: ${gene.b2}
B3: ${gene.b3}
B4: ${gene.b4}`;
}

</script>

<style scoped>
#gene {
  width: 100%;
  aspect-ratio: 1/1;
  border-radius: 5px;

  background-color: darkgreen;
  color: white;

  font-family: monospace;
  font-weight: bold;

  display: flex;
  justify-content: center;
  align-items: center;
}

.selected {
  box-sizing: border-box;
  border: 3px solid white;
}
</style>
