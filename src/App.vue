<template>
  <div class="h-screen flex flex-row" @keydown.1="setInputMode(InputMode.SelectCell)"
    @keydown.capture.2="setInputMode(InputMode.MoveCanvas)" @keydown.capture.space="togglePause()">

    <SimulationControls></SimulationControls>
    <div ref="sidebar" class="fixed left-0 z-20 w-full sm:w-80 h-full p-4 pt-20 bg-neutral-800 overflow-y-auto transition-all duration-300 ease-in-out
      sm:border-r-2 border-neutral-700">
      <div class="h-full">

        <Accordion name="Simulation statistics" :initialState="true">
          Iterations: {{ iterations }} <br />
          FPS: {{ fps }}
        </Accordion>

        <Accordion v-if="(selectedCell instanceof Bot && !selectedCell.empty)" name="Selected cell">
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

<script setup>
import { forceRender, subscribe } from '@/render';
import simulation from '@/simulation';
import Bot from './bot';
import { InputMode } from './types';

const { togglePause } = usePause();
const { setInputMode } = useInputMode();
const { isOpened, setIsOpened } = useSidebar();
const { selectedCell } = useSelectedCell();
const { isSelecting, setIsSelecting } = useIsSelecting();

const iterations = ref(0);
const fps = ref(0);
const sidebar = ref();

let keysPressed = [];

const keyDownListener = (event) => {
  if (keysPressed.includes(event.code)) {
    return;
  }

  keysPressed.push(event.code);

  switch (event.code) {
    case "Space":
      togglePause();
      break;
    case "KeyR":
      simulation.generateMap()
      break;
    case "KeyS":
      simulation.update()
      forceRender()
      break;
    case "Digit1":
      setInputMode(InputMode.SelectCell)
      break;
    case "Digit2":
      setInputMode(InputMode.MoveCanvas)
      break;
    default:
      return;
  }

  event.preventDefault();
}
const keyUpListener = (event) => {
  if (keysPressed.includes(event.code)) {
    keysPressed.splice(keysPressed.indexOf(event.code), 1);
  }
}

onMounted(() => {
  subscribe(() => {
    iterations.value = simulation.iterations;
    fps.value = simulation.fps;
  });


  window.addEventListener('keydown', keyDownListener);
  window.addEventListener('keyup', keyUpListener);
})

onUnmounted(() => {
  window.removeEventListener('keydown', keyDownListener);
  window.removeEventListener('keyup', keyUpListener);
})

let sidebarVisibilityTimeout;
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
