<template>
  <div class="h-screen flex flex-row">
    <SimulationControls />
    <SidebarComponent />
    <SimulationCanvas />

    <div class="absolute right-3 bottom-3 flex gap-2 justify-end items-end">
      <PlaceCellTooltip v-if="isSelecting"></PlaceCellTooltip>
      <InputModeSelector></InputModeSelector>
    </div>
  </div>
</template>

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
      return;
  }
}

function onKeyUp(event: KeyboardEvent) {
  if (keysPressed.includes(event.code)) {
    keysPressed.splice(keysPressed.indexOf(event.code), 1);
  }
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
