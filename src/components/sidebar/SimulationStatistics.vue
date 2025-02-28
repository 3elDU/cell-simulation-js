<script setup lang="ts">
import m from "@/i18n/message";

const simulation = useSimulationStore();
</script>

<template>
  <section>
    <strong>{{ m("sidebar.iterations") }}</strong>
    <p>{{ simulation.iterations }}</p>
  </section>
  <section>
    <strong>FPS</strong>
    <section>{{ simulation.fps }}</section>
  </section>
</template>

<style scoped>
section {
  display: flex;
  justify-content: space-between;
}
</style>
