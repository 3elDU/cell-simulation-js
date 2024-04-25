<template>
  <div class="h-screen flex flex-row">
    <SimulationControls />
    <SidebarComponent />
    <SimulationCanvas />

    <div
      class="absolute right-3 bottom-3 flex flex-col gap-2 justify-end items-end"
    >
      <PlaceCellTooltip v-if="isSelecting"></PlaceCellTooltip>
      <InputModeSelector></InputModeSelector>
    </div>
  </div>
</template>

<script setup>
import { forceRender, subscribe } from "@/simulation/render";
import simulation from "@/simulation/simulation";
import { InputMode } from "./simulation/types";

const { togglePause } = usePause();
const { setInputMode } = useInputMode();
const { isSelecting, setIsSelecting } = useIsSelecting();

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
      simulation.generateMap();
      break;
    case "KeyS":
      simulation.update();
      forceRender();
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

  event.preventDefault();
};
const keyUpListener = (event) => {
  if (keysPressed.includes(event.code)) {
    keysPressed.splice(keysPressed.indexOf(event.code), 1);
  }
};

onMounted(() => {
  window.addEventListener("keydown", keyDownListener);
  window.addEventListener("keyup", keyUpListener);
});

onUnmounted(() => {
  window.removeEventListener("keydown", keyDownListener);
  window.removeEventListener("keyup", keyUpListener);
});
</script>
