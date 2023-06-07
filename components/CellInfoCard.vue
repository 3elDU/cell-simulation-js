<template>
  <div id="cell-info-card" v-if="show">
    <div id="cell-controls">
      <div v-if="cell.dead" class="border-[2px] rounded-[6px] border-red-700 text-red-600 bg-transparent px-[0.4rem]">
        <Icon name="ic:baseline-info" class="mr-1"></Icon>
        <span>Selected cell is dead</span>
      </div>

      <button v-if="cell.dead" @click="revive()" class="border-blue-500 text-blue-500 bg-transparent">
        <Icon name="ic:baseline-undo" class="mr-1"></Icon>
        <span>Revive</span>
      </button>

      <button v-if="!cell.dead" @click="kill()" class="border-red-600 text-red-600 bg-transparent">
        <Icon name="ic:baseline-delete" class="mr-1"></Icon>
        <span>Kill</span>
      </button>

      <SaveCellButton></SaveCellButton>
    </div>

    <div id="cell-info-container" class="relative">
      <div class="absolute top-0 right-0 border-transparent bg-inherit cursor-pointer" @click="close()"
        title="Close this menu">
        <Icon name="ic:baseline-cancel"></Icon>
      </div>

      <div id="cell-direction" class="relative">
        <div class="bg-inherit border-transparent absolute top-1 left-1 cursor-pointer" @click="rotateCellLeft()"
          title="Rotate cell left">
          <Icon name="ic:baseline-rotate-left"></Icon>
        </div>
        <div class="bg-inherit border-transparent absolute top-1 right-1 cursor-pointer" @click="rotateCellRight()"
          title="Rotate cell right">
          <Icon name="ic:baseline-rotate-right"></Icon>
        </div>

        <div class="direction-arrow" style="grid-area: b"
          :style="{ visibility: cell.direction == Direction.Up ? 'visible' : 'hidden' }">
          <Icon name="ic:baseline-arrow-upward"></Icon>
        </div>

        <div class="direction-arrow" style="grid-area: d"
          :style="{ visibility: cell.direction == Direction.Left ? 'visible' : 'hidden' }">
          <Icon name="ic:baseline-arrow-back"></Icon>
        </div>

        <div id="cell" style="grid-area: e" :style="{ backgroundColor: cell.color }"></div>
        <div class="direction-arrow" style="grid-area: f"
          :style="{ visibility: cell.direction == Direction.Right ? 'visible' : 'hidden' }">
          <Icon name="ic:baseline-arrow-forward"></Icon>
        </div>

        <div class="direction-arrow" style="grid-area: i"
          :style="{ visibility: cell.direction == Direction.Down ? 'visible' : 'hidden' }">
          <Icon name="ic:baseline-arrow-downward"></Icon>
        </div>
      </div>

      <div style="white-space: pre-line">
        <Icon name="ic:baseline-bolt" class="mr-2"></Icon>
        Energy: {{ cell.energy }}<br />

        <Icon name="ic:outline-access-time" class="mr-2"></Icon>
        <span>Age: {{ cell.age }}</span><br />

        <Icon name="ic:baseline-gps-fixed" class="mr-2"></Icon>
        <span>X: {{ cell.x }}</span><br />
        <span class="ml-6">Y: {{ cell.y }}</span>
      </div>
    </div>


    <Icon name="ic:baseline-sd-storage"></Icon><span>Genome:</span>
    <Genome :key="genomeUpdateKey" :genome="selectedCell.genome" :current="selectedCell.currentInstruction"></Genome>
  </div>
</template>

<script setup lang=ts>
import { forceRender, subscribe } from '~/src/render';
import simulation from '~/src/simulation';
import { Direction, rotateLeft, rotateRight } from '~/src/direction';
import config from '~/src/config';
const { selectedCell, setSelectedCell } = useSelectedCell();

const genomeUpdateKey = ref(0);

const show = ref(false);
const cell = shallowReactive({
  dead: true,
  x: 0,
  y: 0,
  direction: undefined,
  energy: undefined,
  age: undefined,
  color: undefined,
});

function revive() {
  if (selectedCell.value.energy < config.startEnergy) {
    selectedCell.value.energy = config.startEnergy;
  }
  selectedCell.value.age = 0;
  selectedCell.value.alive = true;
  simulation.setCellAt(selectedCell.value.x, selectedCell.value.y, selectedCell.value);
  forceRender();
}

function kill() {
  selectedCell.value.alive = false;
  forceRender();
}

// Deselect the cell
function close() {
  selectedCell.value = null;
  forceRender();
}

function rotateCellLeft() {
  selectedCell.value.direction = rotateLeft(selectedCell.value.direction);
  forceRender();
}
function rotateCellRight() {
  selectedCell.value.direction = rotateRight(selectedCell.value.direction);
  forceRender();
}

onMounted(() => {
  subscribe((force: boolean) => {
    if (selectedCell.value == null) {
      show.value = false;
      return;
    }

    cell.dead = !selectedCell.value.alive;

    if (force || (!simulation.isPaused && selectedCell.value.alive)) {
      const sc = selectedCell.value;

      show.value = !sc.empty;

      cell.dead = !sc.alive;
      cell.x = sc.x;
      cell.y = sc.y;
      cell.energy = Math.floor(sc.energy);
      cell.direction = sc.direction;
      cell.color = sc.color.toCSS();
      cell.age = sc.age;

      genomeUpdateKey.value += 1;
    }
  })
})
</script>

<style scoped>
#cell-info-card {
  margin-top: 1rem;
}

#cell-controls {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;

  margin-top: 1rem;
  margin-bottom: 1rem;
}

#cell-info-container {
  display: flex;
  gap: 1rem;

  margin-top: 1rem;
  margin-bottom: 1rem;
}

#cell-direction {
  width: 33%;
  height: fit-content;
  aspect-ratio: 1/1;

  background-color: black;
  border-radius: 10px;

  display: grid;
  grid-template-rows: repeat(3, 1fr);
  grid-template-columns: repeat(3, 1fr);
  grid-template-areas:
    "a b c"
    "d e f"
    "g i h";
  justify-items: center;
  align-items: center;
}

.direction-arrow {
  display: flex;
  justify-content: center;
  align-items: center;
}

#cell-direction #cell {
  width: 90%;
  height: 90%;
  border-radius: 4px;
}
</style>
