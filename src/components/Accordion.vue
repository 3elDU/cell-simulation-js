<template>
  <div class="mb-4">
    <div class="border-l-[0.4rem] border-l-neutral-600 select-none cursor-pointer
      active:bg-neutral-700 transition linear duration-50" @click="openAccordion()">
      <IconMdiMenuDown v-if="opened" />
      <IconMdiMenuRight v-else />
      <span>{{ name }}</span>
    </div>

    <div id="content" class="mt-2" :class="opened ? 'opened' : ''">
      <slot v-if="opened" />
    </div>
  </div>
</template>

<script setup lang=ts>
import { ref } from 'vue';

const { initialState } = defineProps<{
  name: string
  initialState: boolean
}>();

const opened = ref(initialState);

function openAccordion() {
  opened.value = !opened.value;
}
</script>

<style scoped>
#content {
  position: relative;
  transition: opacity 200ms ease-in-out, top 200ms ease-in-out;
  opacity: 0;
  top: -0.5rem;
}

#content.opened {
  opacity: 1.0;
  top: 0rem;
}
</style>
