<script setup lang="ts">
import m from "@/i18n/message";

const props = withDefaults(
  defineProps<{
    minimum?: number;
    maximum?: number;
    step?: number;
    // Measured in rem
    width?: number;
  }>(),
  {
    width: 4,
  }
);

const inputWidth = computed(() => props.width.toString() + "rem");

const model = defineModel<number>({ required: true });
</script>

<template>
  <div class="number-input">
    <input
      type="number"
      :min="minimum"
      :max="maximum"
      :step="step"
      v-model.number="model"
    />

    <div class="steppers" v-if="step !== undefined">
      <button class="step-up" :title="m('ui.stepperUp')" @click="model += step">
        <IconMdiAdd width="12px" height="12px" />
      </button>
      <button
        class="step-down"
        :title="m('ui.stepperDown')"
        @click="model -= step"
      >
        <IconMdiMinus width="12px" height="12px" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.number-input {
  position: relative;

  padding: var(--input-padding);
  border-radius: var(--input-border-radius);
  box-shadow: var(--input-shadow);
  border: var(--input-border);
  background: var(--input-background);
  width: v-bind(inputWidth);

  & > input {
    color: var(--input-foreground);
    appearance: textfield;
    width: 100%;
    background: none;

    &:has(~ .steppers) {
      width: 70%;
    }
  }
}

.steppers {
  position: absolute;
  right: 0;
  top: 0;
  width: 1rem;
  height: 100%;

  display: flex;
  flex-direction: column;
}
.step-up,
.step-down {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;

  border-left: 1px solid var(--input-internal-border-background);
  cursor: pointer;

  outline-offset: 1px;
}
.step-down {
  border-top: 1px solid var(--input-internal-border-background);
}
</style>
