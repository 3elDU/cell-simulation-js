<script setup lang="ts">
import { ref } from "vue";

defineSlots<{
  default(): unknown;
  title(): unknown;
}>();

const props = defineProps<{
  name?: string;
  initialState?: boolean;
}>();

const open = ref(props.initialState);

function toggleAccordion() {
  open.value = !open.value;
}
</script>

<template>
  <details class="accordion" :open="open">
    <summary class="title" @click.prevent="toggleAccordion">
      <IconMdiChevronRight class="icon" />

      <slot name="title">
        <span>{{ name }}</span>
      </slot>
    </summary>

    <div class="content" v-if="open">
      <slot></slot>
    </div>
  </details>
</template>

<style scoped>
@layer components {
  .accordion {
    background-color: var(--background-middle);
    border-radius: var(--rounded-lg);
    box-shadow: var(--pane-shadow);
  }

  .title {
    border-radius: var(--rounded-lg);
    background-color: var(--body-background);
    padding: var(--space-sm);

    user-select: none;
    -webkit-user-select: none;
    cursor: pointer;

    display: flex;
    gap: 0.5rem;
    align-items: center;

    transition: background-color var(--transition-fast) ease-in-out;
    & > .icon {
      rotate: 0deg;
      transition: rotate var(--transition-medium) ease-in-out;
    }
  }

  .accordion[open] .icon {
    rotate: 90deg;
  }

  .title:active {
    background-color: var(--background-middle);
  }

  .content {
    padding: var(--space-md);
  }
}
</style>
