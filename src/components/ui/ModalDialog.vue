<script setup lang="ts">
defineSlots<{
  default(): unknown;
}>();

const open = defineModel<boolean>({ default: false });
const dialog: Ref<HTMLDialogElement | undefined> = ref();

watch(open, (open) => {
  if (dialog.value === undefined) {
    return;
  }

  if (open) {
    dialog.value.showModal();
  } else {
    dialog.value.close();
  }
});
</script>

<template>
  <dialog ref="dialog" class="relative">
    <button @click="open = false" class="absolute top-2 right-2">
      <IconMdiClose />
    </button>

    <slot />
  </dialog>
</template>

<style scoped>
dialog {
  border-radius: 10px;

  background-color: #efefef;
  color: black;

  padding: 0.7rem;

  min-width: 400px;
  width: 30%;
  max-width: 600px;

  min-height: 100px;

  box-shadow: 0px 0px 24px rgba(0, 0, 0, 0.6);
}

@media (prefers-color-scheme: dark) {
  dialog {
    border: 1px solid #3f3f3f;
    background: #222222;
    color: white;
    box-shadow: none;
  }
}

@media (max-width: 600px) {
  dialog {
    min-width: 100vw;

    border: 0;
    border-top: 2px solid #3f3f3f;
    border-bottom: 2px solid #3f3f3f;
    border-radius: 0;
  }
}

dialog:focus {
  outline: none;
}

dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
}
</style>
