<script setup lang="ts">
import { sendToWorker } from "./ipc";

const { setInputMode } = useInputMode();
const { isSelecting } = useIsSelecting();
const simulation = useSimulationStore();

const keysPressed: string[] = [];

function onKeyDown(event: KeyboardEvent) {
  if (keysPressed.includes(event.code)) {
    return;
  }
  keysPressed.push(event.code);

  let preventDefault = true;

  switch (event.code) {
    case "Space":
      simulation.togglePause();
      break;
    case !event.ctrlKey && "KeyR":
      sendToWorker({ type: "reset" });
      break;
    case "KeyS":
      sendToWorker({ type: "forward" });
      break;
    case "Digit1":
      setInputMode(InputMode.SelectCell);
      break;
    case "Digit2":
      setInputMode(InputMode.MoveCanvas);
      break;
    default:
      preventDefault = false;
      return;
  }

  if (preventDefault) {
    event.preventDefault();
  }
}

function onKeyUp(event: KeyboardEvent) {
  if (keysPressed.includes(event.code)) {
    keysPressed.splice(keysPressed.indexOf(event.code), 1);
  }

  event.preventDefault();
}

onMounted(() => {
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);
});
</script>

<template>
  <SimulationControls />
  <SidebarComponent />
  <SimulationCanvas />

  <div id="overlay-container">
    <PlaceCellTooltip v-if="isSelecting"></PlaceCellTooltip>
    <InputModeSelector></InputModeSelector>
  </div>
</template>

<style scoped>
#overlay-container {
  position: absolute;

  right: 0;
  bottom: 0;
  width: 100%;
  padding: var(--space-md);

  display: flex;
  gap: var(--space-lg);
  justify-content: end;
  align-items: end;
}
</style>
