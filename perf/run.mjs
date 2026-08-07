/*
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 *
 * Drag/resize performance driver for SplitPanel / DockPanel.
 *
 * Usage (from the repo root):
 *   node perf/run.mjs                       # nested SplitPanel, headless chromium
 *   node perf/run.mjs --mode dock           # DockPanel handles
 *   node perf/run.mjs --mode split --n 12   # flat SplitPanel with 12 children
 *   node perf/run.mjs --headed --slow       # watch the gesture happen
 *   node perf/run.mjs --profile out.cpuprofile
 *   node perf/run.mjs --json results.json --label before
 *
 * Requires the built bundles:
 *   (cd packages/widgets && npx tsc --build && ../../node_modules/.bin/rollup -c)
 */
import { chromium, firefox, webkit } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, resolve } from 'path';
import { writeFileSync } from 'fs';

const HERE = dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const out = {
    mode: 'nested',
    n: 8,
    dom: 400,
    steps: 60,
    dx: 200,
    dy: 0,
    handle: 0,
    at: 'handle', // 'handle' | 'intersect'
    repeat: 3, // synthetic drag runs; 0 skips the scenario
    hoversteps: 120, // pointermove events in the hover sweep
    hoverruns: 3, // hover sweep repeats
    perframe: 5, // pointermoves per frame in the burst drag scenario
    realinput: 1, // drive one drag through the real CDP input pipeline; 0 skips
    cpu: 1, // CDP CPU throttling rate; 4-6 makes jank reproducible
    browser: 'chromium',
    width: 1600,
    height: 1000,
    headed: false,
    slow: false,
    profile: null,
    json: null,
    label: null
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    if (key === 'headed' || key === 'slow') {
      out[key] = true;
    } else if (key in out) {
      const v = argv[++i];
      out[key] = typeof out[key] === 'number' ? Number(v) : v;
    } else {
      throw new Error(`unknown option --${key}`);
    }
  }
  return out;
}

const opts = parseArgs(process.argv.slice(2));

const url =
  pathToFileURL(resolve(HERE, 'harness.html')).href +
  `?mode=${opts.mode}&n=${opts.n}&dom=${opts.dom}`;

const launcher = { chromium, firefox, webkit }[opts.browser];
if (!launcher) {
  throw new Error(`unknown browser ${opts.browser}`);
}

const browser = await launcher.launch({
  headless: !opts.headed,
  slowMo: opts.slow ? 40 : 0
});
const context = await browser.newContext({
  viewport: { width: opts.width, height: opts.height }
});
const page = await context.newPage();
page.on('pageerror', e => console.error('[page error]', e.message));
page.on('console', m => {
  if (m.type() === 'error') console.error('[console]', m.text());
});

if (opts.cpu > 1) {
  if (opts.browser !== 'chromium') {
    throw new Error('--cpu throttling requires chromium');
  }
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: opts.cpu });
  console.log(`cpu throttling: ${opts.cpu}x`);
}

await page.goto(url);
await page.waitForFunction('window.__perfReady === true');
await page.waitForTimeout(300);

const handles = await page.evaluate(() => window.__perf.handles());
if (!handles.length) {
  throw new Error('no visible handles found - check the harness layout');
}
console.log(
  `harness: mode=${opts.mode} n=${opts.n} dom=${opts.dom} ` +
    `viewport=${opts.width}x${opts.height} handles=${handles.length}`
);
const target = handles[opts.handle];
console.log(
  `target handle #${opts.handle}: ${target.className} ` +
    `@ (${target.x.toFixed(0)},${target.y.toFixed(0)}) ` +
    `${target.vertical ? 'vertical' : 'horizontal'}`
);

// The drag axis follows the handle orientation unless --dy is given.
let dx = opts.dy ? opts.dx : target.vertical ? opts.dx : 0;
let dy = opts.dy ? opts.dy : target.vertical ? 0 : opts.dx;

