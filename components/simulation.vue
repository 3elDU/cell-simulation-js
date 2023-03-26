<template>
  <canvas
    ref="canvas"
    class="rounded-sm drop-shadow-md"
    style="image-rendering: pixelated"
    :width="width"
    :height="height"
    @click="handleClick($event)"
    @mousemove="handleMove($event)"
  />
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'CellSimulationComponent',

  data: () => ({
    ctx: {} as CanvasRenderingContext2D,
    canvas: {} as HTMLCanvasElement
  }),

  computed: {
    width () {
      return this.$store.getters.getSimulationWidth
    },
    height () {
      return this.$store.getters.getSimulationHeight
    }
  },

  mounted () {
    this.canvas = this.$refs.canvas as HTMLCanvasElement
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D
    this.render()

    setInterval(this.tick) // Simulation runs as fast as possible
    setInterval(this.render, 1 / 25) // Rendering at 25FPS
  },

  methods: {
    // converts mouse coordinates to cell coordinates
    convertCoordinates (x: number, y: number): { x: number, y: number } {
      const canvas = this.$refs.canvas as HTMLCanvasElement

      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height

      return {
        x: Math.trunc((x - rect.left) * scaleX),
        y: Math.trunc((y - rect.top) * scaleY)
      }
    },

    handleClick (_event: PointerEvent) {
      /*
      const { x, y } = this.convertCoordinates(event.clientX, event.clientY)
      console.log(`Clicked at ${x}, ${y}`)
      if (this.$store.getters.getCellAt(event.offsetX, event.offsetY).empty) {
        const obj = JSON.parse(prompt() as string)
        const bot = Bot.fromJSON(obj)
        bot.x = event.offsetX
        bot.y = event.offsetY
        this.$store.commit('setCell', bot)
      } else {
        navigator.clipboard.writeText(JSON.stringify(this.$store.getters.getCellAt(event.offsetX, event.offsetY)))
      }
      */
    },

    handleMove (_event: MouseEvent) {
      // this.render()
      // this.ctx.fillStyle = 'rgb(255,255,255)'

      // const { x, y } = this.convertCoordinates(event.clientX, event.clientY)
      // console.log(`move at ${x}, ${y}`)

      // this.ctx.fillRect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize)
    },

    tick () {
      if (!this.$store.getters.isPaused) {
        this.$store.commit('updateSimulation')
      }
    },

    render () {
      this.ctx.fillStyle = 'black'
      const { width, height } = this.canvas
      this.ctx.fillRect(0, 0, width, height)

      for (let x = 0; x < this.width; x++) {
        for (let y = 0; y < this.height; y++) {
          const bot = this.$store.getters.getCellAt(x, y)
          if (bot.empty) {
            continue
          }

          if (bot.alive) {
            this.ctx.fillStyle = `rgb(${bot.color.r}, ${bot.color.g}, ${bot.color.b})`
          } else {
            this.ctx.fillStyle = 'rgb(100, 100, 100)'
          }

          this.ctx.fillRect(x, y, 1, 1)
        }
      }
    }
  }
})
</script>
