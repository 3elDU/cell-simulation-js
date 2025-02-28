<script setup lang="ts">
withDefaults(
  defineProps<{
    element: keyof HTMLElementTagNameMap;
  }>(),
  {
    element: "button",
  }
);

defineSlots<{
  default(): unknown;
}>();
</script>

<template>
  <component :is="element" class="footer-button">
    <slot name="default" />
  </component>
</template>

<style scoped>
.footer-button {
  padding: var(--space-md);
  border-radius: var(--space-md);
  aspect-ratio: 1/1;

  transition: background var(--transition-fast) ease-in-out;
  background: var(--background-middle);
  color: var(--body-foreground);
  &:hover {
    background: var(--background-highest);
  }
}
</style>
