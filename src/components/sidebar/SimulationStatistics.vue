<script setup lang="ts">
import { subscribe } from "@/simulation/render";
import simulation from "@/simulation/simulation";

const iterations = ref(0);
const fps = ref(0);

onMounted(() => {
  subscribe(() => {
    iterations.value = simulation.iterations;
    fps.value = simulation.fps;
  });
});
</script>

<template>
  Iterations: {{ iterations }} <br />
  FPS: {{ fps }}
</template>
