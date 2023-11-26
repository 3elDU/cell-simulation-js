<template>
  <div class="p-1 flex gap-1 flex-col justify-center bg-black border-2 border-gray-600 rounded-md">
    <button class="p-1" @click="setInputMode(InputMode.SelectCell)"
      :class="inputMode == InputMode.SelectCell ? 'active' : ''" title="Select">
      <IconMdiCursorDefault />
    </button>
    <button class="p-1 text-neutral-700" disabled @click="setInputMode(InputMode.SelectArea)"
      :class="inputMode == InputMode.SelectArea ? 'active' : ''" title="Select area">
      <IconMdiSelect />
    </button>
    <button class="p-1" @click="setInputMode(InputMode.MoveCanvas)"
      :class="inputMode == InputMode.MoveCanvas ? 'active' : ''" title="Pan">
      <IconMdiPan />
    </button>
  </div>
</template>

<script setup lang="ts">
import { InputMode } from '@/types';
const { inputMode, setInputMode } = useInputMode();
</script>

<style scoped>
.active {
  background-color: #666666;
  border-radius: 4px;
}

button {
  background-color: black;
  border: 0;
  border-radius: 0px;

  padding-bottom: 0.2em;
  border-bottom: 2px solid #666666;

  transition: background-color 200ms ease-in-out;
}

button:active {
  border-color: #666666;
}

button:last-child {
  border-bottom: 0;
}
</style>
