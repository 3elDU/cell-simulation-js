<template>
  <div class="flex justify-center items-center w-full bg-neutral-950 touch-none" @wheel="handleMouseWheel($event)"
    @pointerdown="handlePointerDown($event)" @pointerup="handlePointerUp($event)" @pointermove="handlePointerMove($event)"
    :style="{
      cursor: movingCanvas ? 'move' : 'default'
    }">

    <canvas ref="canvas" width="64" height="64"
      class="relative border-2 border-neutral-800 left-0 transition-[left] duration-300 ease-in-out"
      @click="handleClick($event)" :style="{
        width: `${canvasSize}px`,
        height: `${canvasSize}px`,
        transform: `translate(${canvasX}px, ${canvasY}px)`,
      }" :class="sidebarOpened ? 'sidebar-opened' : ''">
    </canvas>
  </div>

  <div v-if="
    /* Do not draw outline when user is selecting where to paste a saved cell
      ( in that case outline would be displayed in where the cell was saved,
      but the actuall cell hasn't been placed into the world yet )
    */
    !isSelecting
    // Draw outline only when there is a selected sell
    && (selectedCell instanceof Bot)" class="abcdef absolute border-2 rounded-[15%] border-white pointer-events-none"
    :style="{ width: indicatorSize, height: indicatorSize, translate: indicatorPosition }">

  </div>
</template>
<style scoped>
canvas {
  image-rendering: pixelated;
  border-radius: calc(100% / 100);
}

#canvas {
  position: relative;
  background-color: black;
  image-rendering: pixelated;

  border: 1.5px solid #222222;

  transition: left 300ms ease-in-out;
  left: 0px;
}

@media (min-width: 600px) {
  .sidebar-opened {
    left: 150px;
  }
}
</style>

<script setup lang="ts">
import clamp from '@/clamp';
import { forceRender } from '@/render';
import simulation from '@/simulation';
import { InputMode } from '@/types';
import Bot from '@/bot';

const { isSelecting, setIsSelecting } = useIsSelecting();
const { inputMode, setInputMode } = useInputMode();
const { selectedCell, setSelectedCell } = useSelectedCell();
const { isOpened: sidebarOpened } = useSidebar();

const canvas: Ref<HTMLCanvasElement> = ref() as Ref<HTMLCanvasElement>;
const canvasSize: Ref<number> = ref(8 * 64);
let ctx: CanvasRenderingContext2D;
const indicatorSize = ref('0px');
const indicatorPosition = ref('0 0');

let movingCanvas = ref(false);
const canvasX = ref(0);
const canvasY = ref(0);

onMounted(() => {
  ctx = canvas.value.getContext('2d') as CanvasRenderingContext2D
  addZoom(0)

  requestAnimationFrame(render);
  requestAnimationFrame(renderIndicator);
})

let zoom = 8;
const minZoom = 1;
function addZoom(amount: number) {
  zoom += amount / canvas.value.width;
  zoom = clamp(zoom, minZoom, Infinity);
  canvasSize.value = Math.round(64 * zoom);
}

// With pure css `width` and `height`, canvas 'zooms' from the center.
// This is fine when the canvas stays in one spot, and doesn't move.
// But, when we are able to move the canvas, this makes zooming very unintuitive:
// User expects for the canvas to zoom inside the point the cursor points at,
// but it would still zoom from the center.
//
// This function solves the issue: it takes a mouse event, zoom amount,
// and moves the canvas away from the cursor, thus making everything look like
// we're zooming inside the point we're pointing at.
function moveOrigin(event: MouseEvent, zoomDelta: number) {
  const rect = canvas.value.getBoundingClientRect();

  const canvasCenterX = (rect.right + rect.left) / 2;
  const canvasCenterY = (rect.top + rect.bottom) / 2;
  const canvasScale = canvas.value.width / rect.width;

  // Translate the canvas to opposite direction from the cursor
  const dx = (canvasCenterX - event.clientX) * zoomDelta * canvasScale / canvas.value.width;
  const dy = (canvasCenterY - event.clientY) * zoomDelta * canvasScale / canvas.value.height;

  canvasX.value += dx;
  canvasY.value += dy;
}

