import { extractActions } from "@/ui";
import type { World } from "@/world";
import { Pane } from "tweakpane";

export class SystemsPane extends Pane {
  constructor(
    container: HTMLElement,
    world: World,
    onActionExecuted: () => void
  ) {
    super({
      title: "Systems",
      container,
    });

    for (const system of world.systems) {
      const folder = this.addFolder({ title: system.title, expanded: false });
      folder.addBinding(system, "enabled", { label: "Enabled" });

      folder.addBinding(system, "description", {
        readonly: true,
        label: undefined,
        multiline: true,
      });

      for (const binding of system.config ?? []) {
        const target = (binding.object ?? system) as Record<string, unknown>;
        folder.addBinding(target, binding.prop, binding);
      }

      for (const action of extractActions(system)) {
        folder
          .addButton({
            title: action.title,
          })
          .on("click", () => {
            action.callback();
            onActionExecuted();
          });
      }
    }
  }
}
