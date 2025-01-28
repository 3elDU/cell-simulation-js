<template>
  <div id="input-mode-selector">
    <RoundedButton
      @click="setInputMode(InputMode.SelectCell)"
      :data-active="inputMode == InputMode.SelectCell"
      title="Select"
    >
      <IconMdiCursorDefault />
    </RoundedButton>
    <RoundedButton
      @click="setInputMode(InputMode.MoveCanvas)"
      :data-active="inputMode == InputMode.MoveCanvas"
      title="Pan"
    >
      <IconMdiPan />
    </RoundedButton>
  </div>
</template>

<script setup lang="ts">
const { inputMode, setInputMode } = useInputMode();
</script>

<style scoped>
#input-mode-selector {
  padding: var(--space-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  border-radius: 9999px;

  background: var(--pane-background);
  backdrop-filter: blur(var(--pane-blur));
  box-shadow: var(--pane-shadow);

  --button-background: transparent;
  --button-foreground: var(--body-foreground);

  > button[data-active="true"] {
    --button-background: var(--primary);
    --button-foreground: var(--on-primary);
    --button-hover-background: var(--primary);
    --button-hover-foreground: var(--on-primary);
  }
}
</style>
