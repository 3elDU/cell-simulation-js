<script setup lang="ts">
import type { InputTypeHTMLAttribute } from "vue";

const model = defineModel<string>({ default: "" });
const id = useId();

defineProps<{
  type?: InputTypeHTMLAttribute;
  multiline?: boolean;
  label?: string;
}>();

defineOptions({
  inheritAttrs: false,
});
</script>

<template>
  <div class="input">
    <label v-if="label" :for="id">
      {{ label }}
    </label>
    <textarea v-if="multiline" :id v-bind="$attrs" v-model="model"></textarea>
    <input v-else :id :type v-bind="$attrs" v-model="model" />
  </div>
</template>

<style>
@layer components {
  .input {
    & > label {
      font-size: 0.9rem;
      display: inline-block;
      margin-block-end: var(--space-xs);
    }

    & > :is(input, textarea) {
      width: 100%;

      min-height: 2rem;
      max-height: 10rem;
      max-width: 100%;

      background: var(--input-field-background);
      color: var(--body-foreground);
      border-radius: var(--input-field-border-radius);
      padding: var(--input-field-padding);

      box-shadow: var(--slight-shadow);

      &:focus {
        outline: 1px solid var(--primary);
      }
    }
    & > textarea {
      resize: vertical;
      min-height: 4rem;
    }
  }

  @media (prefers-color-scheme: dark) {
    .input > :is(input, textarea) {
      border: 1px solid var(--background-high);
    }
  }
}
</style>
