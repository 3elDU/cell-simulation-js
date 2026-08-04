# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A cellular automata simulation: cells are independent agents driven by a genome (a sequence of
instructions/commands like "Photosynthesis", "Walk", "Attack"). Cells accumulate energy and
reproduce with a chance of mutation; natural selection does the rest. The UI lets you inspect and
control individual cells (kill/revive, change direction/instruction, save for later).

There were two earlier, faster (C and Rust) prototypes; this TypeScript+Canvas version was chosen
because HTML/CSS/TS proved most flexible for the UI. The `rework` branch is an active rewrite —
some things referenced in README.md (e.g. running the simulation in a Web Worker) are not
currently implemented; trust the code over the README for current state.

## Commands

```sh
npm run dev        # start Vite dev server
npm run build      # production build (outputs to dist/)
npm run preview    # preview a production build
npm run typecheck  # tsc --noEmit, project references (tsconfig.app.json + tsconfig.node.json)
```

There is no test suite and no linter configured. Always run `npm run typecheck` after making
changes.

Path alias: `@/*` maps to `src/*` (configured in both `tsconfig.app.json` and `vite.config.ts`).

## Architecture

The simulation is a small ECS-like system: **World** holds state, **Systems** hold behavior,
**Cells** are entities made of **Components**. Rendering is a separate concern driven by
**Renderers**.

### World / tick loop (`src/world.ts`)

`World` holds `tick`, `width`/`height`, a `grid` (flat `Int32Array` of cell IDs, -1 = empty),
a `cells: Map<number, Cell>`, arbitrary `layers` (other `GridLayer`s, e.g. light/temperature), and
the ordered list of `systems`.

`newWorld()` instantiates one instance of every system registered in `systemRegistry`, disabled by
default, sorts them, and calls `onInit` on each.

`doTick()` runs each tick in two phases:
1. Call `system.onTick(world)` on every enabled system (world-level effects, e.g. spawning cells,
   diffusing a layer).
2. Walk the grid once; for every occupied cell, call `system.onCellTick(world, cell)` on every
   enabled system, in system order. A cell is marked `processed` via an internal component so it's
   only visited once per tick even if the grid iteration would otherwise revisit it; this flag is
   cleared at the end of the tick.

### Systems (`src/systems/`)

A `System` (`src/systems/base.ts` for `BaseSystem`, interface in `src/systems/index.ts`) has an
`id`, `enabled`, optional `onInit`/`onTick`/`onCellTick`, and an optional `after: string[]` listing
system IDs it should run after (soft ordering, not a hard dependency — see `sortSystems`). Systems
also implement `UIDescription` (`title`/`description`) and can expose `config: ConfigSchema` for
tunable parameters and `actions` (buttons), both rendered automatically into the Tweakpane UI.

New systems must be registered in `src/systems/registry.ts` (`systemRegistry.register(...)`) to be
picked up by `newWorld()`.

Existing systems: `movement`, `light`, `constant-move`, `cell-generator`, `sensors`,
`temperature`, `genome`. Read `src/systems/genome.ts` for the canonical example: it reads/writes
components via `getComponent`/`setComponent`, exposes `config`, and declares `after: ["sensors"]`
since gene activation depends on sensor readings.

### Components (`src/cell.ts`, `src/components/`)

`Cell` is just `{ id, position, components: Record<string, Record<string, any>> }` — a loose bag
of components keyed by string. `src/components/index.ts` defines the authoritative `Components`
type map (id -> shape) and the type-safe `getComponent`/`setComponent` helpers; **always** go
through these instead of touching `cell.components` directly, so component IDs stay type-checked.
Adding a new component type means adding it to the `Components` map here.

Convention: systems generally *read* one component (e.g. `genome`, `sensors`) and *write* another
(e.g. `movement`) rather than mutating cell state directly — this keeps behavior composable and
order-dependent via `after`.

### Grid layers (`src/grid.ts`)

`GridLayer<T>` wraps a flat typed array as a 2D grid (`gridGet`/`gridSet`/`gridMaybeGet`/
`gridEvery`). `World.grid` is the main cell-ID grid; `World.layers` holds additional named layers
(e.g. light intensity, temperature) that systems can read/write.

### Renderers (`src/renderers/`)

Parallel structure to systems: a `Renderer` (`src/renderers/index.ts`) has `id`, `enabled`,
optional `config`, and a `render(ctx, world)` method (may be async). Renderers are registered in
`src/renderers/registry.ts`. Existing renderers: `light` (`LightnessRenderer`), `cell`
(`CellRenderer`). `UIController.render()` (`src/ui/main.ts`) runs all enabled renderers in
registration/sort order each frame, awaiting any that return a promise.

### Registry pattern (`src/registry.ts`)

Both systems and renderers reuse the generic `Registry<T>`: a map of `id -> Definition<T>` where
`Definition` carries `title`/`description`/`id` plus a `create()` factory. This is what lets the UI
auto-generate panes for "every registered system/renderer" without hardcoding a list.

### UI layer (`src/ui/`, `src/ui.ts`)

Built with [Tweakpane](https://tweakpane.github.io/docs/). `src/ui.ts` defines the shared
`UIDescription`/`UIActionable`/`ConfigSchema` contracts that both systems and renderers implement,
so the pane-building code (`src/ui/systems.ts`, `src/ui/renderers.ts`) is generic: it iterates
`world.systems` / the renderer registry and calls `folder.addBinding`/`addButton` per entry,
including per-item `config` bindings and `actions`. **To expose a new tunable on a system or
renderer, just add it to that class's `config` array — no UI code needs to change.**

`src/ui/main.ts` (`UIController`) owns the top-level flow: builds the "New World" pane, creates the
world on demand, wires up Panzoom on the canvas, and drives the manual tick/render loop (`tick()` /
`render()`, triggered by the "Do Tick" button — there is no automatic animation loop currently).
`src/ui/elements.ts` centralizes DOM lookups (`main`, `canvas`, `panes-container` from
`index.html`). `src/ui/selected-cell.ts` handles the pane for inspecting/controlling a clicked
cell.

## Conventions

- 2-space indent, LF line endings (see `.editorconfig`).
- No `any`-ban: `noImplicitAny` is disabled in `tsconfig.app.json`, but prefer explicit types for
  new public APIs (registries, component shapes) since they're consumed generically elsewhere.
- Deploys to GitHub Pages automatically from `main` via `.github/workflows/deploy.yml` (builds with
  Node 22, uploads `dist/`) — don't assume any other CI/deploy path exists.
