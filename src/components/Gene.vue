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

const props = defineProps<{
  id: number;
  gene: Gene;
  current: boolean;
}>();

// Different gene groups have different colors
const background = computed(
  () => InstructionInfoList[props.gene.instruction].backgroundColor
);
const textColor = computed(
  () => InstructionInfoList[props.gene.instruction].color
);
// One-letter abbreviation for the gene
const abbreviation = computed(
  () => InstructionInfoList[props.gene.instruction].abbreviation
);
// Description for the gene
const title = computed(
  () => `${props.id}: ${InstructionInfoList[props.gene.instruction].name}

Option: ${props.gene.opt}
Energy: ${props.gene.e}
B1: ${props.gene.b1}
B2: ${props.gene.b2}`
);

// Moves instruction pointer in the cell to this instruction
function selectCurrent() {
  const selectedCell = useSelectedCellStore();
  if (selectedCell) {
    selectedCell.value.currentInstruction = props.id;
    selectedCell.updateInWorker();
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
  font-weight: 600;

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
