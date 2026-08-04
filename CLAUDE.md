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

- **World** — state only: the grid of cells, extra grid layers (light, temperature, ...), the
  tick counter. It doesn't decide anything.
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

The known cost is **memory**: scoring genes against current readings is memoryless, so a cell
can't do A for a while and then B. This is a deliberate deferral, not an oversight — it gets
solved later with hormone mechanics, where "adjust hormone" is just another registered action and
"own hormone level" is just another sensor. Sequence and internal state emerge from the same
machinery rather than needing control flow bolted back on. Don't reintroduce an instruction
pointer to solve it.

## Not built yet

Deliberately absent, in rough order of intent — don't treat any of these as oversights:

- **Mutation and reproduction.** The genome shape is designed for it: nudge a base weight,
  duplicate a gene so the copy can drift, add a gene for a random registered action, delete one,
  or retarget one at a different action. Each operator wants its own rate knob. New genes should
  start near zero — a gene that fires hard from birth gets selected away before it can drift into
  anything useful.
- **Energy and death**, without which none of the above is selection, just drift.
- **Hormones and signals.** Components for both existed and were deleted rather than left
  unused; they come back when there's something to use them for.
- **An automatic tick loop.** Ticks are advanced by hand from the UI today.

## Working in this repo

```sh
npm run dev        # Vite dev server
npm run build      # production build
npm run typecheck  # always run after changes
```

No tests, no linter. `@/*` maps to `src/*`. 2-space indent, LF (see `.editorconfig`).

`typecheck` must stay `tsc -b --noEmit` — the root tsconfig is references-only, so a plain
`tsc --noEmit` compiles nothing and passes no matter what is broken.

The current branch is an active rewrite; README.md describes some things (Web Worker, per-cell
kill/revive, reproduction, energy/death) that don't exist yet. Trust the code.

Deploys to GitHub Pages from `main` via `.github/workflows/deploy.yml`. There is no other CI.

## Non-goals

- Replicate a complex neural network. 
- Performance over flexibility. Flexibility and simpler code should always be prioritized.
- Strict biological accuracy. While some aspects of the simulation replicate real
  biological processes, those are abstractions - not realistic simulations.
