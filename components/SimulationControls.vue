<template>
  <div class="control-buttons">
    <button @click="togglePause()" title="Toggle pause">
      <Icon :name="pauseIcon"></Icon>
    </button>
    <button @click="simulation.generateMap()" title="Regenerate the map">
      <Icon name="baseline-replay"></Icon>
    </button>
    <button @click="simulation.clearMap()" title="Clear the map">
      <Icon name="baseline-clear"></Icon>
    </button>
    <button @click="step()" title="Single step through the simulation">
      <Icon name="baseline-fast-forward"></Icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { forceRender, subscribe } from '~/src/render';
import simulation from '~/src/simulation';

const pauseIcon = ref('baseline-play-arrow');

function togglePause() {
  simulation.togglePause()
  pauseIcon.value = simulation.isPaused ? "baseline-play-arrow" : "baseline-pause";
}

function step() {
  simulation.update();
  forceRender();
}
</script>

<style scoped>
.control-buttons {
  background-color: black;
  border: 2px solid #323232;
  border-radius: 9999px;

  display: flex;
  width: fit-content;
  gap: .3rem;

  padding: 0.3rem;
  margin-bottom: 1rem;
}

button {
  width: 2rem;
  height: 2rem;

  background-color: #222222;
  border: 2px solid #434343;
  border-radius: 9999px;
}

button:active {
  background-color: #333333;
  border-color: white
}
</style>
