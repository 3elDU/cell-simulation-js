import type { Renderer } from "@/renderers";
import { renderRegistry } from "@/renderers/registry";
import { Pane } from "tweakpane";

export class RenderersPane extends Pane {
  /**
   * Contains instances of all registered renderers
   */
  renderers: Renderer[];

  constructor(container: HTMLElement) {
    super({
      container,
      title: "Renderers",
    });

    this.renderers = [];

    for (const renderer of renderRegistry.list()) {
      const instance = renderer.create();

      this.renderers.push(instance);

      const folder = this.addFolder({
        expanded: false,
        title: instance.title,
      });

      // Add description as readonly binding with no title
      folder.addBinding(instance, "description", {
        readonly: true,
        label: undefined,
        multiline: true,
      });

      folder.addBinding(instance, "enabled", {
        title: "Enabled",
      });

      // Add per-renderer config
      for (const binding of instance.config ?? []) {
        const target = (binding.object ?? instance) as Record<string, unknown>;
        folder.addBinding(target, binding.prop, binding);
      }
    }
  }
}
