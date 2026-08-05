import { Pane } from "tweakpane";
import type { FolderApi } from "tweakpane";
import {
  deleteDish,
  listDishes,
  randomDishName,
  type DishMeta,
} from "@/persistence";

export interface NewDishParams {
  name: string;
  width: number;
  height: number;
}

/**
 * The pane shown before a world exists: name and size for a new dish, plus
 * every dish already saved.
 */
export class DishesPane extends Pane {
  params: NewDishParams = {
    name: randomDishName(),
    width: Math.floor(Math.random() * 184 + 72),
    height: Math.floor(Math.random() * 184 + 72),
  };

  private saved: FolderApi | undefined;

  constructor(
    container: HTMLElement,
    private onNew: (params: NewDishParams) => void,
    private onOpen: (dish: DishMeta) => void
  ) {
    super({ title: "Petri Dishes", container });

    this.addBinding(this.params, "name", { label: "Name" });
    this.addButton({ title: "Reroll name" }).on("click", () => {
      this.params.name = randomDishName();
      this.refresh();
    });

    this.addBinding(this.params, "width", { step: 1 });
    this.addBinding(this.params, "height", { step: 1 });

    this.addButton({ title: "New" }).on("click", () =>
      this.onNew({ ...this.params })
    );

    void this.refreshList();
  }

  /**
   * Rebuilds the saved-dish list from the database.
   *
   * Torn down and recreated rather than diffed — the list is a handful of
   * entries and gets rebuilt only when one is added, opened or deleted.
   */
  async refreshList() {
    const dishes = await listDishes();

    this.saved?.dispose();
    this.saved = this.addFolder({
      title: `Saved (${dishes.length})`,
      expanded: true,
    });

    if (dishes.length === 0) {
      this.saved.addBinding({ info: "No saved dishes yet" }, "info", {
        readonly: true,
        label: undefined,
      });
      return;
    }

    for (const dish of dishes) {
      const folder = this.saved.addFolder({
        title: dish.name,
        expanded: false,
      });

      folder.addBinding(
        {
          info: [
            `${dish.width}x${dish.height}`,
            `tick ${dish.tick}`,
            `${dish.cells} cells`,
            new Date(dish.savedAt).toLocaleString(),
          ].join("\n"),
        },
        "info",
        { readonly: true, label: undefined, multiline: true, rows: 4 }
      );

      folder.addButton({ title: "Open" }).on("click", () => this.onOpen(dish));

      folder.addButton({ title: "Delete" }).on("click", async () => {
        await deleteDish(dish.id);
        await this.refreshList();
      });
    }
  }

  /**
   * Called when returning to this pane, so the name of the next dish isn't the
   * name of the one just closed.
   */
  rerollName() {
    this.params.name = randomDishName();
    this.refresh();
  }
}
