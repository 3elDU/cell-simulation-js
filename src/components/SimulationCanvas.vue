<script setup lang="ts">
import { sendToWorker } from "@/ipc";
import { subscribe } from "@/ipc/render";
import clamp from "@/simulation/clamp";

const simulation = useSimulationStore();
const selectedCell = useSelectedCellStore();
const { isSelecting, setIsSelecting } = useIsSelecting();
const { inputMode } = useInputMode();
const { isOpened: sidebarOpened } = useSidebar();

const canvas: Ref<HTMLCanvasElement> = ref() as Ref<HTMLCanvasElement>;
const canvasSize: Ref<number> = ref(8 * 64);
let ctx: ImageBitmapRenderingContext;
const indicatorSize = ref("0px");
const indicatorPosition = ref("0 0");

let movingCanvas = ref(false);
const canvasX = ref(0);
const canvasY = ref(0);

onMounted(() => {
  ctx = canvas.value.getContext("bitmaprenderer")!;
  addZoom(0);

  subscribe((image) => {
    ctx.transferFromImageBitmap(image);
  });

  requestAnimationFrame(renderIndicator);
});

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
  const dx =
    ((canvasCenterX - event.clientX) * zoomDelta * canvasScale) /
    canvas.value.width;
  const dy =
    ((canvasCenterY - event.clientY) * zoomDelta * canvasScale) /
    canvas.value.height;

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

  return { x, y };
}

async function handleClick(event: MouseEvent) {
  const { x, y } = getClickCoordinates(event);

  switch (inputMode.value) {
    case InputMode.SelectCell: {
      if (isSelecting.value) {
        sendToWorker({
          type: "setcell",
          x,
          y,
          cell: toRaw(selectedCell.value),
        });
        setIsSelecting(false);
      } else {
        sendToWorker({
          type: "selectcell",
          x,
          y,
        });
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

function renderIndicator() {
  if (selectedCell.selected) {
    // calculate indicator position on the screen
    const rect = canvas.value.getBoundingClientRect();
    const scale = rect.width / simulation.width;
    // How bigger is an outline than an actual cell on the screen
    const extraOutline = scale * (1 / 3);

    const positionX = selectedCell.value.x * scale - extraOutline / 2;
    const positionY = selectedCell.value.y * scale - extraOutline / 2;

    indicatorSize.value = `${scale + extraOutline}px`;
    indicatorPosition.value = `${rect.left + positionX}px ${
      rect.top + positionY
    }px`;
  }

  requestAnimationFrame(renderIndicator);
}
</script>

<template>
  <div
    id="canvas-container"
    @wheel="handleMouseWheel($event)"
    @pointerdown="handlePointerDown($event)"
    @pointerup="handlePointerUp($event)"
    @pointermove="handlePointerMove($event)"
    :style="{
      cursor: movingCanvas ? 'move' : 'default',
    }"
  >
    <canvas
      id="canvas"
      ref="canvas"
      width="64"
      height="64"
      @click="handleClick($event)"
      :style="{
        width: `${canvasSize}px`,
        height: `${canvasSize}px`,
        transform: `translate(${canvasX}px, ${canvasY}px)`,
      }"
      :class="{
        'sidebar-opened': sidebarOpened,
      }"
    >
    </canvas>
  </div>

  <div
    v-if="
      /*
        Do not draw outline when user is selecting where to paste a saved cell
        ( in that case outline would be displayed in where the cell was saved,
        but the actuall cell hasn't been placed into the world yet )
      */
      !isSelecting &&
      // Draw outline only when there is a selected sell
      selectedCell.selected
    "
    id="selected-cell-indicator"
    :style="{
      width: indicatorSize,
      height: indicatorSize,
      translate: indicatorPosition,
    }"
  ></div>
</template>

<style scoped>
#canvas-container {
  display: flex;
  justify-content: center;
  align-items: center;

  width: 100%;
  touch-action: none;
  overflow: hidden;
}

#canvas {
  image-rendering: pixelated;
  border-radius: 1%;

  position: relative;
  background-color: black;
  image-rendering: pixelated;

  transition: left 300ms ease-in-out;
  left: 0px;
}

@media (min-width: 600px) {
  #canvas.sidebar-opened {
    left: 150px;
  }
}

@media (prefers-color-scheme: light) {
  #canvas {
    box-shadow: 0 0 var(--space-md) rgb(128, 128, 128);
  }
}
@media (prefers-color-scheme: dark) {
  #canvas {
    border: var(--space-tiny) solid var(--background-middle);
  }
}

#selected-cell-indicator {
  position: absolute;

  border-radius: 25%;
  border: var(--space-tiny) solid white;

  pointer-events: none;
}
</style>
