<script setup lang="ts">
import { Direction, rotateLeft, rotateRight } from "@/simulation/direction";

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
  <div id="cell-direction">
    <button id="rotate-left" @click="rotateCellLeft()" title="Rotate cell left">
      <IconMdiRotateLeft />
    </button>
    <button
      id="rotate-right"
      @click="rotateCellRight()"
      title="Rotate cell right"
    >
      <IconMdiRotateRight />
    </button>

    <div id="cell-display"></div>

    <div id="rotation-arrow" :style="{ rotate: cellRotation }">
      <IconMdiArrowRight />
    </div>
  </div>
</template>

<style scoped>
#cell-direction {
  position: relative;
  width: 33.33333%;
  height: auto;
  aspect-ratio: 1/1;

  background-color: black;
  border-radius: var(--rounded-lg);

  display: flex;
  justify-content: center;
  align-items: center;

  & > button {
    position: absolute;
    color: white;
  }
}

#rotate-left,
#rotate-right {
  border-radius: var(--rounded-lg);
  cursor: pointer;
}

#rotate-left {
  top: var(--space-xs);
  left: var(--space-xs);
}
#rotate-right {
  top: var(--space-xs);
  right: var(--space-xs);
}

#cell-display {
  width: 33.33333%;
  height: 33.33333%;
  border-radius: var(--rounded-md);

  background-color: v-bind("selectedCell.value.color.toCSS()");
}

#rotation-arrow {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;

  display: flex;
  justify-content: end;
  align-items: center;
  padding: var(--space-sm);

  color: white;
}
</style>
