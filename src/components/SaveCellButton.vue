<script setup lang="ts">
import Bot from "@/simulation/bot";
import { type SavedCell } from "@/simulation/types";

const props = defineProps<{
  cell: Bot;
}>();

const modal = ref(false);
const name = ref("");
const description = ref("");

function showModal() {
  modal.value = true;
  name.value = "";
}

function submit(event: Event) {
  event.preventDefault();
  saveCell();
  modal.value = false;
}

function saveCell() {
  let savedCells: SavedCell[] = JSON.parse(
    localStorage.getItem("savedCells") ?? "[]"
  );

  const uuid = self.crypto.randomUUID();
  const cell = JSON.stringify(props.cell);
  localStorage.setItem(uuid, cell);

  savedCells.push({
    name: name.value,
    description: description.value,
    id: uuid,
  });
  localStorage.setItem("savedCells", JSON.stringify(savedCells));
}
</script>

<template>
  <button
    @click="showModal"
    class="border-blue-500 text-blue-500 bg-transparent"
  >
    <IconMdiContentSave class="mr-1" />
    <span>Save cell</span>
  </button>

  <ModalDialog v-model="modal">
    <p>Save a cell</p>

    <form @submit="submit($event)">
      <input
        class="w-full mb-2"
        type="text"
        name="name"
        placeholder="Cell name"
        required
        v-model="name"
      />
      <br />
      <textarea
        class="w-full h-max max-h-64"
        name="description"
        placeholder="Description"
        v-model="description"
      />
      <button type="submit" class="ml-auto">Save</button>
    </form>
  </ModalDialog>
</template>

<style scoped>
input,
textarea {
  background-color: #dfdfdf;
  border: 1px solid #aaaaaa;
  border-radius: 6px;
  padding: 2px;
  padding-left: 4px;
  padding-right: 4px;
}

@media (prefers-color-sceme: dark) {
  input,
  textarea {
    background: #111111;
    border: 2px solid #444444;
  }
}
</style>
