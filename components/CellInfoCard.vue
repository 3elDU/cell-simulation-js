<template>
  <div id="cell-info-card" v-if="show">
    <div v-if="cell.dead" id="cell-is-dead">
      <Icon name="baseline-info"></Icon>
      Selected cell is dead
    </div>

    <div id="cell-info-container" class="relative">
      <button class="absolute top-0 right-0 border-transparent bg-inherit" @click="close()" title="Close this menu">
        <Icon name="baseline-cancel"></Icon>
      </button>

      <div id="cell-direction" class="relative">
        <button class="bg-inherit border-transparent absolute top-1 left-0" @click="rotateCellLeft()"
          title="Rotate cell left">
          <Icon name="baseline-rotate-left"></Icon>
        </button>
        <button class="bg-inherit border-transparent absolute top-1 right-0" @click="rotateCellRight()"
          title="Rotate cell right">
          <Icon name="baseline-rotate-right"></Icon>
        </button>

        <div style="grid-area: b" :style="{ visibility: cell.direction == Direction.Up ? 'visible' : 'hidden' }">
          <Icon name="baseline-arrow-upward"></Icon>
        </div>

        <div style="grid-area: d" :style="{ visibility: cell.direction == Direction.Left ? 'visible' : 'hidden' }">
          <Icon name="baseline-arrow-back"></Icon>
        </div>
        <div id="cell" style="grid-area: e" :style="{ backgroundColor: cell.color }"></div>
        <div style="grid-area: f" :style="{ visibility: cell.direction == Direction.Right ? 'visible' : 'hidden' }">
          <Icon name="baseline-arrow-forward"></Icon>
        </div>

        <div style="grid-area: i" :style="{ visibility: cell.direction == Direction.Down ? 'visible' : 'hidden' }">
          <Icon name="baseline-arrow-downward"></Icon>
        </div>
      </div>

      <div style="white-space: pre-line">
        <Icon name="baseline-bolt" class="mr-2"></Icon>Energy: {{ cell.energy }}<br />
        <Icon name="outline-access-time" class="mr-2"></Icon>Age: {{ cell.age }}<br />
        <Icon name="baseline-gps-fixed" class="mr-2"></Icon>X: {{ cell.x }}<br />
        <span class="ml-6">Y: {{ cell.y }}</span>
      </div>
    </div>

    <div class="mt-4">
      <Icon name="baseline-sd-storage"></Icon>Genome:
      <div :key="genomeUpdateKey" id="cell-genome">
        <Gene v-for="[i, gene] of simulation.selectedCell.genome.entries()" :gene="gene"
          :current="i === simulation.selectedCell.currentInstruction" :id="i"></Gene>
      </div>
    </div>
  </div>
</template>

<script setup lang=ts>
import { forceRender, subscribe } from '~/src/render';
import simulation from '~/src/simulation';
import { Direction, rotateLeft, rotateRight } from '~/src/direction';
import Icon from './Icon.vue';

const genomeUpdateKey = ref(0);

const show = ref(false);
const cell = shallowReactive({
  dead: true,
  x: 0,
  y: 0,
  direction: undefined,
  energy: undefined,
  age: undefined,
  gene: undefined,
  color: undefined,
});

// Deselect the cell
function close() {
  simulation.selectedCell = null;
  forceRender();
}

function rotateCellLeft() {
  simulation.selectedCell.direction = rotateLeft(simulation.selectedCell.direction);
  forceRender();
}
function rotateCellRight() {
  simulation.selectedCell.direction = rotateRight(simulation.selectedCell.direction);
  forceRender();
}

onMounted(() => {
  subscribe((force: boolean) => {
    if (simulation.selectedCell == null) {
      show.value = false;
      return;
    }

    cell.dead = !simulation.selectedCell.alive;

    if (force || (!simulation.isPaused && simulation.selectedCell.alive)) {
      const sc = simulation.selectedCell;

      show.value = !sc?.empty;

      cell.dead = !sc.alive;
      cell.x = sc.x;
      cell.y = sc.y;
      cell.energy = Math.floor(sc.energy);
      cell.direction = sc.direction;
      cell.gene = sc.genome[sc.currentInstruction];
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
  margin-bottom: 1rem;
}

#cell-is-dead {
  background-color: #a22633;
  text-align: center;
  border-radius: 6px;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

#cell-info-container {
  display: flex;
  gap: 1rem;
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

#cell-direction #cell {
  width: 90%;
  height: 90%;
  border-radius: 4px;
}

#cell-genome {
  padding: 0.5rem;

  background-color: black;
  border-radius: 10px;

  display: grid;
  width: auto;
  grid-template-columns: repeat(8, 1fr);
  gap: 5px;
}

#current-instruction {
  background-color: red;
  border-radius: 4px;
}
</style>
