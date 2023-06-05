<template>
  <div id="canvas-container" @wheel="addZoom($event.deltaY / 50)">
    <canvas ref="canvas" id="canvas" width="64" height="64" @click="selectCell($event)"
      :style="{ width: `${canvasSize}px`, height: `${canvasSize}px` }"></canvas>
  </div>

  <div v-if="isSelecting" class="absolute top-0 right-0 flex gap-2 m-2">
    <div class="bg-[#111111] border-2 border-[#444444] rounded-md px-2">
      <Icon name="ic:info" class="mr-1"></Icon><span>Click where to place a cell</span>
    </div>
    <button @click="cancelSelection()">Cancel</button>
  </div>
</template>

<script setup lang="ts">
import { forceRender, subscribe } from '~/src/render';
import simulation from '~/src/simulation';
const { isSelecting, setIsSelecting } = useIsSelecting();
const { selectedCell, setSelectedCell } = useSelectedCell();

const canvas: Ref<HTMLCanvasElement> = ref();
const canvasSize: Ref<number> = ref(8 * 64);
let ctx: CanvasRenderingContext2D;

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  addZoom(0)

  subscribe(render);
})

let zoom = 8;
function addZoom(amount: number) {
  zoom += amount;

  if (zoom < 0.5) {
    zoom = 0.5;
  } else if (zoom > 20) {
    zoom = 20;
  }

  canvasSize.value = Math.round(64 * zoom);
}

function selectCell(event: MouseEvent) {
  const rect = canvas.value.getBoundingClientRect();
  const scaleX = canvas.value.width / rect.width;
  const scaleY = canvas.value.height / rect.height;
  const x = Math.trunc((event.clientX - rect.left) * scaleX);
  const y = Math.trunc((event.clientY - rect.top) * scaleY);

  if (isSelecting.value) {
    simulation.setCellAt(x, y, selectedCell.value);
    setIsSelecting(false);
  } else {
    setSelectedCell(simulation.getCellAt(x, y));
    forceRender();
  }
}

function cancelSelection() {
  setSelectedCell(null);
  setIsSelecting(false);
}

const imageData = new ImageData(simulation.width, simulation.height);
function render() {
  for (let x = 0; x < simulation.width; x++) {
    for (let y = 0; y < simulation.height; y++) {
      const pixel = y * simulation.width + x;

      const bot = simulation.getCellAt(x, y);
      let r = 0, g = 0, b = 0;

      if (bot.alive) {
        r = bot.color.r, g = bot.color.g, b = bot.color.b;
      } else if (!bot.alive && !bot.empty) {
        r = 100, g = 100, b = 100;
      }

      imageData.data[pixel * 4] = r;
      imageData.data[pixel * 4 + 1] = g;
      imageData.data[pixel * 4 + 2] = b;
      imageData.data[pixel * 4 + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}
</script>

<style scoped>
#canvas-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
  background-color: #101010;
}

canvas {
  background-color: black;
  image-rendering: pixelated;

  border-radius: calc(100% / 100);
  border: 1.5px solid #222222;
}
</style>
