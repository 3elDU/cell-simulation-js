<template>
  <div
    class="absolute left-4 top-4 z-30 bg-neutral-200 dark:bg-neutral-950 border rounded-full border-neutral-400 dark:border-neutral-700 flex w-fit gap-1.5 p-1.5"
  >
    <button @click="toggleSidebar()">
      <IconMdiMenu />
    </button>

    <button @click="togglePause()" title="Toggle pause">
      <IconMdiPlay v-if="paused" />
      <IconMdiPause v-else />
    </button>
    <button @click="simulation.generateMap()" title="Regenerate the map">
      <IconMdiReplay />
    </button>
    <button @click="simulation.clearMap()" title="Clear the map">
      <IconMdiTrash />
    </button>
    <button @click="step()" title="Single step through the simulation">
      <IconMdiFastForward />
    </button>
    <LoadCellButton></LoadCellButton>
  </div>
  <div class="mb-14"></div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { forceRender } from "@/simulation/render";
import simulation from "@/simulation/simulation";

const sidebar = useSidebar();

const { paused, togglePause } = usePause();

function toggleSidebar() {
  sidebar.setIsOpened(!sidebar.isOpened.value);
}

function step() {
  simulation.update();
  forceRender();
}
</script>

<style scoped>
button {
  @apply w-8 h-8 bg-neutral-300 dark:bg-neutral-700 border rounded-full border-neutral-400 dark:border-neutral-600 flex justify-center items-center;
}

button:active {
  @apply bg-neutral-400 border-neutral-500;
}

@media (prefers-color-scheme: dark) {
  button:active {
    background-color: #333333;
    border-color: white;
  }
}
</style>
