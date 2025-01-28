<script setup lang="ts">
const simulation = useSimulationStore();
</script>

<template>
  <section>
    <strong>Iterations</strong>
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
