/**
 * Type definitions for messages to/from the Worker.
 */

import type Bot from "@/simulation/bot";

export interface PauseMessage {
  type: "pause";
}
export interface ForwardMessage {
  type: "forward";
}
export interface ClearMessage {
  type: "clear";
}
export interface ResetMessage {
  type: "reset";
}
export interface SetCellMessage {
  type: "setcell";
  cell: Bot;
  x: number;
  y: number;
}
export interface RequestCellMessage {
  type: "getcell";
  x: number;
  y: number;
}
export interface SelectCellMessage {
  type: "selectcell";
  x: number;
  y: number;
}

export type MessageFromMainThread =
  | PauseMessage
  | ForwardMessage
  | ClearMessage
  | ResetMessage
  | SetCellMessage
  | RequestCellMessage
  | SelectCellMessage;

export interface SimulationInfo {
  width: number;
  height: number;
  iterations: number;
  prevIterations: number;
  fps: number;
  isPaused: boolean;
}
export interface UpdateMessage {
  type: "update";
  simulation: SimulationInfo;
  image: ImageBitmap;
  selectedCell: Bot | null;
}
export interface GetCellMessage {
  type: "getcell";
  cell: Bot;
}

export type MessageFromWorker = UpdateMessage | GetCellMessage;
