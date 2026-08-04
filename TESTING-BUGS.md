# Bugs found while writing the test suite

Nothing in this list has been fixed — the tests in `tests/` deliberately pin *current* behavior,
and skip the paths that are broken beyond usefully testing. Each entry says where it is, how to see
it, what it does today, what it presumably should do, and the smallest fix.

Ordered roughly by how much they distort the simulation.

---

## 1. The temperature sensor can never read a temperature

**`src/systems/sensors.ts`**, `valueForSensorType`

```ts
case "temperature":
  value = getComponent(cell, "temperature")?.temp ?? 0;
  // no break — falls through

case "none":
default:
  value = 0;
```

The `"temperature"` case has no `break`, so it falls through to `default` and `value` is immediately
overwritten with `0`. Setting any sensor slot to `temperature` in the UI gives pure noise.

**Fix:** add `break;` after the assignment.

**Test impact:** `tests/systems/sensors.test.ts` covers `"light"` and `"none"` only, and says so at
the top of the file. Add temperature cases once this is fixed.

---

## 2. Crowding never contributes to temperature

**`src/systems/temperature.ts`**, `countNonEmptyNeighbors`

```ts
.map(([dx, dy]) => gridGet(world.grid, { x: base.x + dx!, y: base.y + dy! }) ?? -1 !== -1)
.filter((exists) => exists === true).length;
```

`!==` binds tighter than `??`, so this parses as `gridGet(...) ?? (-1 !== -1)` — the map produces
*numbers* (or `false` for empty results), never booleans. The following `=== true` filter therefore
matches nothing and the count is **always 0**. `crowdingFactor` is a dead knob; temperature is
purely light-driven.

**Fix:** parenthesize and compare properly, e.g.

```ts
.filter(([dx, dy]) => (gridGet(world.grid, { x: base.x + dx!, y: base.y + dy! }) ?? -1) !== -1).length
```

Note this also reveals a second issue: neighbor coordinates are not clamped to the grid, so a cell on
the left edge samples the right edge of the row above (`gridGet` does no bounds checking on `x`).
Worth clamping at the same time.

**Test impact:** `tests/systems/temperature.test.ts` covers only the light half, plus one test that
explicitly pins `countNonEmptyNeighbors` returning 0 for a fully surrounded cell. That test should be
inverted when this is fixed.

---

## 3. `sortSystems` is not a correct sort

**`src/systems/index.ts`**

Three separate defects:

**(a) The comparator is not a valid ordering function.**

```ts
if (aDeclared && bDeclared) return 0;
else if (aDeclared) return 1;
else return -1;
```

The final `return -1` fires whenever `a` has no dependencies, *regardless of `b`* — so
`compare(x, y)` and `compare(y, x)` can both be `-1`. That violates antisymmetry, which means the
result depends on V8's sort implementation and **is not idempotent**: sorting an already-sorted
array reshuffles it. `tests/systems/ordering.test.ts` pins exactly this.

**(b) `splice` during `forEach`.** The second pass mutates the array it is iterating, so elements get
skipped or visited twice. It happens to work for the current seven systems.

**(c) A missing dependency moves the dependent to the *front*.**

```ts
const newIdx = Math.max(...system.after.map((id) => arr.findIndex((sys) => sys.id === id)));
arr.splice(newIdx + 1, 0, system);
```

`findIndex` returns `-1` for an unregistered id, `Math.max` can then yield `-1`, and
`splice(0, 0, system)` puts the dependent at position 0 — the exact opposite of the intent. An
`after: []` reaches `Math.max()` of nothing, i.e. `-Infinity`, and `splice(-Infinity, ...)`.

