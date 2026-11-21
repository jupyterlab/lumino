// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { expect, Page, test } from '@playwright/test';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';

declare global {
  interface Window {
    lumino_widgets: typeof import('@lumino/widgets');
  }
}

interface IPackage {
  main: string;
  dependencies?: Record<string, string>;
}

async function loadWidgets(page: Page): Promise<void> {
  const loaded = new Set<string>();
  async function load(name: string): Promise<void> {
    if (loaded.has(name)) {
      return;
    }
    loaded.add(name);
    const packagePath = require.resolve(`${name}/package.json`);
    const pkg: IPackage = JSON.parse(readFileSync(packagePath, 'utf8'));
    for (const dependency of Object.keys(pkg.dependencies ?? {})) {
      if (dependency.startsWith('@lumino/')) {
        await load(dependency);
      }
    }
    await page.addScriptTag({ path: join(dirname(packagePath), pkg.main) });
  }
  await load('@lumino/widgets');
  const style = join(
    dirname(require.resolve('@lumino/widgets/package.json')),
    'style'
  );
  for (const file of ['widget', 'dockpanel', 'splitpanel', 'tabbar']) {
    await page.addStyleTag({ path: join(style, `${file}.css`) });
  }
}

async function dragTouch(
  page: Page,
  start: { x: number; y: number },
  end: { x: number; y: number }
): Promise<void> {
  // Native input exercises Chromium's target selection, unlike DOM dispatch.
  const session = await page.context().newCDPSession(page);
  try {
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [start]
    });
    for (let step = 1; step <= 10; step++) {
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [
          {
            x: start.x + ((end.x - start.x) * step) / 10,
            y: start.y + ((end.y - start.y) * step) / 10
          }
        ]
      });
      await page.waitForTimeout(20);
    }
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: []
    });
  } finally {
    await session.detach();
  }
}

test.use({ hasTouch: true, viewport: { width: 1000, height: 800 } });
test.skip(
  ({ browserName }) => browserName !== 'chromium',
  'Requires native CDP touch input'
);

for (const kind of ['dock', 'split'] as const) {
  for (const orientation of ['horizontal', 'vertical'] as const) {
    test(`${kind}: touch resizing beside clickable content (${orientation})`, async ({
      page
    }) => {
      await loadWidgets(page);
      await page.addStyleTag({
        content: `
          body { margin: 0; }
          #panel { position: absolute; left: 100px; top: 50px; width: 800px; height: 600px; }
          .content { height: 100%; overflow: auto; }
          .content > div { height: 1800px; }
        `
      });
      await page.evaluate(
        ({ kind, orientation }) => {
          const { DockPanel, SplitPanel, Widget } = window.lumino_widgets;
          const panel =
            kind === 'dock'
              ? new DockPanel({ spacing: 5 })
              : new SplitPanel({ spacing: 5, orientation });
          panel.id = 'panel';
          for (let i = 0; i < 2; i++) {
            const widget = new Widget();
            widget.id = `pane-${i}`;
            widget.node.innerHTML =
              '<div class="content"><div>Panel content</div></div>';
            widget.node.addEventListener('click', () => undefined);
            if (panel instanceof DockPanel) {
              panel.addWidget(widget, {
                mode:
                  orientation === 'horizontal' ? 'split-right' : 'split-bottom'
              });
            } else {
              panel.addWidget(widget);
            }
          }
          Widget.attach(panel, document.body);
        },
        { kind, orientation }
      );
      const handle = page.locator(
        kind === 'dock'
          ? '.lm-DockPanel-handle:visible'
          : '.lm-SplitPanel-handle:visible'
      );
      const pane = page.locator('#pane-0');
      const size = () =>
        pane.evaluate(
          (node, orientation) =>
            node.getBoundingClientRect()[
              orientation === 'horizontal' ? 'width' : 'height'
            ],
          orientation
        );
      const before = await size();
      const box = (await handle.first().boundingBox())!;
      const start = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
      const end = {
        x: start.x + (orientation === 'horizontal' ? 120 : 0),
        y: start.y + (orientation === 'vertical' ? 120 : 0)
      };
      await dragTouch(page, start, end);
      await expect.poll(size).toBeGreaterThan(before + 100);

      const scroll = pane.locator('.content');
      const rect = (await scroll.boundingBox())!;
      await dragTouch(
        page,
        { x: rect.x + 50, y: rect.y + 200 },
        { x: rect.x + 50, y: rect.y + 50 }
      );
      await expect
        .poll(() => scroll.evaluate(node => node.scrollTop))
        .toBeGreaterThan(50);
    });
  }
}
