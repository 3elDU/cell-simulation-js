<script setup lang="ts">
import { Gene, InstructionInfoList } from "@/simulation/genome";

const props = defineProps<{
  id: number;
  gene: Gene;
  current: boolean;
  selectable: boolean;
}>();

// Different gene groups have different colors
const background = computed(
  () => InstructionInfoList[props.gene.instruction].backgroundColor,
);
const textColor = computed(
  () => InstructionInfoList[props.gene.instruction].color,
);
// One-letter abbreviation for the gene
const abbreviation = computed(
  () => InstructionInfoList[props.gene.instruction].abbreviation,
);
// Description for the gene
const title = computed(
  () => `${props.id}: ${InstructionInfoList[props.gene.instruction].name}

Option: ${props.gene.opt}
Energy: ${props.gene.e}
B1: ${props.gene.b1}
B2: ${props.gene.b2}`,
);

// Moves instruction pointer in the cell to this instruction
function selectCurrent() {
  if (!props.selectable) {
    return;
  }
  const selectedCell = useSelectedCellStore();
  if (selectedCell) {
    selectedCell.value.currentInstruction = props.id;
    selectedCell.updateInWorker();
  }
}
</script>

<template>
  <button
    class="gene"
    :class="current ? 'current' : null"
    :style="{ color: textColor, backgroundColor: background }"
    :title="title"
    :data-selectable="selectable"
    :tabindex="selectable ? '0' : '-1'"
    @click="selectCurrent"
  >
    <p class="index">
      {{ id }}
    </p>
    <p>{{ abbreviation }}</p>
  </button>
</template>

<style scoped>
.gene {
  aspect-ratio: 1/1;
  border-radius: var(--rounded-sm);

  font-family: monospace;
  font-weight: bold;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  font-size: 0.8rem;
  line-height: 1;

  transition:
    box-shadow var(--transition-ultrafast) ease-in-out,
    border-color var(--transition-ultrafast) ease-in-out;

  & .index {
    font-weight: lighter;
    font-size: 75%;
  }

  &[data-selectable="true"] {
    cursor: pointer;
  }

  &:focus {
    outline: none;
  }
}

/*
  To indicate the current instruction, box-shadow is used in light theme.
  In dark theme a border is used instead
*/
@media (prefers-color-scheme: light) {
  .gene.current {
    box-shadow: 0 0 var(--space-md) v-bind(background);
  }
}
@media (prefers-color-scheme: dark) {
  .gene {
    border: 2px solid transparent;

    &.current {
      border-color: white;
    }
  }
}
</style>
