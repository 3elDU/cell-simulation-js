<script setup lang="ts">
import m from "@/i18n/message";
import config, { updateConfig } from "@/simulation/config";

const photosynthesisEnergy = ref(config.photosynthesisEnergy);

function onInput() {
  updateConfig({
    ...config,
    photosynthesisEnergy: photosynthesisEnergy.value,
  });
}
</script>

<template>
  <FieldSet
    :title="m('config.photosynthesisEnergyName')"
    :description="m('config.photosynthesisEnergyDescription')"
  >
    <input
      id="photo"
      type="range"
      min="0"
      max="5"
      step="0.01"
      v-model.number="photosynthesisEnergy"
      @input="onInput"
    />
    <label for="photo" style="margin-left: 1rem">{{
      photosynthesisEnergy.toFixed(2)
    }}</label>
  </FieldSet>
</template>
