<template>
  <div
    class="p-1 flex gap-1 flex-col justify-center bg-white dark:bg-black border-2 border-neutral-400 dark:border-neutral-600 rounded-md"
  >
    <button
      class="p-1"
      @click="setInputMode(InputMode.SelectCell)"
      :class="inputMode == InputMode.SelectCell ? 'active' : ''"
      title="Select"
    >
      <IconMdiCursorDefault />
    </button>
    <div class="separator" />
    <button
      class="p-1 text-neutral-700"
      disabled
      @click="setInputMode(InputMode.SelectArea)"
      :class="inputMode == InputMode.SelectArea ? 'active' : ''"
      title="Select area"
    >
      <IconMdiSelect />
    </button>
    <div class="separator" />
    <button
      class="p-1"
      @click="setInputMode(InputMode.MoveCanvas)"
      :class="inputMode == InputMode.MoveCanvas ? 'active' : ''"
      title="Pan"
    >
      <IconMdiPan />
    </button>
  </div>
</template>

<script setup lang="ts">
import { InputMode } from "@/simulation/types";
const { inputMode, setInputMode } = useInputMode();
</script>

<style scoped>
.separator {
  border-bottom: 2px solid;
  @apply border-neutral-400 dark:border-neutral-600;
}

.active {
  @apply bg-neutral-400 dark:bg-neutral-600;
}

button {
  @apply rounded bg-white dark:bg-black transition-colors duration-200;
}
</style>
