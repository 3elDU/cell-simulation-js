# CLAUDE.md

Guidance for Claude Code working in this repo. This document is about **what the project is
trying to be** — read the code for how it currently does it.

## The idea

An artificial life sandbox. A 2D grid, cells with 8 neighbors, a genome, mutation, and natural
selection — but the point isn't any one simulation. The point is **being able to run many
different simulations quickly**.

This is the fourth iteration (after C, Rust, and Vue versions). The earlier ones were faster but
rigid: behavior was hardcoded, and answering "what if photosynthesis were cheaper?" or "what if
there were no light gradient?" meant editing code and recompiling. That friction is the thing
this rewrite exists to kill.

So the guiding goals, in order:

1. **Everything is a knob.** Temperature, light, mutation rate, energy costs, evolution
   pressure — if a number shapes the world, it should be tweakable live from the UI, mid-run,
   without a reload.
2. **Everything is toggleable.** Behavior lives in independent systems that can be switched off
   individually. Turning off "light" should leave a coherent world, not a crash. Composability
   over completeness.
3. **Adding a rule should be cheap.** A new behavior should be one new file plus one registry
   line, with its config panel appearing for free. If adding a system requires touching UI code,
   the abstraction has failed.
4. **Observability.** You should be able to click any cell and see exactly why it did what it
   did. A simulation you can't inspect is a screensaver.

Performance matters less than any of the above. TypeScript + Canvas was chosen precisely because
the UI is the hard part, and the UI is what makes the sandbox useful.

## Architectural philosophy

A small ECS, chosen for the modularity goals above rather than for its own sake:

- **World** — state only: the grid of cells, extra grid layers (light, minerals, organics, ...),
  the tick counter. It doesn't decide anything. Layers are created and owned by the system that
  fills them, not by the world — a layer without its system is a dead array.
- **Systems** — behavior only, no state of their own beyond config. Each system does one thing.
  They run in a soft order (a system can declare it wants to run *after* another) so that e.g.
  sensor readings exist before anything reacts to them.
- **Components** — data bags hung off cells. Systems communicate through them: one system writes
  an intent, another reads it and acts. A system should rarely mutate a cell "directly" when it
  could instead write a component another system owns. This is what keeps rules composable — and
  what makes "turn off the movement system" produce a world where cells *want* to move but
  can't, rather than a broken one.
- **Renderers** — drawing only, mirroring the system structure, individually toggleable.
- **Sensors** — one reading each, a number in 0..1, computed from the world or the cell. A sensor
  returns nothing when its dependency is missing, rather than faking a zero.
- **Actions** — one thing a cell can do. Actions write intent into components; the system that
  owns that component is what actually carries it out.
- **Registries** — how systems, renderers, sensors and actions announce themselves. The UI is
  generated from them, so nothing hardcodes a list of features.

The consequence to protect: **the UI never knows about specific systems.** Each system/renderer
describes its own tunables, and the panel builder is generic. Adding a knob means adding it to a
system's config, never touching UI code.

Two patterns follow from that and are worth reaching for before writing a new file:

- **Parameterize, then register several times.** A renderer that draws "the light layer" wants to
  be a renderer that draws *a named layer*, registered once per layer. Same for sensors reading a
  layer, moves in a direction, and harvests from a resource. When a second near-identical file
  starts to look necessary, the first one probably wanted an argument.
- **Knobs can be generated from a registry.** A system that needs one number per action or per
  layer builds that map in `onInit` and emits a `ConfigItem` per entry, pointing at the map with
  `ConfigItem.object`. `src/systems/energy.ts` (a cost per action) and `src/systems/feeding.ts`
  (a rate and efficiency per layer) do this — register a new action and its sliders appear
  without either file knowing it exists.

Layout: `src/systems/`, `src/components/`, `src/renderers/`, `src/sensors/`, `src/actions/`,
`src/ui/`, plus `world.ts`, `grid.ts`, `cell.ts`, `registry.ts`. `src/systems/genome.ts` is the
canonical example of a system that reads config, reads one component, and writes another.

## The genome: policy, not program

The genome used to be a linear program — a hardcoded enum of commands walked by an instruction
pointer, inherited from the earlier prototypes. It isn't anymore. There is no instruction
pointer, no opcode enum, and no notion of a cell "being at" a position in its genome.

A genome is a **flat list of genes, each one a vote for an action**. A gene holds the id of the
action it votes for, a base weight, and the ids of the sensors it listens to. Every tick:

1. Each gene is scored: its base weight plus the readings of the sensors it listens to,
   centered so a sensor can push a gene down as easily as up.
2. Scores are summed **per action**, so several genes can back the same action for different
   reasons ("move left when dark", "move left when crowded").
3. One action wins and is performed — either the highest scorer, or a weighted random draw, a
   config knob. Actions no gene voted for can't be chosen at all.

Genes are a variable-length list, not one entry per action. A cell only carries genes for the
few actions it cares about, and **which** actions those are is itself evolved. That's what makes
"how does a cell choose between dozens of actions?" a non-problem: a photosynthesizer simply has
no attack gene. It also makes genome length an evolvable trait — more genes means a broader
repertoire and louder, more confident votes, which is a cost worth charging for later.

