import type { UIDescription } from "./ui";

/**
 * Definition exposes a constructor for the given object,
 * along with title and description shown in the UI.
 *
 * Every object can be referenced by its unique ID
 */
export interface Definition<T> extends UIDescription {
  id: string;

  create(): T;
}

export class Registry<T> {
  private defs = new Map<string, Definition<T>>();

  register(def: Definition<T>) {
    this.defs.set(def.id, def);
  }

  get(id: string) {
    return this.defs.get(id);
  }

  list() {
    return this.defs.values();
  }
}
