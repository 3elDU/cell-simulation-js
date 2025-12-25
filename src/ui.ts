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
} & BindingParams;

export type ConfigSchema = ConfigItem[];
