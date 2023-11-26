<template>
  <div id="cell-button-controls">
    <button @click="saveCell" id="cell-save">Save</button>
    <button @click="killCell" id="cell-kill">Kill</button>
  </div>
</template>

<script setup lang="ts">
import simulation from '@/simulation';

function saveCell() {

}

function killCell() {
  simulation.selectedCell.alive = false
}
</script>
