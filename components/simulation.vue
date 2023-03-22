<template>
  <canvas
    ref="canvas"
    class="rounded-sm drop-shadow-md"
    style="image-rendering: pixelated"
    :width="width"
    :height="height"
  />
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'CellSimulationComponent',

  data: () => ({
    ctx: {} as CanvasRenderingContext2D
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
    const canvas = this.$refs.canvas as HTMLCanvasElement
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    this.render()

    setInterval(this.tick)
    setInterval(this.render, 50)
  },

  methods: {
    tick () {
      if (!this.$store.getters.isPaused) {
        this.$store.commit('updateSimulation')
      }
    },

    render () {
      this.ctx.fillStyle = 'black'
      const { width, height } = this.$refs.canvas as HTMLCanvasElement
      this.ctx.fillRect(0, 0, width, height)

      for (let x = 0; x < this.width; x++) {
        for (let y = 0; y < this.height; y++) {
          const bot = this.$store.getters.getCellAt(y, x)
          this.ctx.fillStyle = `rgb(${bot.color.r}, ${bot.color.g}, ${bot.color.b})`
          this.ctx.fillRect(x, y, 1, 1)
        }
      }
    }
  }
})
</script>