// --at intersect presses the corner where a root handle meets a nested
// orthogonal panel's handle, which engages the group-resize path (two
// handles move per pointer event, on both axes).
let at = null;
if (opts.at === 'intersect') {
  at = await page.evaluate(() => window.__perf.intersectPoint());
  dx = opts.dx;
  dy = opts.dx;
  console.log(
    `press point: intersection @ (${at.x.toFixed(0)},${at.y.toFixed(0)}) ` +
      `hitsOuterHandle=${at.hitsOuterHandle} hit=${at.hitClassName}`
  );
}

const results = { label: opts.label, options: opts, scenarios: {} };

// ---------------------------------------------------------------------
// 0. Hover sweep: pointermove over pane content, no button pressed. Runs
//    first so the layout is still pristine. Repeated; the median run is
//    the one to compare (first run pays for lazy JIT / style caches).
// ---------------------------------------------------------------------
const hovers = [];
for (let i = 0; i < Math.max(1, opts.hoverruns); i++) {
  hovers.push(
    await page.evaluate(args => window.__perf.hoverSweep(args), {
      steps: opts.hoversteps
    })
  );
}
results.scenarios.hoverSweep = hovers;

// ---------------------------------------------------------------------
// 1. Synthetic, flushed drag: per-move handler + relayout cost.
//    NOTE: if the widgets coalesce handle moves onto an animation frame,
//    a move is not applied by the time MessageLoop.flush() returns, so
//    this scenario under-reports. Use rafDrag for A/B comparisons.
//    Pass --repeat 0 to skip.
// ---------------------------------------------------------------------
const synthetic = [];
for (let i = 0; i < opts.repeat; i++) {
  synthetic.push(
    await page.evaluate(
      args => window.__perf.syntheticDrag(args),
      { index: opts.handle, at, dx, dy, steps: opts.steps, flush: true }
    )
  );
  // Drag back to the start so repeats are comparable.
  await page.evaluate(
    args => window.__perf.syntheticDrag(args),
    { index: opts.handle, at, dx: -dx, dy: -dy, steps: 4, flush: true }
  );
}
results.scenarios.syntheticDrag = synthetic;

// ---------------------------------------------------------------------
// 2. Synthetic hover (no button down): cost of the hover / handle
//    intersection detection that runs on every pointermove.
// ---------------------------------------------------------------------
results.scenarios.syntheticHover = await page.evaluate(
  args => window.__perf.syntheticDrag(args),
  { index: opts.handle, at, dx, dy, steps: opts.steps, flush: true, hover: true }
);

// ---------------------------------------------------------------------
// 3. rAF-paced drag: one pointermove per frame, driven in-page, with the
//    browser's own style/layout/paint accounting from CDP. This is the
//    number that tracks "does dragging feel bad".
// ---------------------------------------------------------------------
const metrics = await context.newCDPSession(page);
await metrics.send('Performance.enable');
const snap = async () => {
  const { metrics: m } = await metrics.send('Performance.getMetrics');
  return Object.fromEntries(m.map(e => [e.name, e.value]));
};
const before = await snap();
results.scenarios.rafDrag = await page.evaluate(
  args => window.__perf.rafDrag(args),
  { index: opts.handle, at, dx, dy, steps: opts.steps }
);
const after = await snap();
results.scenarios.rafDrag.browser = {
  scriptMs: +((after.ScriptDuration - before.ScriptDuration) * 1000).toFixed(1),
  recalcStyleMs: +(
    (after.RecalcStyleDuration - before.RecalcStyleDuration) *
    1000
  ).toFixed(1),
  layoutMs: +((after.LayoutDuration - before.LayoutDuration) * 1000).toFixed(1),
  taskMs: +((after.TaskDuration - before.TaskDuration) * 1000).toFixed(1),
  layoutCount: after.LayoutCount - before.LayoutCount,
  styleRecalcCount: after.RecalcStyleCount - before.RecalcStyleCount
};

