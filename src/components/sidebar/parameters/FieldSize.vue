<script setup lang="ts">
import useFieldSize from "@/composables/fieldSize";
import m from "@/i18n/message";

const { fieldSize, setFieldSize } = useFieldSize();

const width = ref(fieldSize.value[0]);
const height = ref(fieldSize.value[1]);
</script>

<template>
  <FieldSet :title="m('config.mapSize')">
    <div id="field-size-inputs">
      <NumberInput v-model="width" :minimum="1" :step="1" />
      <span>x</span>
      <NumberInput v-model="height" :minimum="1" :step="1" />
      <span>{{ m("config.mapSizeCells") }}</span>
    </div>
    <RoundedButton @click="setFieldSize(width, height)">{{
      m("config.mapResizeAction")
    }}</RoundedButton>
  </FieldSet>
</template>

<style scoped>
#field-size-inputs {
  display: flex;
  align-items: center;
  gap: var(--space-sm);

  margin-bottom: var(--space-sm);
}
</style>
