<template>
  <div
    class="flex flex-auto flex-row h-screen text-white font-sans"
    :style="{ cursor: cursor, userSelect: (canvasDragLock || sidebarResizeDragLock) ? 'none': 'auto' }"
    @mousemove="handleMouseMove($event)"
    @mouseup="handleMouseUp()"
  >
    <div class="flex gap-y-2 z-20 flex-col bg-stone-800 px-4 pt-4" :style="{ maxWidth: sidebarWidth + 'px' }">
      <p class="text-2xl font-bold">
        Hello!
      </p>
      <p>
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Est placeat accusantium aliquam repellendus sed
        voluptates pariatur non ut libero vel, qui iusto soluta temporibus minus repellat molestias iure omnis officia.
      </p>

      <div class="flex">
        <button class="bg-stone-500 rounded-md w-full mr-2" @click="$store.dispatch('generateMap')">
          Generate map
        </button>
        <button class="bg-stone-500 rounded-md w-full" @click="paused = !paused;">
          Pause
        </button>
      </div>
    </div>

    <div
      class="sidebar flex w-3 z-10 justify-center items-center cursor-col-resize
             bg-stone-800 hover:bg-black transition-colors duration-200
             shadow-black shadow-[0px_0px_20px_0px]"
      @mousedown="sidebarResizeDragLock = true"
    >
      <div class="bg-neutral-500 h-8 w-1/2 rounded-full" />
    </div>

    <div
      class="w-full flex justify-center items-center overflow-hidden bg-white dark:bg-stone-900"
      @wheel="zoom($event)"
      @mousedown="canvasDragLock = true"
    >
      <CellSimulationComponent :style="`transform: translate(${canvasX}px, ${canvasY}px) scale(${canvasZoom})`" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import clamp from '~/src/clamp'
import CellSimulationComponent from '~/components/simulation.vue'

export default Vue.extend({
  components: { CellSimulationComponent },
  data () {
    return {
      cursor: 'auto',
      canvasZoom: 4,
      canvasDragLock: false,
      sidebarResizeDragLock: false,
      canvasX: 0,
      canvasY: 0,
      sidebarWidth: 0
    }
  },

  computed: {
    paused: {
      get () {
        return this.$store.getters.isPaused
      },
      set (paused) {
        this.$store.commit('setPaused', paused)
      }
    }
  },

  mounted () {
    this.sidebarWidth = window.innerWidth * 0.2
  },

  methods: {
    zoom (event: WheelEvent) {
      this.canvasZoom -= event.deltaY / 100
      this.canvasZoom = clamp(this.canvasZoom, 1, 64)
    },

    handleMouseMove (event: MouseEvent) {
      if (event.buttons === 0) {
        this.handleMouseUp()
        return
      }

      if (this.canvasDragLock) {
        this.moveCanvas(event)
      } else if (this.sidebarResizeDragLock) {
        this.resizeSidebar(event)
      }
    },

    handleMouseUp () {
      this.canvasDragLock = false
      this.sidebarResizeDragLock = false
      this.cursor = 'auto'
    },

    resizeSidebar (event: MouseEvent) {
      if (!(event.buttons & 1) || !this.sidebarResizeDragLock) {
        return
      }

      this.sidebarWidth += event.movementX
      this.sidebarWidth = clamp(this.sidebarWidth, window.innerWidth * 0.1, window.innerWidth * 0.5)
    },

    moveCanvas (event: MouseEvent) {
      if (!(event.buttons & 0b1) || !this.canvasDragLock) {
        return
      }

      this.cursor = 'grab'

      this.canvasX += event.movementX
      this.canvasY += event.movementY
    }
  }
})
</script>
