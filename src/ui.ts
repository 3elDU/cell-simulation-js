import type { BindingParams } from "tweakpane";

/**
 * This interface allows any object to be described inside UI
 */
export interface UIDescription {
  title: string;
  description: string;
}

export type ConfigItem = {
  prop: string;
} & BindingParams;

export type ConfigSchema = ConfigItem[];
