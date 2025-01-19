<script setup lang="ts">
const simulation = useSimulationStore();
</script>

<template>
  Iterations: {{ simulation.iterations }} <br />
  FPS: {{ simulation.fps }}
</template>