// Translates mouse coordinates to local simulation coordinates
function getClickCoordinates(event: MouseEvent) {
  const rect = canvas.value.getBoundingClientRect();
  const scaleX = canvas.value.width / rect.width;
  const scaleY = canvas.value.height / rect.height;
  const x = Math.trunc((event.clientX - rect.left) * scaleX);
  const y = Math.trunc((event.clientY - rect.top) * scaleY);

  return { x, y }
}

function handleClick(event: MouseEvent) {
  const { x, y } = getClickCoordinates(event);

  switch (inputMode.value) {
    case InputMode.SelectCell: {
      if (isSelecting.value) {
        simulation.setCellAt(x, y, selectedCell.value as Bot);
        setIsSelecting(false);
      } else {
        setSelectedCell(simulation.getCellAt(x, y));
        forceRender();
      }
    }
  }
}

function handleMouseWheel(event: WheelEvent) {
  const zoomDelta = (zoom * 1.1 - zoom) * event.deltaY;
  addZoom(zoomDelta);
  moveOrigin(event, zoomDelta);
}


// Keep a list of active touch points on the screen.
// This is for pinch to zoom mechanic.
const activeTouches: PointerEvent[] = [];
let previousDistance = -1;
function removeTouch(event: PointerEvent) {
  const index = activeTouches.findIndex(
    (cachedEvent) => cachedEvent.pointerId === event.pointerId
  );
  activeTouches.splice(index, 1);
}

function handlePointerDown(event: PointerEvent) {
  // If it is a touch event, add it to list of active touch points
  if (inputMode.value == InputMode.MoveCanvas) {
    if (event.pointerType == "touch") {
      activeTouches.push(event);
    }

    movingCanvas.value = true;
  }

  event.preventDefault();
}

function handlePointerUp(event: PointerEvent) {
  if (event.pointerType == "touch") {
    removeTouch(event);
    if (activeTouches.length < 2) {
      previousDistance = -1;
    }
  }

  movingCanvas.value = false;
  event.preventDefault();
}

function handlePointerMove(event: PointerEvent) {
  // Find this event in the cache and update its record with this event
  const index = activeTouches.findIndex(
    (cachedEv) => cachedEv.pointerId === event.pointerId
  );
  activeTouches[index] = event;

  // If two pointers are down, check for pinch gesture
  if (activeTouches.length === 2) {
    // Calculate distance between two points on the screen
    const dx = activeTouches[1].clientX - activeTouches[0].clientX;
    const dy = activeTouches[1].clientY - activeTouches[0].clientY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const zoomAmount = (distance - previousDistance) * (zoom * 1.1 - zoom);
    if (previousDistance > 0) {
      addZoom(zoomAmount);
      moveOrigin(event, zoomAmount);
    }

    // Save the distance for the next move event
    previousDistance = distance;
  }

  if (movingCanvas.value) {
    // If there are multiple touch points active, divide movement distance by their amount
    if (activeTouches.length > 1) {
      canvasX.value += event.movementX / activeTouches.length;
      canvasY.value += event.movementY / activeTouches.length;
    } else {
      canvasX.value += event.movementX;
      canvasY.value += event.movementY;
    }
  }
  event.preventDefault();
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
  requestAnimationFrame(render);
}

function renderIndicator() {
  if (selectedCell.value instanceof Bot) {
    // calculate indicator position on the screen
    const rect = canvas.value.getBoundingClientRect();
    const scale = rect.width / simulation.width;
    // How bigger is an outline than an actual cell on the screen
    const extraOutline = scale * (1 / 3);

    const positionX = selectedCell.value.x * scale - extraOutline / 2;
    const positionY = selectedCell.value.y * scale - extraOutline / 2;

    indicatorSize.value = `${scale + extraOutline}px`
    indicatorPosition.value = `${rect.left + positionX}px ${rect.top + positionY}px`
  }

  requestAnimationFrame(renderIndicator);
}
</script>

