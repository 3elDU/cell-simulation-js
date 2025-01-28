<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    clickable?: boolean;
    withSidePadding?: boolean;
    size?: "small" | "medium" | "large";
  }>(),
  {
    clickable: true,
    withSidePadding: false,
    size: "small",
  },
);

defineSlots<{
  default: unknown;
}>();

const emit = defineEmits<{ click: [MouseEvent] }>();

function onClick(event: MouseEvent) {
  if (props.clickable) {
    emit("click", event);
  }
}
</script>

<template>
  <component
    :is="clickable ? 'button' : 'span'"
    class="rounded-button"
    :data-clickable="clickable"
    :data-side-padding="withSidePadding"
    :data-size="size"
    @click="onClick"
  >
    <slot></slot>
  </component>
</template>

<style scoped>
@layer components {
  .rounded-button[data-size="small"] {
    --button-padding: var(--space-sm);
    --button-side-padding: var(--space-md);
  }
  .rounded-button[data-size="medium"] {
    --button-padding: var(--space-md);
    --button-side-padding: var(--space-lg);
  }
  .rounded-button[data-size="large"] {
    --button-padding: var(--space-lg);
    --button-side-padding: var(--space-xl);
  }

  .rounded-button {
    padding: var(--button-padding);

    background: var(--button-background);
    color: var(--button-foreground);
    &[data-clickable="true"] {
      cursor: pointer;

      transition:
        background-color var(--transition-fast) ease-in-out,
        color var(--transition-fast) ease-in-out;

      &:hover {
        background-color: var(--button-hover-background);
        color: var(--button-hover-foreground);
      }
      &:active {
        background-color: var(--button-active-background);
        color: var(--button-active-foreground);
      }
    }

    border-radius: var(--rounded-full);

    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--space-xs);
  }

  /*
    Add more padding on the left and right, when button has 2 or more children
  */
  .rounded-button:has(> :nth-child(2)),
  .rounded-button[data-side-padding="true"] {
    padding-left: var(--button-side-padding);
    padding-right: var(--button-side-padding);
  }
}
</style>
