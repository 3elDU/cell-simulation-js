<script setup lang="ts">
import { ref } from "vue";

const { name, initialState } = defineProps({
  name: {
    type: String,
  },
  initialState: {
    type: Boolean,
    default: false,
  },
});

const opened = ref(initialState);

function openAccordion() {
  opened.value = !opened.value;
}
</script>

<template>
  <div class="accordion-container" :open="opened">
    <div class="accordion-title" @click="openAccordion()">
      <IconMdiMenuDown v-if="opened" />
      <IconMdiMenuRight v-else />
      <span>{{ name }}</span>
    </div>

    <div class="accordion-content">
      <slot v-if="opened" />
    </div>
  </div>
</template>

<style scoped>
.accordion-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.accordion-title {
  user-select: none;
  -webkit-user-select: none;
  cursor: pointer;

  border-left: 6px solid #aaaaaa;

  display: flex;
  gap: 0.5rem;
  align-items: center;

  transition: background-color ease-in-out 50ms;
}

.accordion-title:active {
  background: #aaaaaa;
}

@media (prefers-color-scheme: dark) {
  .accordion-title:active {
    background: #404040;
  }
  .accordion-title {
    border-left-color: #424242;
  }
}
</style>
