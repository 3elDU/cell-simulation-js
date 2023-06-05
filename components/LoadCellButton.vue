<template>
  <button @click="showModal()" title="Load a saved cell">
    <Icon name="ic:baseline-folder-special"></Icon>
  </button>

  <dialog ref="modal">
    <p>Saved cells:</p>
    <div class="absolute top-1 right-2 cursor-pointer" @click="modal.close()">
      <Icon name="ic:close"></Icon>
    </div>

    <SavedCellPane class="mt-2" v-for="cell of savedCells" :saved-cell="cell" :reload-hook="reloadHook"></SavedCellPane>
  </dialog>
</template>

<script setup lang="ts">
import Bot from '~/src/bot';
import { type SavedCell } from '~/src/types';
const { isSelecting } = useIsSelecting();

const modal: Ref<HTMLDialogElement> = ref();
const savedCells: Ref<SavedCell[]> = ref([]);

function showModal() {
  load();
  modal.value.showModal();
}

function load() {
  savedCells.value = JSON.parse(localStorage.getItem("savedCells")) || [];
}

function reloadHook() {
  load();
}

watch(isSelecting, (selecting) => {
  if (selecting) {
    modal.value.close();
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