// ---------------------------------------------------------------------
// 3b. Burst drag: several pointermoves per frame (pointer outpacing the
//     display / main thread already behind).
// ---------------------------------------------------------------------
const beforeBurst = await snap();
results.scenarios.burstDrag = await page.evaluate(
  args => window.__perf.burstDrag(args),
  { index: opts.handle, at, dx: -dx, dy: -dy, steps: opts.steps, perFrame: opts.perframe }
);
const afterBurst = await snap();
results.scenarios.burstDrag.browser = {
  scriptMs: +(
    (afterBurst.ScriptDuration - beforeBurst.ScriptDuration) *
    1000
  ).toFixed(1),
  recalcStyleMs: +(
    (afterBurst.RecalcStyleDuration - beforeBurst.RecalcStyleDuration) *
    1000
  ).toFixed(1),
  layoutMs: +(
    (afterBurst.LayoutDuration - beforeBurst.LayoutDuration) *
    1000
  ).toFixed(1),
  taskMs: +(
    (afterBurst.TaskDuration - beforeBurst.TaskDuration) *
    1000
  ).toFixed(1),
  layoutCount: afterBurst.LayoutCount - beforeBurst.LayoutCount,
  styleRecalcCount: afterBurst.RecalcStyleCount - beforeBurst.RecalcStyleCount
};

// ---------------------------------------------------------------------
// 4. Real gesture through the browser input pipeline (sanity check that
//    the same code path is hit with genuine trusted events).
// ---------------------------------------------------------------------
if (opts.profile) {
  const cdp = await context.newCDPSession(page);
  await cdp.send('Profiler.enable');
  await cdp.send('Profiler.setSamplingInterval', { interval: 100 });
  await cdp.send('Profiler.start');
  results.profiler = cdp;
}

if (opts.realinput) {
  const fresh = await page.evaluate(() => window.__perf.handles());
  const h = fresh[opts.handle];
  await page.mouse.move(h.x, h.y);
  await page.evaluate(() => window.__perf.reset());
  await page.evaluate(() => window.__perf.startFrameMonitor());
  await page.mouse.down();
  for (let i = 1; i <= opts.steps; i++) {
    await page.mouse.move(
      h.x + (dx * i) / opts.steps,
      h.y + (dy * i) / opts.steps
    );
    await page.evaluate(() =>
      new Promise(r => requestAnimationFrame(() => r()))
    );
  }
  await page.mouse.up();
  results.scenarios.realGesture = await page.evaluate(() =>
    window.__perf.stopFrameMonitor()
  );
}

if (opts.profile) {
  const { profile } = await results.profiler.send('Profiler.stop');
  const out = resolve(process.cwd(), opts.profile);
  writeFileSync(out, JSON.stringify(profile));
  console.log(`\ncpu profile written to ${out} (open in DevTools > Performance)`);
  delete results.profiler;
}

// ---------------------------------------------------------------------
// Report.
// ---------------------------------------------------------------------
const fmtHooks = x =>
  !x
    ? ''
    : ['onUpdateRequest', 'onResize']
        .filter(k => x[k])
        .map(
          k =>
            `${k}: n=${x[k].count} mean=${x[k].mean}ms p50=${x[k].p50} p95=${x[k].p95}`
        )
        .join(' | ') || 'none';

const fmt = s =>
  s ? `n=${s.count} mean=${s.mean}ms p50=${s.p50} p95=${s.p95} max=${s.max}` : 'n/a';

console.log('\n--- hover sweep (pointermove over pane content, no button) ---');
for (const [i, r] of hovers.entries()) {
  console.log(
    ` run ${i + 1}: events=${r.events} wall=${r.wallMs}ms ` +
      `handlerTotal=${r.handlerTotalMs}ms ` +
      `handlerPerEvent=${r.handlerPerEventMs}ms ` +
      `handlerCalls=${r.handlerCalls} (${r.handlerCallsPerEvent}/event) ` +
      `layoutUpdates=${r.layoutUpdates}`
  );
  console.log(`         perEvent ${fmt(r.perEventMs)}`);
}
const hsorted = hovers.slice().sort((a, b) => a.handlerTotalMs - b.handlerTotalMs);
const hmed = hsorted[Math.floor(hsorted.length / 2)];
console.log(
  ` median handlerTotal=${hmed.handlerTotalMs}ms over ${hmed.events} events ` +
    `(${hmed.handlerPerEventMs}ms/event, ${hmed.handlerCallsPerEvent} panels/event)`
);

