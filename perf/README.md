# Drag / resize performance harness

Scratch harness used to measure the handle-drag and hover paths of `SplitPanel`
and `DockPanel`. **Not part of the library** — it exists so the numbers in the
group-resize PR can be reproduced, and should be deleted before that PR merges.

## Build first

The harness loads the built UMD bundles from `packages/*/dist`, so rebuild after
touching any widget source:

```bash
cd packages/widgets
npx tsc --build && ../../node_modules/.bin/rollup -c
```

Rebuilding only `lib/` is not enough — the harness reads `dist/`.

## Drag it by hand

`perf/harness.html` opens directly in a browser. `file://` works, but a static
server avoids any origin quirks:

```bash
python3 -m http.server 8321 --bind 127.0.0.1   # from the repo root
```

Then open <http://127.0.0.1:8321/perf/harness.html?mode=stress> — an
application-shell scene of 24 panes (nested `SplitPanel` columns either side of
a `DockPanel`) so that `SplitPanel` handles, `DockPanel` handles and both kinds
of orthogonal handle intersection are all draggable. Handles that sit on an
intersection show the `move` cursor; dragging one resizes on both axes.

Turn the weight up with `&dom=2000` to make a slow relayout obvious, or change
the pane count with `&n=`.

## Run the measurements

```bash
node perf/run.mjs                                     # nested SplitPanel, headless
node perf/run.mjs --mode dock --n 12 --dom 2000       # DockPanel, 12 panes
node perf/run.mjs --at intersect                      # press a handle intersection
node perf/run.mjs --cpu 6                             # throttle until jank is obvious
node perf/run.mjs --headed --slow                      # watch the gesture
node perf/run.mjs --profile /tmp/p.cpuprofile          # DevTools-loadable profile
node perf/run.mjs --json /tmp/before.json --label before
```

`--mode` is `split` (flat), `nested` (orthogonal panels, exercises the
group-resize path) or `dock`. `--n` is the leaf count, `--dom` the number of DOM
nodes per leaf. `perf/harness.html` also opens directly in a browser for manual
dragging; it takes `?mode=…&n=…&dom=…`.

## Reading the output

Four scenarios run per invocation: a synthetic drag, a hover sweep, an
rAF-paced drag, and a burst drag (several `pointermove`s per frame).

The number that matters is the browser's own work, not Lumino's JS:

```text
browser: script=… style=… layout=… task=… (layouts=…, styleRecalcs=…)
```

`layouts` is the count of document layout passes — one per moved frame is the
floor, two means something is forcing a synchronous reflow. `LayoutDuration`
and `fps`/`slowFrames` are the end-user-visible figures. The `hooks` line
reports time inside `SplitLayout`/`DockLayout` `onUpdateRequest` and `onResize`,
which is where a forced reflow shows up if one is charged to Lumino.

Headless Chromium clamps `performance.now()` to 0.1 ms, so per-event figures
below ~0.001 ms/event are at the timer floor. Run each side at least twice; the
noise floor is roughly ±1.5%.
