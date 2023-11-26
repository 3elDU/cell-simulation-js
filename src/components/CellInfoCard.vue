<template>
  <div id="cell-info-card">
    <div id="cell-controls">
      <div v-if="cell.dead"
        class="border-[2px] rounded-[6px] border-red-700 text-red-600 bg-transparent px-[0.4rem] flex items-center gap-1">
        <IconMdiSkull />
        <span>Selected cell is dead</span>
      </div>

      <button v-if="cell.dead" @click="revive()" class="border-blue-500 text-blue-500 bg-transparent">
        <IconMdiUndo />
        <span>Revive</span>
      </button>

      <button v-if="!cell.dead" @click="kill()" class="border-red-600 text-red-600 bg-transparent">
        <IconMdiDelete />
        <span>Kill</span>
      </button>

      <SaveCellButton></SaveCellButton>
    </div>

    <div id="cell-info-container">
      <div class="absolute top-0 right-0 border-transparent bg-inherit cursor-pointer" @click="close()"
        title="Close this menu">
        <IconMdiClose />
      </div>

      <div id="cell-direction" class="relative flex justify-center items-center">
        <!--
          Use z-index of 10 for rotation buttons, so that they won't be overlayed by
          cell rotation icon
        -->
        <div class="z-10 bg-inherit border-transparent absolute top-0 left-1 cursor-pointer" @click="rotateCellLeft()"
          title="Rotate cell left">
          <IconMdiRotateLeft />
        </div>
        <div class="z-10 bg-inherit border-transparent absolute top-0 right-1 cursor-pointer" @click="rotateCellRight()"
          title="Rotate cell right">
          <IconMdiRotateRight />
        </div>

        <div id="cell" :style="{ backgroundColor: cell.color }"></div>

        <div class="absolute w-full h-full flex p-2 justify-end items-center" :style="{ rotate: cellRotation }">
          <IconMdiArrowRight />
        </div>
      </div>

      <div>
        <IconMdiLightningBolt class="mr-2" />
        <span>Energy: {{ cell.energy }}</span><br />

        <IconMdiClock class="mr-2 " />
        <span>Age: {{ cell.age }}</span><br />

        <IconMdiCrosshairsGps class="mr-2" />
        <span>X: {{ cell.x }}</span><br />
        <span class="ml-6">Y: {{ cell.y }}</span>
      </div>
    </div>


    <IconMdiDna /><span>Genome:</span>
    <Genome :key="genomeUpdateKey" :genome="selectedCell.genome" :current="cell.currentInstruction"></Genome>
  </div>
</template>

<script setup lang=ts>
import { forceRender, subscribe } from '@/render';
import simulation from '@/simulation';
import { Direction, rotateLeft, rotateRight } from '@/direction';
import config from '@/config';
const { selectedCell, setSelectedCell } = useSelectedCell();

const cell = shallowReactive({
  dead: true,
  x: 0,
  y: 0,
  currentInstruction: 0,
  direction: Direction.Left,
  energy: 0,
  age: 0,
  color: '',
});
const genomeUpdateKey = ref(0);

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
  setSelectedCell(null);
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

const cellRotation = computed(() => {
  switch (cell.direction) {
    case Direction.Right: return '0deg';
    case Direction.Down: return '90deg';
    case Direction.Left: return '180deg';
    case Direction.Up: return '270deg';
  }
})

onMounted(() => {
  render(true);

  subscribe((force: boolean) => {
    render(force);
  })
})

function render(force: boolean) {
  if (selectedCell.value == null) {
    return;
  }

  cell.dead = !selectedCell.value.alive;

  if (force || (!simulation.isPaused)) {
    const sc = selectedCell.value;

    cell.dead = !sc.alive;
    cell.x = sc.x;
    cell.y = sc.y;
    cell.currentInstruction = sc.currentInstruction;
    cell.energy = Math.floor(sc.energy);
    cell.direction = sc.direction;
    cell.color = sc.color.toCSS();
    cell.age = sc.age;

    genomeUpdateKey.value++;
  }
}
</script>

<style scoped>
#cell-controls {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;

  margin-bottom: 1rem;
}

#cell-info-container {
  position: relative;
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

  display: flex;
  justify-items: center;
  align-items: center;
}

#cell-direction #cell {
  width: 30%;
  height: 30%;
  border-radius: 4px;
}
</style>
