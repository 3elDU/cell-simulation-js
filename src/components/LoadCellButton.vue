<template>
  <button @click="showModal()" title="Load a saved cell">
    <IconMdiFolderSpecial />
  </button>

  <dialog ref="modal">
    <p>Saved cells:</p>
    <div class="absolute top-1 right-2 cursor-pointer" @click="modal?.close()">
      <IconMdiClose />
    </div>

    <div v-if="savedCells.length == 0" class="text-red-400 text-lg">
      <p>There are no saved cells!</p>
      <span class="text-blue-400">
        <IconMdiInfo class="mr-2" />
        You can save a cell by selecting one, and clicking a "Save" button,
        giving it a title,
        and optionally,
        description.
      </span>
    </div>
    <SavedCellPane class="mt-2" v-for="cell of savedCells" :saved-cell="cell" :reload-hook="reloadHook"></SavedCellPane>
  </dialog>
</template>

<script setup lang="ts">
import { type SavedCell } from '@/types';

const { isSelecting, setIsSelecting } = useIsSelecting();

const modal: Ref<HTMLDialogElement | undefined> = ref();
const savedCells: Ref<SavedCell[]> = ref([]);

function showModal() {
  load();
  modal.value?.showModal();
}

function load() {
  savedCells.value = JSON.parse(localStorage.getItem("savedCells") ?? "[]") ?? [];
}

function reloadHook() {
  load();
}

watch(isSelecting, (selecting) => {
  if (selecting) {
    modal.value?.close();
  }
})
</script>

<style scoped>
button {
  width: 2rem;
  height: 2rem;

  background-color: #222222;
  border: 2px solid #434343;
  border-radius: 9999px;

  display: flex;
  align-items: center;
}
</style>
