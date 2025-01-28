<script setup lang="ts">
import { type SavedCell } from "@/simulation/types";

const { isSelecting } = useIsSelecting();

const modal = ref(false);
const savedCells: Ref<SavedCell[]> = ref([]);

function showModal() {
  reloadSavedCells();
  modal.value = true;
}

function reloadSavedCells() {
  savedCells.value =
    JSON.parse(localStorage.getItem("savedCells") ?? "[]") ?? [];
}

watch(isSelecting, (selecting) => {
  if (selecting) {
    modal.value = false;
  }
});
</script>

<template>
  <RoundedButton @click="showModal()" title="Load a saved cell">
    <IconMdiFolderSpecial />
  </RoundedButton>

  <ModalDialog v-model="modal" title="Saved cells">
    <div class="saved-cells-container">
      <RoundedButton
        v-if="savedCells.length === 0"
        :clickable="false"
        id="no-saved-cells"
      >
        <IconMdiInfo />
        <p>There are no saved cells.</p>
      </RoundedButton>
      <p v-if="savedCells.length === 0">
        You can save a cell by selecting one, and clicking a "Save" button,
        giving it a title, and optionally, description.
      </p>
      <SavedCellPane
        v-for="cell of savedCells"
        :saved-cell="cell"
        @delete="reloadSavedCells"
      ></SavedCellPane>
    </div>
  </ModalDialog>
</template>

<style scoped>
#no-saved-cells {
  background: var(--negative);
  color: var(--on-negative);
}

.saved-cells-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}
</style>
