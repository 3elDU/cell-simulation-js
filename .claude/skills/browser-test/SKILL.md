---
name: browser-test
description: Drive this simulation in Firefox to verify a change actually works — start the dev server, click through the tweakpane panes, read the canvas and IndexedDB. Use whenever a change needs checking in the real app rather than only typechecking, or when asked to run/screenshot/test the app.
---

# Testing the simulation in Firefox

There is no test suite. `npm run typecheck` proves nothing about behavior, so anything
touching systems, renderers or the UI gets checked by running it.

## Start the server

```sh
npm run dev > "$CLAUDE_JOB_DIR/tmp/dev.log" 2>&1 &
sleep 4; cat "$CLAUDE_JOB_DIR/tmp/dev.log"
```

**Read the port out of the log.** Vite falls back to 5174, 5175… when 5173 is taken, which it
often is. Then `mcp__firefox-devtools__new_page` at that URL. Kill the server (`pkill -f vite`)
when done.

Load the tools first:
`ToolSearch("select:mcp__firefox-devtools__new_page,mcp__firefox-devtools__evaluate_script,mcp__firefox-devtools__list_console_messages")`

## Don't use screenshots for the panes

`screenshot_page` comes back as a flat dark rectangle — it doesn't capture the tweakpane
overlay. Drive and inspect through `evaluate_script` against the DOM instead. Screenshots are
still fine for looking at the canvas itself.

## Driving tweakpane

Panes carry no ids, so go by label:

```js
// buttons
[...document.querySelectorAll('button.tp-btnv_b')]
  .find(b => b.textContent.trim() === 'Do Tick').click();

// what's clickable right now — the fastest way to see which panes exist
[...document.querySelectorAll('button.tp-btnv_b')].map(b => b.textContent.trim())

// pane / folder titles
[...document.querySelectorAll('.tp-rotv_t')].map(e => e.textContent)   // panes
[...document.querySelectorAll('.tp-fldv_t')].map(e => e.textContent)   // folders

// system + renderer toggles, in registration order
[...document.querySelectorAll('#panes-container input[type=checkbox]')].map(b => b.checked)
```

Text and number knobs are plain `input`s under `#panes-container`. Setting `.value` by hand does
**not** notify tweakpane — click the checkbox/button, or change the underlying object, rather
than faking input events.

## Timeouts

`evaluate_script` defaults to 5s and a fresh world takes longer than that — `newWorld` runs every
system's `onInit`, which fills three layers and generates ~15k cells. Pass `timeout: 30000` for
anything that creates or opens a world.

**A timed-out script still ran.** The click lands; only the result is lost. Don't retry it —
re-query the state in a second call instead, or you'll create two worlds.

Clicking "Do Tick" N times in one script gives you **one** tick. `tick()` is async and guards
against overlap with `this.ticking`, so the other N-1 clicks return immediately. To advance many
ticks, click Start, `sleep` in Bash, then click Stop.

## Comparing world state

Hash the canvas. It folds the grid, every layer and every enabled renderer into one number, which
makes round trips (save → reload → load) checkable in one comparison:

```js
const c = document.getElementById('canvas');
const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
let h = 0; for (let i = 0; i < d.length; i++) h = (h * 31 + d[i]) | 0;
```

Saved dishes live in IndexedDB (`cell-simulation`, stores `dishes` and `snapshots`) — worth
reading directly when checking what persistence captured:

```js
const db = await new Promise(r => { const q = indexedDB.open('cell-simulation'); q.onsuccess = () => r(q.result); });
const metas = await new Promise(r => { const q = db.transaction('dishes').objectStore('dishes').getAll(); q.onsuccess = () => r(q.result); });
```

Delete any dishes you created — this is the user's browser profile, not a fixture.

## Finish with

`mcp__firefox-devtools__list_console_messages` with `level: "error"`. A system that throws inside
`onCellTick` shows up there and nowhere else — the loop keeps running and the canvas still looks
plausible.
