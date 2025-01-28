<script setup lang="ts">
import { type Color, getColorValue } from "@/styles/color";

withDefaults(
  defineProps<{
    min: number;
    max: number;
    value: number;
    label: string;
    backgroundColor?: Color;
    backgroundFilledColor?: Color;
    textColor?: Color;
  }>(),
  {
    backgroundFilledColor: "positive",
  }
);

defineSlots<{
  label(props: { value: number; min: number; max: number }): any;
}>();
</script>

<template>
  <div
    class="bar"
    role="meter"
    :aria-valuemin="min"
    :aria-valuemax="max"
    :aria-valuenow="value"
    :aria-label="label"
    :style="{
      '--bar-fill-percent': `${(value / max) * 100}%`,
      '--bar-background': backgroundColor,
      '--bar-foreground': textColor,
    }"
  >
    <slot name="label" :value :min :max> {{ value }} / {{ max }} </slot>
  </div>
</template>

<style scoped>
.bar {
  padding: var(--space-tiny);
  width: 100%;
  border-radius: var(--rounded-full);

  display: flex;
  justify-content: center;
  align-items: center;

  user-select: none;

  --bar-filled-background: v-bind("getColorValue(backgroundFilledColor)");
  color: var(--bar-foreground);

  background: linear-gradient(
    to right,
    var(--bar-filled-background),
    var(--bar-filled-background) var(--bar-fill-percent),
    var(--bar-background) var(--bar-fill-percent),
    var(--bar-background) 100%
  );
  box-shadow: inset var(--slight-shadow);
  font-weight: bold;

  text-shadow: var(--slight-shadow);
}
</style>
