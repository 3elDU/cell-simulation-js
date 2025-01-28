import Bot from "@/simulation/bot";
import { CellSimulation } from "@/simulation/simulation";
import type {
  MessageFromMainThread,
  MessageFromWorker,
  UpdateMessage,
} from "./ipc";
import Renderer from "./render";

let simulation = new CellSimulation(64, 64);
const renderer = new Renderer(64, 64);

const sendInterval = 50;
const interruptInterval = 200;
let previousSend = performance.now();
let previousInterrupt = performance.now();

// This is the core function that runs when the simulation is not paused.
// It updates the simulation, sends the data back to the main thread N times a second, and interrupts itself occasionally to allow other event handlers to execute.
function process() {
  while (true) {
    if (simulation.isPaused) {
      return;
    }

    simulation.update();

    // Send data to main thread every 50ms
    if (performance.now() - previousSend >= sendInterval) {
      previousSend = performance.now();
      send();
    }

    // Interrupt to receive events from the main thread
    if (performance.now() - previousInterrupt >= interruptInterval) {
      previousInterrupt = performance.now();
      setTimeout(process, 0);
      return;
    }
  }
}

// Render the simulation and transfer the bitmap to the main thread, along with other metadata.
function send() {
  renderer.render(simulation);
  const bitmap = renderer.canvas.transferToImageBitmap();

  postMessage(
    {
      type: "update",
      simulation: {
        width: simulation.width,
        height: simulation.height,
        fps: simulation.fps,
        isPaused: simulation.isPaused,
        iterations: simulation.iterations,
        prevIterations: simulation.prevIterations,
      },
      image: bitmap,
      selectedCell: simulation.selectedCell,
    } as UpdateMessage,
    [bitmap]
  );
}

addEventListener("message", (message) => {
  let msg: MessageFromMainThread = message.data;

  switch (msg.type) {
    case "pause":
      simulation.togglePause();
      if (!simulation.isPaused) {
        process();
      }
      break;
    case "clear":
      simulation.clearMap();
      break;
    case "forward":
      simulation.update();
      break;
    case "reset":
      simulation.generateMap();
      break;
    case "setcell":
      let cell = Bot.fromJSON(msg.cell);
      simulation.setCellAt(msg.x, msg.y, cell);
      break;
    case "getcell":
      postMessage({
        type: "getcell",
        cell: simulation.getCellAt(msg.x, msg.y),
      } satisfies MessageFromWorker);
    case "selectcell":
      simulation.selectCell(msg.x, msg.y);
  }

  // Send simulation back to the main thread after handling the message
  send();
});

// Send data to the main thread immediately after initializing
send();