if (synthetic.length) {
  console.log('\n--- synthetic drag (flushed, per pointermove) ---');
  for (const [i, r] of synthetic.entries()) {
    console.log(` run ${i + 1}: wall=${r.wallMs}ms  perMove ${fmt(r.perMoveMs)}`);
    console.log(`         handler ${fmt(r.pointermoveHandlerMs)}`);
    console.log(
      `         layout  ${fmt(r.layoutUpdateMs)} (updates=${r.layoutUpdates})`
    );
  }
  const best = synthetic.reduce((a, b) => (a.wallMs < b.wallMs ? a : b));
  console.log(` best wall: ${best.wallMs}ms for ${opts.steps} moves`);
}

const r = results.scenarios.rafDrag;
console.log('\n--- rAF-paced drag (1 move/frame, in-page) ---');
console.log(` wall=${r.wallMs}ms moves=${r.moves} frames=${r.frames} fps=${r.fps}`);
console.log(
  ` frameInterval ${fmt(r.frameIntervalMs)}  slowFrames(>20ms)=${r.slowFrames}`
);
console.log(` handler ${fmt(r.pointermoveHandlerMs)}`);
console.log(` layout  ${fmt(r.layoutUpdateMs)} (updates=${r.layoutUpdates})`);
console.log(`   hooks  ${fmtHooks(r.layoutByHook)}`);
console.log(
  ` browser: script=${r.browser.scriptMs}ms style=${r.browser.recalcStyleMs}ms ` +
    `layout=${r.browser.layoutMs}ms task=${r.browser.taskMs}ms ` +
    `(layouts=${r.browser.layoutCount}, styleRecalcs=${r.browser.styleRecalcCount})`
);
console.log(` longTasks=${JSON.stringify(r.longTasks)}`);

const b = results.scenarios.burstDrag;
console.log(
  `\n--- burst drag (${b.perFrame} moves/frame, in-page) ---`
);
console.log(` wall=${b.wallMs}ms moves=${b.moves} frames=${b.frames} fps=${b.fps}`);
console.log(
  ` frameInterval ${fmt(b.frameIntervalMs)}  slowFrames(>20ms)=${b.slowFrames}`
);
console.log(` handler ${fmt(b.pointermoveHandlerMs)}`);
console.log(` layout  ${fmt(b.layoutUpdateMs)} (updates=${b.layoutUpdates})`);
console.log(`   hooks  ${fmtHooks(b.layoutByHook)}`);
console.log(
  ` browser: script=${b.browser.scriptMs}ms style=${b.browser.recalcStyleMs}ms ` +
    `layout=${b.browser.layoutMs}ms task=${b.browser.taskMs}ms ` +
    `(layouts=${b.browser.layoutCount}, styleRecalcs=${b.browser.styleRecalcCount})`
);
console.log(` longTasks=${JSON.stringify(b.longTasks)}`);

const g = results.scenarios.realGesture;
if (g) {
  console.log('\n--- real gesture via CDP input (1 move/frame) ---');
  console.log(` wall=${g.wallMs}ms frames=${g.frames} fps=${g.fps}`);
  console.log(
    ` frameInterval ${fmt(g.frameIntervalMs)}  slowFrames(>20ms)=${g.slowFrames}`
  );
  console.log(` handler ${fmt(g.pointermoveHandlerMs)}`);
  console.log(` layout  ${fmt(g.layoutUpdateMs)} (updates=${g.layoutUpdates})`);
  console.log(` longTasks=${JSON.stringify(g.longTasks)}`);
}

if (opts.json) {
  const out = resolve(process.cwd(), opts.json);
  writeFileSync(out, JSON.stringify(results, null, 2));
  console.log(`\njson written to ${out}`);
}

if (opts.headed) {
  await page.waitForTimeout(3000);
}
await browser.close();
