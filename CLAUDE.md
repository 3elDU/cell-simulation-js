# CLAUDE.md

**What this project is trying to be.** How it currently does it is in the code — read that, and
don't mirror it here. This file should survive a new system, a new mechanic or a refactor
untouched.

## The idea

An artificial life sandbox. A 2D grid, cells with 8 neighbors, a genome, mutation, and natural
selection — but the point isn't any one simulation. The point is **being able to run many
different simulations quickly**.

Earlier iterations were faster but rigid: behavior was hardcoded, so answering "what if
photosynthesis were cheaper?" meant editing code and recompiling. That friction is the thing this
rewrite exists to kill.

Goals, in order:

1. **Everything is a knob.** If a number shapes the world, it's tweakable live from the UI,
   mid-run, without a reload.
2. **Everything is toggleable.** Turning a system off leaves a coherent world, not a crash.
   Composability over completeness.
3. **Adding a rule is cheap.** One new file plus one registry line, with its config panel
   appearing for free. If adding a system requires touching UI code, the abstraction has failed.
4. **Observability.** Click any cell and see exactly why it did what it did. A simulation you
   can't inspect is a screensaver.

Performance matters less than any of the above.

## Architecture

A small ECS, chosen for the modularity goals rather than for its own sake:

- **World** — state only. It doesn't decide anything. Grid layers are owned by the system that
  fills them, not by the world: a layer without its system is a dead array.
- **Systems** — behavior only, no state beyond config. One thing each, in a soft order (a system
  can declare it runs *after* another).
- **Components** — data bags on cells, and the only channel between systems: one writes an
  intent, another acts on it. Prefer that over mutating a cell directly. It's what makes turning
  a system off yield cells that *want* to act but can't, rather than a broken world.
- **Renderers, sensors, actions** — drawing, one reading in 0..1, one thing a cell can do. A
  sensor returns nothing when its dependency is missing rather than faking a zero; an action
  writes intent for a system to carry out.
- **Registries** — how all of the above announce themselves. The UI is generated from them, so
  **the UI never knows about specific systems.**

Three patterns to reach for before writing a new file:

- **Parameterize, then register several times.** When a second near-identical file starts to look
  necessary, the first one probably wanted an argument — a name, a direction, a color. If the
  argument would be a branch on *behavior*, two files are better than one class full of `if`.
- **Look for the abstraction that already exists.** Before parameterizing on a closure, check
  whether another registry already has the shape you need. Reusing the sensor contract to color
  cells means every sensor becomes drawable for free, and the canvas can't disagree with the
  inspector.
- **Knobs can be generated from a registry.** A system needing one number per action or per layer
  builds that map in `onInit` and emits a `ConfigItem` per entry — register a new action and its
  sliders appear without either file knowing the other exists.

## Design commitments

These are decisions, not descriptions. Change them deliberately, not by accident.

**The genome is policy, not a program.** A flat list of genes, each a weighted vote for an action,
scored against sensor readings every tick. No instruction pointer, no opcode enum, no position in
the genome. This is what lets a genome survive systems being toggled, makes a new system's actions
evolvable for free, and lets behavior drift smoothly instead of flipping. Genes are variable
length, so *which* actions a cell cares about is itself evolved.

Consequence: cells are memoryless — no doing A for a while and then B. That's a deferral, to be
solved with hormones ("adjust hormone" is just another action, "own hormone level" just another
sensor), not by reintroducing control flow.

**Mutation happens on the child's copy at birth**, never on the parent's genome — otherwise it's
inheritance of acquired characteristics, a different simulation. Ids come fresh from the
registries each birth, so toggling a system off changes what mutation can reach.

**Energy is finite and mostly recycled.** Every transfer has an efficiency knob defaulting to 1,
so nothing leaks unless you open it. Metabolism is the deliberate exception: it burns, and it's
the sink the inputs have to keep up with. One system grants energy, one takes it — a world with
feeding off runs down and dies, which is correct.

**Resource layers are stocks, not constants.** Harvesting draws a tile down and regrowth is
gradual and gradient-scaled. That's where carrying capacity comes from; instant refill would mean
nothing to compete over and a decorative gradient.

**Surplus energy is dangerous, not capped.** A cap makes excess free to ignore and cells idle at
maximum forever. Risk makes them spend, and gives reproduction its motivation without hand-tuning
one.

**Lethal pressure is a ramp, not a threshold.** A hard cutoff kills every cell on the same tick,
turning population into a sawtooth and the knob into a switch. A rising chance spreads deaths out,
leaves room for luck, and gives selection a gradient to climb.

**Age exists to make reproduction mandatory.** Without it a lucky cell is immortal, a lineage can
win by never splitting, and the genome stops being under pressure.

**Death is an action like any other**, and is swept at the *start* of a tick — a cell marked
partway through tick N stays on the grid for the rest of it, since removing cells mid-iteration
yanks them out from under every system ordered after the killer.

Deliberate absences and where the project is headed live in `IDEAS.md`, not here.

## Working in this repo

```sh
npm run dev        # Vite dev server
npm run build      # production build
npm run typecheck  # tsc against tsconfig.app.json
npm run lint       # eslint src
npm run format     # prettier --write over src
npm run check      # all three — run after changes
```

No tests. `@/*` maps to `src/*`. 2-space indent, LF (see `.editorconfig`).

`typecheck` points at `tsconfig.app.json` explicitly and must keep doing so — the root tsconfig
is references-only, so a plain `tsc --noEmit` compiles nothing and passes no matter what is
broken.

Formatting is Prettier's job alone (`.prettierrc`: es5 trailing commas, no parens on single-arg
arrows, semicolons). `eslint.config.ts` pulls in `eslint-config-prettier` to switch off every
stylistic rule, so don't add formatting rules to ESLint — it lints correctness only
(`js/recommended` + `typescript-eslint` recommended).

The current branch is an active rewrite; README.md still describes things that don't exist and
describes the genome as a linear program, which it hasn't been for a while. Trust the code.

Two sharp edges worth knowing before changing tick order or adding cells:

- `doTick` runs every system's `onTick` first, then walks the grid calling `onCellTick` per cell.
  A system's position in the ordering only matters *within* a phase. A cell created mid-walk on a
  tile the walk hasn't reached yet will be visited in the same tick unless it is marked
  `components.internal = { processed: true }`, which is what the reproduction system does.
- `sortSystems` is shakier than it looks — its comparator isn't antisymmetric and it splices
  while iterating. It produces a correct order for the current `after` declarations, but adding
  another is a good moment to verify the result rather than assume it.

Deploys to GitHub Pages from `main` via `.github/workflows/deploy.yml`. There is no other CI.

## Non-goals

- Replicate a complex neural network. 
- Performance over flexibility. Flexibility and simpler code should always be prioritized.
- Strict biological accuracy. While some aspects of the simulation replicate real
  biological processes, those are abstractions - not realistic simulations.
