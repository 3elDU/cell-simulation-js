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
    localStorage.getItem("savedCells") ?? "[]",
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
  <RoundedButton @click="showModal">
    <IconMdiContentSave />
    <span>Save cell</span>
  </RoundedButton>

  <ModalDialog v-model="modal" title="Save a cell">
    <form @submit="submit($event)">
      <TextInput type="text" required label="Name" v-model="name" autofocus />

      <TextInput multiline label="Description" v-model="description" />

      <RoundedButton
        type="submit"
        id="save-cell-button"
        with-side-padding
        size="medium"
      >
        <IconMdiContentSave />
        Save
      </RoundedButton>
    </form>
  </ModalDialog>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

fieldset > * {
  width: 100%;
}

#save-cell-button {
  margin-left: auto;
}
</style>
