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

  <ModalDialog v-model="modal" id="save-cell-dialog">
    <form @submit="submit($event)">
      <p>Save a cell</p>

      <fieldset>
        <input
          type="text"
          name="name"
          placeholder="Cell name"
          required
          v-model="name"
        />
        <br />
        <textarea
          name="description"
          placeholder="Description"
          v-model="description"
        />
      </fieldset>

      <button type="submit" id="save-cell">Save</button>
    </form>
  </ModalDialog>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

p {
  font-size: 125%;
}

fieldset > :first-child {
  margin-bottom: 0.5rem;
}

fieldset > * {
  width: 100%;
}

textarea {
  min-height: 30px;
  max-height: 16rem;
}

input,
textarea {
  background-color: #dfdfdf;
  border: 1px solid #aaaaaa;
  border-radius: 6px;
  padding: 2px;
  padding-left: 4px;
  padding-right: 4px;
}

@media (prefers-color-scheme: dark) {
  input,
  textarea {
    background: #111111;
    border: 1px solid #444444;
  }
}

#save-cell {
  margin-left: auto;

  background: cornflowerblue;
  color: white;

  padding: 0.3rem 1rem;
  border-radius: 8px;
}
</style>
