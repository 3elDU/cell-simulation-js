import type { System } from "@/systems";
import { extractActions } from "@/ui";
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

      // Add system description as readonly field without a label
      folder.addBinding(system, "description", {
        readonly: true,
        label: undefined,
        multiline: true,
      });

      // Add per-system configuration
      for (const binding of system.config ?? []) {
        folder.addBinding(system, binding.prop as keyof System, binding);
      }

      // Add action buttons
      for (const action of extractActions(system)) {
        folder
          .addButton({
            title: action.title,
          })
          .on("click", action.callback);
      }
    }
  }
}
