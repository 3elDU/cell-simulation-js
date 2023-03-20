<template>
  <div
    class="flex flex-auto flex-row h-screen text-white font-sans"
    :style="{ cursor: cursor, userSelect: (canvasDragLock || sidebarResizeDragLock) ? 'none': 'auto' }"
    @mousemove="handleMouseMove($event)"
    @mouseup="handleMouseUp()"
  >
    <div class="flex z-20 flex-col bg-stone-800 px-4 pt-4" :style="{ maxWidth: sidebarWidth + 'px' }">
      <p class="text-2xl font-bold">
        Hello!
      </p>
      <p>
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Est placeat accusantium aliquam repellendus sed
        voluptates pariatur non ut libero vel, qui iusto soluta temporibus minus repellat molestias iure omnis officia.
      </p>

      <div class="flex">
        <button class="bg-stone-500 rounded-md w-full mr-2" @click="regenerateMap()">
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
      <canvas ref="field" class="rounded-sm drop-shadow-md" width="64" height="64" style="image-rendering: pixelated" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { CellSimulation } from '~/src/simulation'
import clamp from '~/src/clamp'

export default Vue.extend({
  name: 'IndexPage',
  data () {
    return {
      ctx: {} as CanvasRenderingContext2D,
      simulation: {} as CellSimulation,
      paused: true,
      cursor: 'auto',
      canvasZoom: 4,
      canvasDragLock: false,
      sidebarResizeDragLock: false,
      canvasX: 0,
      canvasY: 0,
      sidebarWidth: 0
    }
  },
  mounted () {
    const canvas: HTMLCanvasElement = this.$refs.field as HTMLCanvasElement
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D

    this.sidebarWidth = window.innerWidth * 0.2

    this.simulation = new CellSimulation(64, 64)
    this.updateCanvasStyle()
    this.render()

    setInterval(() => {
      if (!this.paused) {
        this.simulation.update()
        this.render()
      }
    })
  },

  methods: {
    render () {
      this.ctx.fillStyle = 'black'
      const { width, height } = this.$refs.field as HTMLCanvasElement
      this.ctx.fillRect(0, 0, width, height)

      for (let x = 0; x < this.simulation.width; x++) {
        for (let y = 0; y < this.simulation.height; y++) {
          const bot = this.simulation.field[y][x]
          this.ctx.fillStyle = `rgb(${bot.color.r}, ${bot.color.g}, ${bot.color.b})`
          this.ctx.fillRect(x, y, 1, 1)
        }
      }
    },

    updateCanvasStyle () {
      const canvas = this.$refs.field as HTMLCanvasElement
      canvas.style.transform = `translate(${this.canvasX}px, ${this.canvasY}px) scale(${this.canvasZoom})`
    },

    zoom (event: WheelEvent) {
      this.canvasZoom += event.deltaY / 100
      this.canvasZoom = clamp(this.canvasZoom, 1, 64)
      this.updateCanvasStyle()
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

      this.updateCanvasStyle()
    },

    regenerateMap () {
      this.simulation.generateMap()
      this.render()
    }
  }
})
</script>
