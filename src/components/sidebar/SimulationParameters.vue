<script setup lang="ts"></script>

<template>
  <div id="simulation-parameters">
    <FieldSize />
    <PhotosynthesisEnergy />
  </div>
</template>

<style scoped>
#simulation-parameters > :not(:last-child) {
  margin-bottom: var(--space-lg);
}
</style>
