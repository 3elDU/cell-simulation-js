import type { Cell } from "@/cell";
import type { World } from "@/world";
import type { System } from ".";
import { BaseSystem } from "./base";
import { getComponent } from "@/components";
import { clampTaintChannel, taint } from "@/components/taint";
import type { ConfigSchema } from "@/ui";

/**
 * Passes a marker color down the family tree, shifting it only where the genome
 * changed — so a shared shade means a shared genome, and a color boundary is a
 * variant that spread.
 *
 * Purely cosmetic: nothing here changes what a cell does.
 */
export class TaintSystem extends BaseSystem implements System {
  id = "taint";
  title = "Taint";
  description = `Children inherit their
parent's color, drifting slightly
on every mutation.`;
  enabled = true;

  /**
   * Largest per-channel shift one mutation can produce, out of 255. Low values
   * keep a lineage recognizable across many variants.
   */
  drift = 12;

  config: ConfigSchema = [
    { prop: "drift", label: "Drift", min: 0, max: 128, step: 1 },
  ];

  private shift(value: number): number {
    return clampTaintChannel(value + (Math.random() * 2 - 1) * this.drift);
  }

  onCellBirth(_world: World, parent: Cell, child: Cell): void {
    const parentTaint = getComponent(parent, "taint");
    if (!parentTaint) return;

    // Identical genome, identical color.
    if (!getComponent(child, "genome")?.mutated) {
      taint(child, { ...parentTaint.color });
      return;
    }

    taint(child, {
      r: this.shift(parentTaint.color.r),
      g: this.shift(parentTaint.color.g),
      b: this.shift(parentTaint.color.b),
    });
  }
}
