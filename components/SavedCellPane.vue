<template>
  <div>
    <div id="container" class="flex flex-row bg-neutral-600 items-center gap-2 h-8"
      :class="collapsed ? 'rounded-md' : 'rounded-t-md'">

      <Icon :name="collapsed ? 'ic:baseline-arrow-right' : 'ic:baseline-arrow-drop-down'" @click="collapsed = !collapsed"
        class="cursor-pointer">
      </Icon>

      <div class="w-6 h-6 rounded" :style="{ backgroundColor: cell.color.toCSS() }"></div>
      <span>{{ savedCell.name }}</span>

      <div class="ml-auto mr-1 flex justify-center items-stretch gap-1">
        <button class="bg-transparent border-white text-sm" @click="load()">
          <Icon name="ic:baseline-file-open"></Icon> <span>Load</span>
        </button>

        <button class="bg-transparent border-red-600 text-red-600 text-sm inline-flex items-center" @click="deleteCell()">
          <Icon name="ic:baseline-delete"></Icon>
        </button>
      </div>
    </div>

    <div :style="{ display: collapsed ? 'none' : 'block' }" class="bg-neutral-600 rounded-b-md px-2">
      <div class="flex gap-4">
        <span>
          <Icon name="ic:baseline-bolt" class="mr-1"></Icon>
          <span>{{ cell.energy.toFixed() }}</span>
        </span>

        <span>
          <Icon name="ic:baseline-access-time" class="mr-1"></Icon>
          <span>{{ cell.age }}</span>
        </span>

        <span>
          <Icon :name="iconFromDirection()"></Icon>
        </span>
      </div>

      <p class="break-words">
        {{ savedCell.description }}
      </p>

      <div class="flex justify-center py-2">
        <Genome :genome="cell.genome" :current="cell.currentInstruction"></Genome>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Bot from '~/src/bot';
import { Direction } from '~/src/direction';
import { SavedCell } from '~/src/types';
const { isSelecting, setIsSelecting } = useIsSelecting();
const { selectedCell, setSelectedCell } = useSelectedCell();

const { savedCell, reloadHook } = defineProps<{
  savedCell: SavedCell,
  reloadHook: () => void,
}>();

const collapsed = ref(true);

const cell: Ref<Bot> = ref(Bot.fromJSON(JSON.parse(localStorage.getItem(savedCell.id))));

function iconFromDirection(): string {
  switch (cell.value.direction) {
    case Direction.Left: return "ic:baseline-arrow-back";
    case Direction.Right: return "ic:baseline-arrow-forward";
    case Direction.Up: return "ic:baseline-arrow-upward";
    case Direction.Down: return "ic:baseline-arrow-downward";
  }
}

function load() {
  // clone a cell first
  const cloned = Bot.fromJSON(JSON.parse(JSON.stringify(cell.value)));
  setSelectedCell(cloned);
  setIsSelecting(true);
}

function deleteCell() {
  localStorage.removeItem(savedCell.id);

  let savedCells: SavedCell[] = JSON.parse(localStorage.getItem("savedCells")) || [];
  savedCells = savedCells.filter(val => val.id != savedCell.id);

  localStorage.setItem("savedCells", JSON.stringify(savedCells));
  reloadHook();
}
</script>

<style scoped></style>