**Fix:** replace both passes with a real topological sort (Kahn's algorithm over `after` edges,
ignoring edges to ids that aren't present), falling back to registration order for ties.

**Test impact:** `tests/systems/ordering.test.ts` only tests the real seven-system registry, where
the two invariants that matter (`sensors` after `light`+`temperature`, `genome` after `sensors`) do
hold. Synthetic cases are omitted on purpose — a proper implementation should be testable with them.

---

## 4. `movement` has no ordering constraint

**`src/systems/movement.ts`**

`MovementSystem` declares no `after`, yet `genome` and `sys-constant-move` both *write* the
`movement` component it consumes. Whether a movement intent is acted on in the same tick or the next
one is therefore incidental.

Today it happens to work: the buggy comparator in #3 shuffles `movement` to the end of the list, so
`newWorld()` does apply intents in the same tick. That's luck, not design — and fixing #3 will
likely change it, since `movement` sorts *before* the dependency-declaring systems under a correct
stable sort.

**Fix:** `after = ["genome", "sys-constant-move"]` on `MovementSystem`.

**Test impact:** `tests/systems/interactions.test.ts` covers both orderings explicitly, and
`tests/systems/ordering.test.ts` pins the currently-observed position with a comment explaining that
it's incidental.

---

## 5. Sensor noise is a one-sided bias, not noise

**`src/systems/sensors.ts`**

```ts
return Math.min(Math.max(value + random() * this.noise, 0), 1.0);
```

`random() * noise` is always `>= 0`, so every reading is pushed *up* by an average of `noise / 2`.
With the default `noise = 0.15`, a cell in total darkness reports an average light level of 0.075.

**Fix:** center it — `(random() - 0.5) * this.noise`, or `(random() + random() - 1) * this.noise`
for the same gaussian-ish shape used in `genome.ts`.

---

## 6. Assorted issues in the genome system

**`src/systems/genome.ts`** / **`src/components/genome.ts`**

- **Throws on an empty genome.** `component.genome[component.ip]` is `undefined`, then `.base`
  throws. Nothing produces an empty genome today (`genomeLength` has `min: 1`), but nothing guards
  either. Pinned by a test.
- **`skip` is applied backwards.** The `Gene.skip` docstring says "how many instructions to skip, if
  this instruction is **not** fired", but the code does `component.ip += execute ? inst.skip : 1` —
  it skips when the instruction *does* fire. One of the two is wrong; the docstring reads like the
  intended design.
- **Wrap-around only subtracts once.** `if (ip >= length) ip -= length`. With a short genome and
  `skip` up to 3, `ip` can land past the end and stay there — the next tick then reads
  `genome[undefined-index]` and throws. Reachable with `genomeLength` of 1–3. Use `ip %= length`.
- **`"move"` hardcodes `dir: "down"`.** There is no notion of facing, so the `left`/`right` commands
  can't turn anything and `noop`/`left`/`right` are inert.
- **`Genome.cur` is dead.** Declared in the component and never written or read.

---

## 7. Cell ids are derived from map size

**`src/cell.ts`**, `addCell`

```ts
const id = world.cells.size + 1;
```

Ids are only unique while nothing is ever removed from `world.cells`. Once cell death exists,
removing a cell makes the next `addCell` reuse a live id and silently overwrite it in the map.
Pinned by a test in `tests/cell.test.ts`.

**Fix:** a monotonic counter on the world (`world.nextCellId++`).

Related, same function: `addCell` doesn't check whether the target tile is occupied. It overwrites
the grid entry and orphans the previous cell, which stays in `cells` but is no longer on the grid.

---

## 8. `gridEvery` skips zeros

**`src/grid.ts`**

```ts
if (val && val !== -1) callback(x, y, val);
```

The truthiness check means value `0` is skipped along with the `-1` sentinel. Harmless only because
cell ids start at 1 — but `doTick`'s cleanup pass uses `gridEvery`, so the "empty" sentinel is
effectively two values, and any future layer where 0 is meaningful will silently lose tiles.

**Fix:** `if (val !== -1)`, and let callers decide about 0.

---

## 9. A blocked move keeps its intent

**`src/systems/movement.ts`**

`delete cell.components.movement` only runs on a successful move. When a move is aborted (target
occupied, or clamped into a wall), the component survives into the next tick, so the cell retries
indefinitely without the producing system asking again. Whether that's desirable is a design call —
it's currently undocumented either way.

---

## 10. `CellGenerator` doesn't disable itself

**`src/systems/cell-generator.ts`**

The description reads "Generates cells and automatically disables itself", but `this.enabled` is
never assigned. Either implement it or fix the description. Pinned by a test.

---

## 11. `npm run typecheck` checks nothing

**`package.json` / `tsconfig.json`**

The root `tsconfig.json` is `{ "files": [], "references": [...] }`, and `tsc --noEmit` without
`--build` ignores references entirely — so the script exits 0 without reading a single source file.
(`tsc -p tsconfig.app.json --noEmit` does pass, so this is only a missing check, not hidden errors.)

**Fix:** `"typecheck": "tsc -b --noEmit"`, or check the projects explicitly. Note this repo now also
has `npm run typecheck:tests` for `tsconfig.test.json`, which covers `tests/` plus the simulation
core.
