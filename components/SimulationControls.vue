<template>
  <div class="control-buttons">
    <button @click="toggleSidebar()">
      <Icon name="ic:menu"></Icon>
    </button>

    <button @click="togglePause()" title="Toggle pause">
      <Icon :name="pauseIcon"></Icon>
    </button>
    <button @click="simulation.generateMap()" title="Regenerate the map">
      <Icon name="ic:baseline-replay"></Icon>
    </button>
    <button @click="simulation.clearMap()" title="Clear the map">
      <Icon name="ic:baseline-clear"></Icon>
    </button>
    <button @click="step()" title="Single step through the simulation">
      <Icon name="ic:baseline-fast-forward"></Icon>
    </button>
    <LoadCellButton></LoadCellButton>
  </div>
  <div class="mb-14"></div>
</template>

<script setup lang="ts">
import { forceRender, subscribe } from '~/src/render';
import simulation from '~/src/simulation';
const { isOpened, setIsOpened } = useOpenSidebar();

const pauseIcon = ref('ic:baseline-play-arrow');

function toggleSidebar() {
  setIsOpened(!isOpened.value);
}

function togglePause() {
  simulation.togglePause()
  pauseIcon.value = simulation.isPaused ? "ic:baseline-play-arrow" : "ic:baseline-pause";
  forceRender();
}

function step() {
  simulation.update();
  forceRender();
}
</script>

<style scoped>
.control-buttons {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 30;

  background-color: black;
  border: 2px solid #323232;
  border-radius: 9999px;

  display: flex;
  width: fit-content;
  gap: .3rem;

  padding: 0.3rem;
}

@media (min-width: 900px) {}

button {
  width: 2rem;
  height: 2rem;

  background-color: #222222;
  border: 2px solid #434343;
  border-radius: 9999px;

  display: flex;
  align-items: center;
}

button:active {
  background-color: #333333;
  border-color: white
}
</style>
