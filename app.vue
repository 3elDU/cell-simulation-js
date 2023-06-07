<template>
  <div id="root">
    <SimulationControls></SimulationControls>
    <div id="controls-wrapper" ref="sidebar">
      <div id="controls-container">

        <p>
          Iterations: {{ iterations }} <br />
          FPS: {{ fps }}
        </p>


        <CellInfoCard></CellInfoCard>
      </div>
    </div>

    <SimulationCanvas></SimulationCanvas>
  </div>
</template>

<script setup lang="ts">
import { subscribe } from './src/render';
import simulation from './src/simulation';
const { isOpened, setIsOpened } = useOpenSidebar();

const iterations = ref(0);
const fps = ref(0);
const sidebar: Ref<HTMLDivElement> = ref();

onMounted(() => {
  subscribe(() => {
    iterations.value = simulation.iterations;
    fps.value = simulation.fps;
  });
})

watch(isOpened, (opened) => {
  if (opened) {
    sidebar.value.style.left = '0px';
  } else {
    sidebar.value.style.left = `-${sidebar.value.getBoundingClientRect().width}px`
  }
})

addEventListener("resize", () => {
  console.log("resize")
  if (!isOpened.value) {
    // update `left` property for the sidebar, when window was resized
    sidebar.value.style.left = `-${sidebar.value.getBoundingClientRect().width}px`
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
  border-right: 2px solid #323232;

  overflow-y: scroll;
  scrollbar-width: none;

  left: 0px;
  transition-property: left, min-width, width, max-width, min-height, height, max-height, border;
  transition-duration: 300ms;
  transition-timing-function: ease-in-out;
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
