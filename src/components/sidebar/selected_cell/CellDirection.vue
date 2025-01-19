<script setup lang="ts">
import type Bot from "@/simulation/bot";
import { Direction, rotateLeft, rotateRight } from "@/simulation/direction";
import { storeToRefs } from "pinia";

const selectedCell = useSelectedCellStore();

function rotateCellLeft() {
  selectedCell.value.direction = rotateLeft(selectedCell.value.direction);
  selectedCell.updateInWorker();
}
function rotateCellRight() {
  selectedCell.value.direction = rotateRight(selectedCell.value.direction);
  selectedCell.updateInWorker();
}

const cellRotation = computed(() => {
  switch (selectedCell.value.direction) {
    case Direction.Right:
      return "0deg";
    case Direction.Down:
      return "90deg";
    case Direction.Left:
      return "180deg";
    case Direction.Up:
      return "270deg";
  }
});
</script>

<template>
  <div
    id="cell-direction"
    class="w-1/3 h-fit aspect-square bg-black rounded-lg relative flex justify-center items-center"
  >
    <button
      class="top-1 left-1"
      @click="rotateCellLeft()"
      title="Rotate cell left"
    >
      <IconMdiRotateLeft />
    </button>
    <button
      class="top-1 right-1"
      @click="rotateCellRight()"
      title="Rotate cell right"
    >
      <IconMdiRotateRight />
    </button>

    <div
      class="w-[30%] h-[30%] rounded-md"
      :style="{ backgroundColor: selectedCell.value.color.toCSS() }"
    ></div>

    <div
      class="text-white absolute size-full flex justify-end items-center p-2"
      :style="{ rotate: cellRotation }"
    >
      <IconMdiArrowRight />
    </div>
  </div>
</template>

<style scoped>
#cell-direction > button {
  z-index: 10;
  position: absolute;
  color: white;
}
</style>
