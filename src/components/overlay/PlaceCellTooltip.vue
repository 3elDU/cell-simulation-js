<template>
  <div id="place-cell-tooltip">
    <p>
      <IconMdiInfo id="icon" />
      {{ m("overlay.placeMessage") }}
    </p>
    <RoundedButton @click="cancelSelection()">
      {{ m("overlay.cancelSelection") }}
    </RoundedButton>
  </div>
</template>

<script setup lang="ts">
import m from "@/i18n/message";

const selectedCell = useSelectedCellStore();
const { setIsSelecting } = useIsSelecting();

function cancelSelection() {
  selectedCell.selected = false;
  setIsSelecting(false);
}
</script>

<style scoped>
#place-cell-tooltip {
  padding: var(--space-md);
  border-radius: var(--space-md);

  background: var(--pane-background);
  backdrop-filter: blur(var(--pane-blur));
  box-shadow: var(--pane-shadow);

  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

#icon {
  margin-right: var(--space-sm);
}

@media (max-width: 600px) {
  #place-cell-tooltip {
    width: 100%;
  }
}
</style>
