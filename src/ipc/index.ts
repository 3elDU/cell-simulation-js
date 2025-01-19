// Worker is created here.

import Bot from "@/simulation/bot";
import type { MessageFromMainThread, MessageFromWorker } from "@/worker/ipc";
import { render } from "./render";

let _worker: Worker | undefined;

let simulationStore: ReturnType<typeof useSimulationStore>;
let selectedCellStore: ReturnType<typeof useSelectedCellStore>;

function initWorker() {
  console.log("initializing worker");
  simulationStore = useSimulationStore();
  selectedCellStore = useSelectedCellStore();

  _worker = new Worker(new URL("@/worker/index.ts", import.meta.url), {
    type: "module",
  });
  _worker.addEventListener("message", onMessage);
}

// Handle messages from the worker
function onMessage(msg: MessageEvent<MessageFromWorker>) {
  if (msg.data.type === "update") {
    if (msg.data.selectedCell === null || msg.data.selectedCell.empty) {
      selectedCellStore.selected = false;
    } else {
      const cell = Bot.fromJSON(msg.data.selectedCell);
      selectedCellStore.value = cell;
      selectedCellStore.selected = true;
    }

    simulationStore.$patch(msg.data.simulation);
    render(msg.data.image);
  }
}

export function worker(): Worker {
  if (_worker === undefined) {
    initWorker();
  }

  return _worker!;
}

// Utility function to send anything to a worker.
export function sendToWorker(message: MessageFromMainThread) {
  worker().postMessage(message);
}

export async function getCell(x: number, y: number): Promise<Bot> {
  return new Promise((resolve) => {
    worker().addEventListener(
      "message",
      (message: MessageEvent<MessageFromWorker>) => {
        if (message.data.type === "getcell") {
          resolve(message.data.cell);
        }
      },
      { once: true }
    );
    sendToWorker({ type: "getcell", x, y });
  });
}
