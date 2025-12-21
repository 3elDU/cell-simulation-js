<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
}>();

defineSlots<{
  default(): unknown;
}>();
</script>

<template>
  <fieldset class="fieldset" :name="title" :title="title">
    <h1>{{ title }}</h1>
    <p v-if="description">{{ description }}</p>
    <slot name="default" />
  </fieldset>
</template>

<style scoped>
.fieldset > h1 {
  margin-bottom: var(--space-md);
  font-size: 18px;
}

.fieldset > p {
  margin-bottom: var(--space-sm);
}
</style>
