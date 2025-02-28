<script setup lang="ts">
import m from "@/i18n/message";
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
  <RoundedButton @click="showModal">
    <IconMdiContentSave />
    <span>{{ m("selectedCell.save") }}</span>
  </RoundedButton>

  <ModalDialog v-model="modal" :title="m('saveCellDialog.title')">
    <form @submit="submit($event)">
      <TextInput
        type="text"
        required
        :label="m('saveCellDialog.name')"
        v-model="name"
        autofocus
      />

      <TextInput
        multiline
        :label="m('saveCellDialog.description')"
        v-model="description"
      />

      <RoundedButton
        type="submit"
        id="save-cell-button"
        with-side-padding
        size="medium"
      >
        <IconMdiContentSave />
        {{ m("saveCellDialog.button") }}
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
