<template>
  <button @click="showModal" class="border-blue-500 text-blue-500 bg-transparent">
    <IconMdiContentSave class="mr-1" />
    <span>Save cell</span>
  </button>

  <dialog ref="modal">
    <div @click="modal.close()" class="absolute top-1 right-2 cursor-pointer">
      <IconMdiClose />
    </div>

    <p>Save a cell</p>

    <form @submit="submit($event)">
      <input class="w-full mb-2" type="text" name="name" placeholder="Cell name" required v-model="name" /> <br />
      <textarea class="w-full" name="description" placeholder="Description" v-model="description" />
      <button type="submit" class="ml-auto">Save</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import simulation from '@/simulation';
import { type SavedCell } from '@/types';
const { selectedCell } = useSelectedCell();

const modal: Ref<HTMLDialogElement> = ref() as Ref<HTMLDialogElement>;
const name = ref('');
const description = ref('');

function showModal() {
  modal.value.showModal();
  name.value = '';
}

function submit(event: Event) {
  event.preventDefault();
  saveCell();
  modal.value.close();
}

function saveCell() {
  let savedCells: SavedCell[] = JSON.parse(localStorage.getItem("savedCells") ?? '[]');

  const uuid = self.crypto.randomUUID();
  const cell = JSON.stringify(selectedCell.value);
  localStorage.setItem(uuid, cell);

  savedCells.push({
    name: name.value,
    description: description.value,
    id: uuid,
  })
  localStorage.setItem("savedCells", JSON.stringify(savedCells));
}
</script>

<style scoped>
input,
textarea {
  background-color: #111111;
  border: 2px solid #444444;
  border-radius: 6px;
  padding: 2px;
  padding-left: 4px;
  padding-right: 4px;
}
</style>
