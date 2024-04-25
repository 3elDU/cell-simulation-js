<template>
  <button @click="showModal()" title="Load a saved cell">
    <IconMdiFolderSpecial />
  </button>

  <ModalDialog v-model="modal">
    <p>Saved cells:</p>

    <div v-if="savedCells.length == 0" class="text-red-400 text-lg">
      <p>There are no saved cells!</p>
      <span class="text-blue-400">
        <IconMdiInfo class="mr-2" />
        You can save a cell by selecting one, and clicking a "Save" button,
        giving it a title, and optionally, description.
      </span>
    </div>
    <SavedCellPane
      class="mt-2"
      v-for="cell of savedCells"
      :saved-cell="cell"
      :reload-hook="reloadHook"
    ></SavedCellPane>
  </ModalDialog>
</template>

<script setup lang="ts">
import { type SavedCell } from "@/simulation/types";

const { isSelecting, setIsSelecting } = useIsSelecting();

const modal = ref(false);
const savedCells: Ref<SavedCell[]> = ref([]);

function showModal() {
  load();
  modal.value = true;
}

function load() {
  savedCells.value =
    JSON.parse(localStorage.getItem("savedCells") ?? "[]") ?? [];
}

function reloadHook() {
  load();
}

watch(isSelecting, (selecting) => {
  if (selecting) {
    modal.value = false;
  }
});
</script>

<style scoped>
button {
  @apply w-8 h-8 bg-neutral-300 border rounded-full border-neutral-400 flex justify-center items-center;
  @apply dark:bg-neutral-700 dark:border-neutral-600;
}
</style>