Why this shape and not an opcode set:

- Disabling a system removes its actions from the registry; genes naming them go inert instead of
  hitting a dead opcode. Genomes survive being toggled around.
- A new system's actions are evolvable immediately, with no change to the genome format.
- Weights evolve smoothly — a small mutation is a small behavior change, which selection can
  actually climb. Discrete opcodes evolve in jumps.
- Behavior is polygenic: a trait built from many small contributions rather than one gene, which
  is what lets it drift gradually rather than flip.
- Every tick each cell records the action it chose and the score every action reached, purely so
  a human can open the inspector and ask why.

Sensor readings are unweighted on purpose: a gene lists *which* sensors it listens to, not how
much each matters. Keeping the genome that simple is worth more than the extra expressiveness.

Mutation happens on the child's copy at birth, never on the parent's genome — a mutation reaching
back into the parent would be inheritance of acquired characteristics, a very different
simulation. Every operator is a small local edit on this shape: nudge a base weight, retarget a
gene at another action, add or drop a sensor it listens to, duplicate a gene so the copy can
drift, add a gene for a random registered action, delete one. Each has its own rate knob plus a
global multiplier, so overall mutation can be dialed mid-run without losing the balance between
operators. New genes start near zero: a gene that fires hard from birth gets selected away before
it can drift into anything useful. Action and sensor ids are read fresh from the registries at
each birth, so toggling a system off changes what mutation is able to reach.

The known cost is **memory**: scoring genes against current readings is memoryless, so a cell
can't do A for a while and then B. This is a deliberate deferral, not an oversight — it gets
solved later with hormone mechanics, where "adjust hormone" is just another registered action and
"own hormone level" is just another sensor. Sequence and internal state emerge from the same
machinery rather than needing control flow bolted back on. Don't reintroduce an instruction
pointer to solve it.

## The energy economy

Energy is what makes any of the above selection rather than drift, so the rules around it are
deliberate rather than incidental.

**Energy is finite and mostly recycled.** Light and mineral vents are the only inputs. Cells carry
energy, corpses drop it into the organics layer, organics rots back into minerals, and
chemosynthesis picks it up again. Every *transfer* along that path has an efficiency knob
defaulting to 1, so nothing leaks unless you open it deliberately. Metabolism is the exception and
always will be: upkeep and action costs are burnt, not returned to any layer. That is the sink the
inputs have to keep up with.

**Resource layers are stocks, not constants.** Harvesting draws a tile down; light regrows toward
its gradient, minerals arrive from vents that pulse on and off. That is where carrying capacity
comes from. A layer that refilled instantly would let a bright tile support unlimited biomass and
there would be nothing to compete over. Relatedly, regrowth scales with a tile's place on the
gradient — a dim tile that recovered as fast as a bright one would make the gradient decorative.

**Surplus energy is dangerous, not worthless.** There is no energy cap. Above a threshold a cell
has a growing per-tick chance of bursting, certain at a second threshold. A cap would make excess
energy free to ignore and cells would idle at maximum forever; risk makes them spend. It also
gives reproduction its motivation without hand-tuning one — splitting is how you shed a surplus
safely, and cells that don't split burst.

**One system grants energy, one system takes it.** `feeding` is the only source; `energy` is
purely a sink. A world with feeding switched off runs down and dies, which is correct behavior
rather than a bug.

**Death is an action like any other.** Starvation, overload, voluntary death and anything added
later all write the same death component through `kill()`. The death system sweeps at the *start*
of a tick, so a cell marked partway through tick N is still on the grid for the rest of it —
removing cells mid-iteration would yank them out from under every system ordered after the
killer.

## Not built yet

Deliberately absent, in rough order of intent — don't treat any of these as oversights:

- **Recycled energy sources.** Feeding currently only reads layers. Predation (take from a
  neighbor and kill it), scavenging (eat the organics layer directly), parasitism (drain without
  killing) and donation (give to a neighbor, which with a kin-similarity sensor gets you kin
  selection) are all the same shape as the existing harvest: an action writing an intent plus a
  system that pays out.
- **Hormones and signals.** Components for both existed and were deleted rather than left
  unused; they come back when there's something to use them for. This is also the intended fix
  for the genome's memorylessness — see above.
- **A cost for genome length.** Longer genomes mean a broader repertoire and louder votes, and
  currently nothing charges for that, so length drifts upward for free.
- **Anything a cell can sense about other cells.** Every sensor today reads a layer or the cell
  itself. Crowding, kinship and neighbor energy are the obvious gaps, and they gate most of the
  interesting social behavior.

## Working in this repo

```sh
npm run dev        # Vite dev server
npm run build      # production build
npm run typecheck  # always run after changes
```

No tests, no linter. `@/*` maps to `src/*`. 2-space indent, LF (see `.editorconfig`).

`typecheck` must stay `tsc -b --noEmit` — the root tsconfig is references-only, so a plain
`tsc --noEmit` compiles nothing and passes no matter what is broken.

The current branch is an active rewrite; README.md still describes things that don't exist (a Web
Worker, per-cell kill/revive) and describes the genome as a linear program, which it hasn't been
for a while. Trust the code.

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
