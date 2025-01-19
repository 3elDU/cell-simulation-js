<template>
  <div id="select-cell-tooltip">
    <button
      @click="cancelSelection()"
      class="bg-red-600 text-white font-semibold rounded-md px-2"
    >
      Cancel
    </button>
    <div
      class="bg-neutral-50 dark:bg-[#111111] border-2 border-neutral-400 dark:border-[#444444] rounded-md px-2 flex gap-2 items-center"
    >
      <IconMdiInfo class="mr-1" />
      <span>Click where to place a cell</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const selectedCell = useSelectedCellStore();
const { setIsSelecting } = useIsSelecting();

function cancelSelection() {
  selectedCell.selected = false;
  setIsSelecting(false);
}
</script>

<style scoped>
#select-cell-tooltip {
  display: flex;
  justify-content: right;
  flex-wrap: wrap;
  gap: 0.5rem;
}

@media (max-width: 600px) {
  /*
  On mobile, display the cell selection tooltip on the bottom on the screen,
  otherwise it would be overlayed by simulation controls
  */
  #select-cell-tooltip {
    top: unset;
    bottom: 0;
  }
}
</style>
