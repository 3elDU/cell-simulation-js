<script setup lang="ts">
import { sendToWorker } from "@/ipc";

const sidebar = useSidebar();
const simulation = useSimulationStore();

function toggleSidebar() {
  sidebar.setIsOpened(!sidebar.isOpened.value);
}

function step() {
  sendToWorker({ type: "forward" });
}
</script>

<template>
  <div id="simulation-controls">
    <RoundedButton @click="toggleSidebar()">
      <IconMdiMenu />
    </RoundedButton>

    <RoundedButton @click="simulation.togglePause()" title="Toggle pause">
      <IconMdiPlay v-if="simulation.isPaused" />
      <IconMdiPause v-else />
    </RoundedButton>
    <RoundedButton
      @click="sendToWorker({ type: 'reset' })"
      title="Regenerate the map"
    >
      <IconMdiReplay />
    </RoundedButton>
    <RoundedButton
      @click="sendToWorker({ type: 'clear' })"
      title="Clear the map"
    >
      <IconMdiTrash />
    </RoundedButton>
    <RoundedButton @click="step()" title="Single step through the simulation">
      <IconMdiFastForward />
    </RoundedButton>
    <LoadCellButton></LoadCellButton>
  </div>
</template>

<style scoped>
#simulation-controls {
  position: absolute;

  left: var(--space-md);
  top: var(--space-md);

  z-index: var(--z-overlay);

  background: var(--pane-background);
  box-shadow: var(--pane-shadow);
  backdrop-filter: blur(var(--pane-blur));
  border-radius: var(--rounded-full);

  display: flex;
  gap: var(--space-sm);
  padding: var(--space-sm);

  --button-background: var(--body-background);
  --button-foreground: var(--body-foreground);
  --button-hover-background: var(--body-foreground);
  --button-hover-foreground: var(--body-background);
}
</style>
