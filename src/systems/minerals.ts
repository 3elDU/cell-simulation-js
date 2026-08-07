import type { System } from ".";
import { BaseSystem } from "./base";
import type { World } from "@/world";
import { gridGet, gridSet, LAYER_MAX, type GridLayer } from "@/grid";
import type { ConfigSchema, UIAction, UIActionable } from "@/ui";

export type VentTiming = "independent" | "jittered" | "synchronized";

interface Vent {
  x: number;
  y: number;

  /**
   * Where this vent starts in its own cycle, as a fraction of one. Zero for
   * every vent in synchronized mode.
   *
   * A fraction rather than a tick count, so a vent keeps its place in the
   * cycle when the configured durations change under it.
   */
  phase: number;

  /** Multipliers on the configured durations. One when not jittered. */
  activeScale: number;
  cooldownScale: number;
}

/**
 * Fills the minerals layer from a handful of vents.
 *
 * A vent deposits into a diamond around itself while it is erupting, then goes
 * quiet for a while. Deposits accumulate, so the layer is a *stock* cells draw
 * down rather than a flow they sip — a patch stays worth living on for a while
 * after its vent shuts off, and stops being worth it eventually.
 */
export class MineralsSystem extends BaseSystem implements System, UIActionable {
  id = "minerals";
  title = "Minerals";
  description = `Fills the minerals layer from
erupting vents.

Vents deposit in a diamond and
pulse on and off.`;
  enabled = true;

  ventCount = 6;
  ventRadius = 12;

  /**
   * Amount deposited per tick at the very center of an erupting vent. Falls
   * off linearly to zero at the edge of the diamond.
   */
  ventStrength = 4;

  activeTicks = 200;
  cooldownTicks = 400;

  /**
   * How far per-vent durations may stray from the values above, as a fraction.
   * Only used in "jittered" mode, and only drawn at spawn.
   */
  jitter = 0.5;

  timing: VentTiming = "independent";

  config: ConfigSchema = [
    {
      prop: "timing",
      label: "Timing",
      options: {
        "Independent phase": "independent",
        "Jittered durations": "jittered",
        Synchronized: "synchronized",
      },
    },
    { prop: "ventCount", label: "Vents", min: 0, max: 64, step: 1 },
    { prop: "ventRadius", label: "Radius", min: 1, max: 64, step: 1 },
    { prop: "ventStrength", label: "Strength", min: 0, max: 32, step: 0.1 },
    { prop: "activeTicks", label: "Active ticks", min: 1, step: 1 },
    { prop: "cooldownTicks", label: "Cooldown ticks", min: 1, step: 1 },
    { prop: "jitter", label: "Jitter", min: 0, max: 1, step: 0.01 },
  ];

  actions: UIAction[] = [
    {
      title: "Respawn vents",
      // Placement, phase and jitter are drawn once, so those knobs only take
      // effect on a respawn. The durations apply live.
      callback: () => this.spawnVents(),
    },
    {
      title: "Clear layer",
      callback: () => this.clearLayer(),
    },
  ];

  vents: Vent[] = [];
  world: World | undefined;

  onInit(world: World): void {
    this.world = world;

    if (!world.layers.minerals) {
      world.layers.minerals = {
        width: world.width,
        height: world.height,
        data: new Float32Array(world.width * world.height),
      };
    }

    this.spawnVents();
  }

  spawnVents() {
    const world = this.world;
    if (!world) return;

    const vary = () =>
      this.timing === "jittered"
        ? Math.max(0.01, 1 + (Math.random() * 2 - 1) * this.jitter)
        : 1;

    this.vents = Array.from({ length: this.ventCount }, () => ({
      x: Math.floor(Math.random() * world.width),
      y: Math.floor(Math.random() * world.height),
      // Without an offset every vent would erupt on the same tick even in
      // "independent" mode, since they all read the same world clock.
      phase: this.timing === "synchronized" ? 0 : Math.random(),
      activeScale: vary(),
      cooldownScale: vary(),
    }));
  }

  clearLayer() {
    const layer = this.world?.layers.minerals as
      GridLayer<Float32Array> | undefined;

    layer?.data.fill(0);
  }

  /**
   * One vent's cycle in ticks, read from the live config every call so moving
   * the duration sliders retimes vents that already exist.
   */
  cycle(vent: Vent): { active: number; period: number } {
    // A vent restored from a save written before the scales existed has none.
    const ticks = (base: number, scale: number) =>
      Math.max(1, Math.round(base * (scale || 1)));

    const active = ticks(this.activeTicks, vent.activeScale);

    return {
      active,
      period: active + ticks(this.cooldownTicks, vent.cooldownScale),
    };
  }

  isErupting(vent: Vent, tick: number): boolean {
    const { active, period } = this.cycle(vent);

    return (tick + Math.round(vent.phase * period)) % period < active;
  }

  /**
   * Deposits around one vent, over the diamond of tiles within `ventRadius`
   * Manhattan steps.
   */
  erupt(layer: GridLayer<Float32Array>, vent: Vent) {
    const r = this.ventRadius;

    for (let dx = -r; dx <= r; dx++) {
      const x = vent.x + dx;
      if (x < 0 || x >= layer.width) continue;

      const span = r - Math.abs(dx);

      for (let dy = -span; dy <= span; dy++) {
        const y = vent.y + dy;
        if (y < 0 || y >= layer.height) continue;

        const distance = Math.abs(dx) + Math.abs(dy);
        const amount = this.ventStrength * (1 - distance / r);
        const current = gridGet(layer, { x, y }) ?? 0;

        gridSet(layer, { x, y }, Math.min(current + amount, LAYER_MAX));
      }
    }
  }

  onTick(world: World): void {
    const layer = world.layers.minerals as GridLayer<Float32Array> | undefined;
    if (!layer) return;

    for (const vent of this.vents) {
      if (this.isErupting(vent, world.tick)) this.erupt(layer, vent);
    }
  }
}
