<script setup lang="ts">
import m from "@/i18n/message";
import Bot from "@/simulation/bot";
import { type SavedCell } from "@/simulation/types";
const { setIsSelecting } = useIsSelecting();
const { setInputMode } = useInputMode();

const selectedCell = useSelectedCellStore();

const { savedCell } = defineProps<{
  savedCell: SavedCell;
}>();

const emit = defineEmits(["delete"]);

const cell: Ref<Bot> = ref(
  Bot.fromJSON(JSON.parse(localStorage.getItem(savedCell.id)!))
);

function load() {
  // clone a cell first
  const cloned = Bot.fromJSON(cell.value);
  selectedCell.value = cloned;
  setIsSelecting(true);
  setInputMode(InputMode.SelectCell);
}

function deleteCell() {
  localStorage.removeItem(savedCell.id);

  let savedCells: SavedCell[] =
    JSON.parse(localStorage.getItem("savedCells") ?? "[]") || [];
  savedCells = savedCells.filter((val) => val.id != savedCell.id);

  localStorage.setItem("savedCells", JSON.stringify(savedCells));
  emit("delete");
}
</script>

<template>
  <Accordion>
    <template #title>
      <div
        class="cell-color-indicator"
        :style="{ backgroundColor: cell.color.toCSS() }"
      ></div>
      <span class="cell-name">{{ savedCell.name }}</span>
    </template>

    <div class="content-wrapper">
      <p class="cell-description" v-if="savedCell.description">
        {{ savedCell.description }}
      </p>

      <div class="cell-actions">
        <RoundedButton @click="load()" class="load-cell">
          <IconMdiFileDownload />
          <span>{{ m("savedCells.loadCell") }}</span>
        </RoundedButton>

        <RoundedButton @click="deleteCell()" class="delete-cell">
          <IconMdiTrash />
          <span>{{ m("savedCells.deleteCell") }}</span>
        </RoundedButton>
      </div>

      <div class="cell-genome">
        <Genome
          :genome="cell.genome"
          :current="cell.currentInstruction"
        ></Genome>
      </div>
    </div>
  </Accordion>
</template>

<style scoped>
.cell-color-indicator {
  width: var(--space-lg);
  aspect-ratio: 1/1;
  border-radius: var(--rounded-sm);
}

.cell-name {
  overflow: hidden;
  text-overflow: ellipsis;
}

.cell-description {
  white-space: pre-wrap;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.cell-actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: center;
}

.load-cell {
  --button-background: var(--primary);
  --button-foreground: var(--on-primary);
}
.delete-cell {
  --button-background: var(--negative);
  --button-foreground: var(--on-negative);
}

.cell-genome {
  width: 100%;
  max-width: 300px;
  margin: auto;
}
</style>
