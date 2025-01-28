<script setup lang="ts">
defineProps<{
  title: string;
}>();

defineSlots<{
  default(): unknown;
}>();

const open = defineModel<boolean>({ default: false });
const dialog: Ref<HTMLDialogElement | undefined> = ref();

watch(open, (open) => {
  if (open) {
    dialog.value!.showModal();
  } else {
    dialog.value!.close();
  }
});

function stopEventPropagation(event: Event) {
  // Stop "keydown" / "keyup" event propagation, so that global keyboard shortcuts don't interfere with inputs inside the modal.
  event.stopPropagation();
}
</script>

<template>
  <Teleport to="#modal-dialog-container">
    <dialog
      ref="dialog"
      class="modal-dialog"
      @close="open = false"
      @keydown="stopEventPropagation"
      @keyup="stopEventPropagation"
    >
      <header class="dialog-header">
        <h1>{{ title }}</h1>
        <button @click="open = false" title="Close modal dialog">
          <IconMdiClose />
        </button>
      </header>
      <section class="dialog-content" v-if="open">
        <slot></slot>
      </section>
    </dialog>
  </Teleport>
</template>

<style scoped>
.modal-dialog {
  margin: var(--modal-dialog-margin);

  color: var(--body-foreground);
  background: var(--background-middle);
  box-shadow: var(--modal-dialog-shadow);
  &::backdrop {
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(var(--pane-blur));
  }

  border-radius: var(--modal-dialog-border-radius);

  width: var(--modal-dialog-width);
  min-width: var(--modal-dialog-min-width);
  max-width: var(--modal-dialog-max-width);
}

.dialog-header {
  position: sticky;
  top: 0;

  background: var(--background-high);
  z-index: calc(var(--z-modal) + 1);

  width: 100%;
  height: calc(var(--space-lg) * 3);

  padding-left: var(--space-lg);
  padding-right: var(--space-lg);

  display: flex;
  justify-content: space-between;
  align-items: center;

  & > h1 {
    font-size: 20px;
    font-weight: 500;
  }
  & > button {
    padding: var(--space-xs);
    border-radius: var(--rounded-full);
    cursor: pointer;

    background: var(--background-low);

    transition: background var(--transition-fast) ease-in-out;

    &:hover {
      background: var(--background-lowest);
    }
  }
}

.dialog-content {
  padding: var(--space-md);
}

dialog:focus {
  outline: none;
}
</style>
