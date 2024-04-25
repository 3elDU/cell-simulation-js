<template>
  <button
    class="gene"
    :class="current ? 'selected' : null"
    :style="{ color: textColor, backgroundColor: background }"
    :title="title"
    @click="selectCurrent"
  >
    <p class="text-[10px]">
      {{ id }}
    </p>
    <p>{{ abbreviation }}</p>
  </button>
</template>

<script setup lang="ts">
import { Gene, InstructionInfoList } from "@/simulation/genome";

const { id, gene, current } = defineProps<{
  id: number;
  gene: Gene;
  current: boolean;
}>();

// Different gene groups have different colors
const background = ref("white");
const textColor = ref("black");
// One-letter abbreviation for the gene
const abbreviation = ref("-");
// Description for the gene
const title = ref("");

if (Object.keys(InstructionInfoList).includes(gene.instruction.toString())) {
  background.value = InstructionInfoList[gene.instruction].backgroundColor;
  textColor.value = InstructionInfoList[gene.instruction].color;
  abbreviation.value = InstructionInfoList[gene.instruction].abbreviation;
  title.value = `${id}: ${InstructionInfoList[gene.instruction].name}

Option: ${gene.opt}
Energy: ${gene.e}
B1: ${gene.b1}
B2: ${gene.b2}`;
}

// Moves instruction pointer in the cell to this instruction
function selectCurrent() {
  const selectedCell = useSelectedCellStore();
  if (selectedCell.value) {
    selectedCell.value.currentInstruction = id;
  }
}
</script>

<style scoped>
.gene {
  box-sizing: border-box;

  min-width: 2em;
  aspect-ratio: 1/1;
  border-radius: 5px;

  background-color: darkgreen;
  color: white;

  font-family: monospace;
  font-weight: bold;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  line-height: 10px;
}

.selected {
  border: 2px solid white;
}
</style>
