<script setup lang="ts">
import m from "@/i18n/message";
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
    <RoundedButton @click="toggleSidebar()" :title="m('controls.button')">
      <IconMdiMenu />
    </RoundedButton>

    <RoundedButton
      @click="simulation.togglePause()"
      :title="simulation.isPaused ? m('controls.play') : m('controls.pause')"
    >
      <IconMdiPlay v-if="simulation.isPaused" />
      <IconMdiPause v-else />
    </RoundedButton>
    <RoundedButton
      @click="sendToWorker({ type: 'reset' })"
      :title="m('controls.reset')"
    >
      <IconMdiReplay />
    </RoundedButton>
    <RoundedButton
      @click="sendToWorker({ type: 'clear' })"
      :title="m('controls.clear')"
    >
      <IconMdiTrash />
    </RoundedButton>
    <RoundedButton @click="step()" :title="m('controls.step')">
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
