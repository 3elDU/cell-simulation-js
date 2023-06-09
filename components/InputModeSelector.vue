<template>
  <div id="container">
    <button @click="setInputMode(InputMode.SelectCell)" :class="inputMode == InputMode.SelectCell ? 'active' : ''"
      title="Select">
      <Icon name="material-symbols:arrow-selector-tool"></Icon>
    </button>
    <button disabled @click="setInputMode(InputMode.SelectArea)"
      :class="inputMode == InputMode.SelectArea ? 'active' : ''" title="Select area" class="text-neutral-700">
      <Icon name="material-symbols:select"></Icon>
    </button>
    <button @click="setInputMode(InputMode.MoveCanvas)" :class="inputMode == InputMode.MoveCanvas ? 'active' : ''"
      title="Pan">
      <Icon name="material-symbols:pan-tool"></Icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { InputMode } from '~/src/types';
const { inputMode, setInputMode } = useInputMode();
</script>

<style scoped>
#container {
  padding: 0.1em;

  display: flex;
  flex-direction: column;
  justify-content: center;

  background-color: black;
  border: 2px solid #444444;
  border-radius: 6px;
}

.active {
  background-color: #666666;
  border-radius: 4px;
}

button {
  flex: 1;
  background-color: black;
  border: 0;
  border-radius: 0px;
  margin: 0.1em;

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
