<template>
  <div id="root">
    <div class="controls-container">
      <SimulationControls></SimulationControls>

      <p>
        Iterations: {{ iterations }} <br />
        FPS: {{ fps }}
      </p>


      <CellInfoCard></CellInfoCard>
    </div>

    <SimulationCanvas></SimulationCanvas>
  </div>
</template>

<script setup lang="ts">
import { subscribe } from './src/render';
import simulation from './src/simulation';

const iterations = ref(0);
const fps = ref(0);

onMounted(() => {
  subscribe(() => {
    iterations.value = simulation.iterations;
    fps.value = simulation.fps;
  });
})
</script>

<style>
body {
  margin: 0 !important;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: black;
  color: white;

  /* To disable scroll bouncing on Safari */
  overflow-x: hidden;
  overflow-y: hidden;
  overscroll-behavior-y: none;
}

#root {
  display: flex;
  flex-direction: row;
  height: 100dvh;
}

.controls-container {
  background-color: #222222;
  padding: 1rem;
  min-width: 300px;
  max-width: 300px;
  max-height: 100%;
  overflow-y: scroll;
  scrollbar-width: none;

  border-right: 1px solid #3f3f3f;
}

#fps-text {
  margin-bottom: 1rem;
}

.controls-container::-webkit-scrollbar {
  display: none;
}

button {
  padding-left: 0.3rem;
  padding-right: 0.3rem;
  border-radius: 4px;
  font-size: small;
  background-color: #111111;
  border: 2px solid #888888;
}

button:focus {
  outline: none;
  border: 2px solid white;
}
</style>
