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
   * Tick offset into this vent's own cycle. Zero for every vent in
   * synchronized mode.
   */
  phase: number;

  active: number;
  cooldown: number;

  /**
   * Diagonal heading, ±1 on each axis. Scaled by the drift speed knob so the
   * knob stays live rather than baked in at spawn.
   */
  vx: number;
  vy: number;
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
   * Only used in "jittered" mode.
   */
  jitter = 0.5;

  timing: VentTiming = "independent";

  /**
   * Whether vents wander the map, bouncing off its edges.
   */
  drifting = false;

  /**
   * Tiles a drifting vent covers per tick, on each axis.
   */
  driftSpeed = 0.1;

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
    { prop: "drifting", label: "Drifting" },
    { prop: "driftSpeed", label: "Drift speed", min: 0, max: 2, step: 0.01 },
  ];

  actions: UIAction[] = [
    {
      title: "Respawn vents",
      // Vent placement and timing are drawn once at init, so the knobs above
      // only take effect on a respawn.
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

    const vary = (base: number) =>
      this.timing === "jittered"
        ? Math.max(
            1,
            Math.round(base * (1 + (Math.random() * 2 - 1) * this.jitter))
          )
        : base;

    this.vents = Array.from({ length: this.ventCount }, () => {
      const active = vary(this.activeTicks);
      const cooldown = vary(this.cooldownTicks);

      return {
        x: Math.floor(Math.random() * world.width),
        y: Math.floor(Math.random() * world.height),
        // Without an offset every vent would erupt on the same tick even in
        // "independent" mode, since they all read the same world clock.
        phase:
          this.timing === "synchronized"
            ? 0
            : Math.floor(Math.random() * (active + cooldown)),
        active,
        cooldown,
        vx: Math.random() < 0.5 ? -1 : 1,
        vy: Math.random() < 0.5 ? -1 : 1,
      };
    });
  }

  /**
   * Advances a vent one step, reflecting it off the edges of the map.
   */
  drift(vent: Vent, world: World) {
    // Vents restored from a save written before drift existed carry no heading.
    vent.vx ||= 1;
    vent.vy ||= 1;

    const step = (
      position: number,
      heading: number,
      limit: number
    ): [number, number] => {
      const next = position + heading * this.driftSpeed;

      if (next < 0) return [-next, -heading];
      if (next > limit) return [2 * limit - next, -heading];

      return [next, heading];
    };

    [vent.x, vent.vx] = step(vent.x, vent.vx, world.width - 1);
    [vent.y, vent.vy] = step(vent.y, vent.vy, world.height - 1);
  }

  clearLayer() {
    const layer = this.world?.layers.minerals as
      GridLayer<Float32Array> | undefined;

    layer?.data.fill(0);
  }

  isErupting(vent: Vent, tick: number): boolean {
    return (tick + vent.phase) % (vent.active + vent.cooldown) < vent.active;
  }

  /**
   * Deposits around one vent, over the diamond of tiles within `ventRadius`
   * Manhattan steps.
   */
  erupt(layer: GridLayer<Float32Array>, vent: Vent) {
    const r = this.ventRadius;
    const centerX = Math.round(vent.x);
    const centerY = Math.round(vent.y);

    for (let dx = -r; dx <= r; dx++) {
      const x = centerX + dx;
      if (x < 0 || x >= layer.width) continue;

      const span = r - Math.abs(dx);

      for (let dy = -span; dy <= span; dy++) {
        const y = centerY + dy;
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
      if (this.drifting) this.drift(vent, world);
      if (this.isErupting(vent, world.tick)) this.erupt(layer, vent);
    }
  }
}
