<template>
  <div>
    <div id="container" class="flex flex-row bg-neutral-600 items-center gap-2 h-8"
      :class="collapsed ? 'rounded-md' : 'rounded-t-md'">

      <div @click="collapsed = !collapsed" class="cursor-pointer">
        <IconMdiMenuRight v-if="collapsed" />
        <IconMdiMenuDown v-else />
      </div>

      <div class="w-6 h-6 rounded" :style="{ backgroundColor: cell.color.toCSS() }"></div>
      <span>{{ savedCell.name }}</span>

      <div class="ml-auto mr-1 flex justify-center items-stretch gap-1">
        <button class="bg-transparent border-white text-sm" @click="load()">
          <IconMdiFileDownload /> <span>Load</span>
        </button>

        <button class="bg-transparent border-red-600 text-red-600 text-sm inline-flex items-center" @click="deleteCell()">
          <IconMdiTrash />
        </button>
      </div>
    </div>

    <div :style="{ display: collapsed ? 'none' : 'block' }" class="bg-neutral-600 rounded-b-md px-2">
      <div class="flex gap-4">
        <span>
          <IconMdiLightningBolt class="mr-1" />
          <span>{{ cell.energy.toFixed() }}</span>
        </span>

        <span>
          <IconMdiClock class="mr-1" />
          <span>{{ cell.age }}</span>
        </span>

        <span>
          <IconMdiArrowRight :style="{ transform: `rotate(${directionAngle}deg)` }" />
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
import Bot from '@/bot';
import { Direction } from '@/direction';
import { InputMode, type SavedCell } from '@/types';
const { setIsSelecting } = useIsSelecting();
const { setSelectedCell } = useSelectedCell();
const { setInputMode } = useInputMode();

const { savedCell, reloadHook } = defineProps<{
  savedCell: SavedCell,
  reloadHook: () => void,
}>();

const collapsed = ref(true);

const cell: Ref<Bot> = ref(Bot.fromJSON(JSON.parse(localStorage.getItem(savedCell.id) as string)));

const directionAngle = computed(() => {
  switch (cell.value.direction) {
    case Direction.Left: return 180;
    case Direction.Right: return 0;
    case Direction.Up: return 270;
    case Direction.Down: return 90;
  }
})

function load() {
  // clone a cell first
  const cloned = Bot.fromJSON(JSON.parse(JSON.stringify(cell.value)));
  setSelectedCell(cloned);
  setIsSelecting(true);
  setInputMode(InputMode.SelectCell);
}

function deleteCell() {
  localStorage.removeItem(savedCell.id);

  let savedCells: SavedCell[] = JSON.parse(localStorage.getItem("savedCells") ?? '[]') || [];
  savedCells = savedCells.filter(val => val.id != savedCell.id);

  localStorage.setItem("savedCells", JSON.stringify(savedCells));
  reloadHook();
}
</script>

<style scoped></style>
