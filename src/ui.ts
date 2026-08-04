import type { BindingParams } from "tweakpane";

/**
 * This interface allows any object to be described inside UI
 */
export interface UIDescription {
  title: string;
  description: string;
}

export interface UIAction {
  /**
   * Title that will be shown on the button
   */
  title: string;
  /**
   * Function to call when the action is triggered by user
   */
  callback: () => void;
}

/**
 * Exposes buttons into the UI that trigger callbacks on the object
 */
export interface UIActionable {
  actions?: UIAction[];
}

/**
 * Extracts actions from an object
 */
export function extractActions(obj: object): UIAction[] {
  if ("actions" in obj && obj.actions instanceof Array) {
    return obj.actions;
  } else {
    return [];
  }
}

export type ConfigItem = {
  prop: string;

  /**
   * Object the knob reads and writes, when it isn't the system or renderer
   * itself. Lets a system expose a knob per entry of a map it builds at
   * runtime — per-action energy costs, say — without declaring a field for
   * each one up front.
   */
  object?: object;
} & BindingParams;

export type ConfigSchema = ConfigItem[];
