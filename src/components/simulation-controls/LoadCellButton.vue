<script setup lang="ts">
import m from "@/i18n/message";
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
  <RoundedButton @click="showModal()" :title="m('controls.loadcell')">
    <IconMdiFolderSpecial />
  </RoundedButton>

  <ModalDialog v-model="modal" :title="m('savedCells.modalTitle')">
    <div class="saved-cells-container">
      <RoundedButton
        v-if="savedCells.length === 0"
        :clickable="false"
        id="no-saved-cells"
      >
        <IconMdiInfo />
        <p>{{ m("savedCells.noSavedCells") }}</p>
      </RoundedButton>
      <p v-if="savedCells.length === 0">
        {{ m("savedCells.noSavedCellsInfoMessage") }}
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
