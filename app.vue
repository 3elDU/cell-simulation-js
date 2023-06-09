<template>
  <div id="root">
    <SimulationControls></SimulationControls>
    <div id="controls-wrapper" ref="sidebar">
      <div id="controls-container">

        <Accordion name="Simulation statistics">
          Iterations: {{ iterations }} <br />
          FPS: {{ fps }}
        </Accordion>

        <Accordion v-if="selectedCell != null && !selectedCell.empty" name="Selected cell">
          <CellInfoCard></CellInfoCard>
        </Accordion>
      </div>
    </div>

    <SimulationCanvas></SimulationCanvas>

    <div class="absolute right-3 bottom-3 flex flex-wrap gap-2 justify-end items-end">
      <PlaceCellTooltip v-if="isSelecting"></PlaceCellTooltip>
      <InputModeSelector></InputModeSelector>
    </div>
  </div>
</template>

<script setup lang="ts">
import { subscribe } from './src/render';
import simulation from './src/simulation';
const { isOpened, setIsOpened } = useOpenSidebar();
const { selectedCell } = useSelectedCell();
const { isSelecting } = useIsSelecting();

const iterations = ref(0);
const fps = ref(0);
const sidebar: Ref<HTMLDivElement> = ref();

onMounted(() => {
  subscribe(() => {
    iterations.value = simulation.iterations;
    fps.value = simulation.fps;
  });
})

let sidebarVisibilityTimeout: NodeJS.Timeout;
watch(isOpened, (opened) => {
  if (opened) {
    sidebar.value.style.left = '0px';

    // clear the timeout, otherwise the sidebar transition could bug out and stay in the hidden state
    // ( for example,  when the user opens and closes the sidebar too fast )
    clearTimeout(sidebarVisibilityTimeout);
    sidebar.value.style.visibility = 'visible';
  } else {
    sidebar.value.style.left = `-${sidebar.value.getBoundingClientRect().width}px`

    //  hide the sidebar completely.
    // `setTimeout` is used, because we first need to wait before the CSS transition ends
    sidebarVisibilityTimeout = setTimeout(() => sidebar.value.style.visibility = 'hidden', 300);
  }
})
</script>

<style>
html {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  color: white;
}

body {
  margin: 0 !important;
  background-color: black;

  /* To disable scroll bouncing on Safari */
  overflow-x: hidden;
  overflow-y: hidden;
  overscroll-behavior-y: none;
}

span {
  vertical-align: middle;
}

#root {
  display: flex;
  flex-direction: row;
  height: 100dvh;
}

#controls-container {
  height: 100%;
}

#controls-wrapper {
  position: fixed;
  z-index: 20;

  width: 300px;
  height: 100%;
  padding: 1rem;
  padding-top: 5rem;

  background-color: #222222;

  overflow-y: scroll;
  scrollbar-width: none;

  left: 0px;
  transition: left 300ms ease-in-out;
}

#controls-wrapper::-webkit-scrollbar {
  display: none;
}

@media (max-width: 600px) {
  #controls-wrapper {
    min-width: 100vw;
  }
}

@media (min-width: 600px) {
  #controls-wrapper {
    border-right: 2px solid #323232;
  }
}

#fps-text {
  margin-bottom: 1rem;
}

button {
  padding-left: 0.4rem;
  padding-right: 0.4rem;
  border-radius: 6px;
  background-color: #111111;
  border: 2px solid #444444;

  transition: all 50ms;
}

button:focus {
  outline: none;
}

button:active {
  background-color: #343434;
  border-color: white;
}

dialog {
  border: 2px solid #3f3f3f;
  border-radius: 10px;

  background-color: #222222;
  color: white;

  padding: 0.7rem;

  min-width: 400px;
  width: 30%;
  max-width: 600px;
}

@media (max-width: 600px) {
  dialog {
    min-width: 100vw;

    border: 0;
    border-top: 2px solid #3f3f3f;
    border-bottom: 2px solid #3f3f3f;
    border-radius: 0;
  }
}

dialog:focus {
  outline: none;
}

dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.6);
}
</style>
