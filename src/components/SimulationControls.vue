<template>
  <div class="control-buttons">
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
import { ref } from 'vue';
import { forceRender } from '@/render';
import simulation from '@/simulation';

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
.control-buttons {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 30;

  background-color: black;
  border: 2px solid #323232;
  border-radius: 9999px;

  display: flex;
  width: fit-content;
  gap: .3rem;

  padding: 0.3rem;
}

@media (min-width: 900px) {}

button {
  width: 2rem;
  height: 2rem;

  background-color: #222222;
  border: 2px solid #434343;
  border-radius: 9999px;

  display: flex;
  align-items: center;
}

button:active {
  background-color: #333333;
  border-color: white
}
</style>
