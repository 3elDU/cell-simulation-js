import type { Registry } from "@/registry";
import type { System } from "@/systems";
import type { World } from "@/world";
import { Pane } from "tweakpane";

export class SystemsPane extends Pane {
  constructor(container: HTMLElement, world: World) {
    super({
      title: "Systems",
      container,
    });

    for (const system of world.systems) {
      const folder = this.addFolder({ title: system.title, expanded: false });
      folder.addBinding(system, "enabled", { label: "Enabled" });

      // Add per-system configuration
      for (const binding of system.config ?? []) {
        folder.addBinding(system, binding.prop as keyof System, binding);
      }
    }
  }
}
