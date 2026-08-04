# Cell simulation

This is a cellular automata that simulates the evolution of cells.

Each cell is an independent agent with its own set of instructions (genome) that dictates
its behavior. Whether an instruction fires depends on a base probability plus weights on
four "sensor" inputs, so behavior can react to the cell's environment rather than being
purely random.

> **Note:** this branch (`rework`) is a from-scratch rewrite of the simulation, replacing an
> earlier Vue-based version. It's an early work in progress: reproduction, mutation, cell
> energy/death, and per-cell controls (kill/revive/edit) are not implemented yet. See
> "Current state" below for what's actually there today, and `CLAUDE.md` for the full
> architecture breakdown.

## Current state

- Vanilla TypeScript + Canvas 2D, no UI framework. Panels are built with
  [Tweakpane](https://tweakpane.github.io/docs/).
- Architected as a small ECS: a `World` holds grid-based state, `System`s contain all
  behavior (movement, light, sensors, temperature, genome execution, ...), and cells are
  bags of `Component`s that systems read and write.
- Ticks are advanced manually, one at a time, via a "Do Tick" button — there's no running
  animation loop yet, and no Web Worker (everything runs on the main thread).
- Clicking a cell shows its raw state (position, genome, instruction pointer) in an
  inspector panel.
- Systems and renderers are individually toggle-able and configurable live from the UI,
  auto-generated from their registries — no manual UI wiring needed to add a new one.

## History

There were two predecessors to this implementation:

- https://github.com/3elDU/cell-simulation - Written in C, the first attempt. Quickly got frustrated with implementing the UI and abandoned it. Has the best performance.
- https://github.com/3elDU/cell-simulation-rs - Written in Rust. Semi-maintained. Worse performance than the C implementation, but still (roughly) 2x faster compared to this one.

The project was then rebuilt in Vue, and has since been rewritten again from scratch (this
branch) in plain TypeScript with a Canvas-based renderer and an explicit systems/components
architecture, aiming for something simpler to extend than the Vue version.
