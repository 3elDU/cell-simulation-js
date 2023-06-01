<template>
  <div id="root">
    <div id="modal" style="display: none">
      <div id="modal-container">
        <div id="modal-wrapper"></div>
      </div>
    </div>

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
  setInterval(() => {
    iterations.value = simulation.iterations;
    fps.value = simulation.fps;
  }, 1000);
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
  height: 100vh;
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

#modal {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

#modal-container {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

#modal-wrapper {
  margin: 25%;
  padding: 1rem;

  background-color: white;
  color: #1d2021;

  border-radius: 16px;
}
</style>
