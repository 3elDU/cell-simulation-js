<template>
  <div id="select-cell-tooltip">
    <button @click="cancelSelection()">Cancel</button>
    <div class="bg-[#111111] border-2 border-[#444444] rounded-md px-2">
      <IconMdiInfo class="mr-1" /><span>Click where to place a cell</span>
    </div>
  </div>
</template>

<script setup lang="ts">

const { setSelectedCell } = useSelectedCell();
const { setIsSelecting } = useIsSelecting();

function cancelSelection() {
  setSelectedCell(null);
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
