// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/

import { expect } from 'chai';

import { MessageLoop } from '@lumino/messaging';

import { DockLayout, DockPanel, TabBar, Widget } from '@lumino/widgets';

const bubbles = true;

/**
 * Build a 2×2 grid `DockPanel`, sized and attached so its handles have real
 * geometry (one middle vertical bar plus two side horizontal bars).
 */
function attachedGrid(): { panel: DockPanel; widgets: Widget[] } {
  const panel = new DockPanel({ spacing: 4 });
  const widgets = [new Widget(), new Widget(), new Widget(), new Widget()];
  widgets.forEach(w => {
    w.node.style.minWidth = '40px';
    w.node.style.minHeight = '40px';
  });
  panel.addWidget(widgets[0]);
  panel.addWidget(widgets[1], { mode: 'split-right', ref: widgets[0] });
  panel.addWidget(widgets[2], { mode: 'split-bottom', ref: widgets[0] });
  panel.addWidget(widgets[3], { mode: 'split-bottom', ref: widgets[1] });
  panel.node.style.position = 'absolute';
  panel.node.style.width = '600px';
  panel.node.style.height = '600px';
  Widget.attach(panel, document.body);
  MessageLoop.flush();
  return { panel, widgets };
}

/**
 * The visible handles of a dock panel grouped by `data-orientation`.
 */
function visibleHandles(panel: DockPanel): {
  horizontal: HTMLDivElement[];
  vertical: HTMLDivElement[];
} {
  const horizontal: HTMLDivElement[] = [];
  const vertical: HTMLDivElement[] = [];
  for (const h of panel.handles()) {
    if (h.classList.contains('lm-mod-hidden')) {
      continue;
    }
    if (h.getAttribute('data-orientation') === 'horizontal') {
      horizontal.push(h);
    } else {
      vertical.push(h);
    }
  }
  return { horizontal, vertical };
}

describe('@lumino/widgets', () => {
  describe('DockPanel', () => {
    describe('#constructor()', () => {
      it('should construct a new dock panel and take no arguments', () => {
        let panel = new DockPanel();
        expect(panel).to.be.an.instanceof(DockPanel);
      });

      it('should accept options', () => {
        let renderer = Object.create(TabBar.defaultRenderer);
        let panel = new DockPanel({
          tabsMovable: true,
          renderer,
          tabsConstrained: true
        });
        for (const tabBar of panel.tabBars()) {
          expect(tabBar.tabsMovable).to.equal(true);
        }
        for (const tabBar of panel.tabBars()) {
          expect(tabBar.renderer).to.equal(renderer);
        }
      });

      it('should not have tabs constrained by default', () => {
        let panel = new DockPanel();
        expect(panel.tabsConstrained).to.equal(false);
      });

      it('should add a `lm-DockPanel` class', () => {
        let panel = new DockPanel();
        expect(panel.hasClass('lm-DockPanel')).to.equal(true);
      });

      it('should not have tabbar as child', () => {
        let panel = new DockPanel();
        // Adding a widget in the dock panel adds the DOM of a TabBar, but the TabBar
        // widget should not be a in the children list of the DockPanel widget.
        panel.addWidget(new Widget());
        for (const tabBar of panel.tabBars()) {
          expect(panel.contains(tabBar)).to.be.false;
        }
      });
    });

    describe('#dispose()', () => {
      it('should dispose of the resources held by the widget', () => {
        let panel = new DockPanel();
        panel.addWidget(new Widget());
        panel.dispose();
        expect(panel.isDisposed).to.equal(true);
        panel.dispose();
        expect(panel.isDisposed).to.equal(true);
      });
    });

    describe('#handles()', () => {
      it('should return the handles within the dock panel', () => {
        let dock = new DockPanel();
        dock.addWidget(new Widget());
        dock.addWidget(new Widget(), { mode: 'split-bottom' });
        expect(Array.from(dock.handles())).to.have.lengthOf(2); // one is hidden
        dock.dispose();
      });
    });

    describe('hiddenMode', () => {
      let panel: DockPanel;
      let widgets: Widget[] = [];

      beforeEach(() => {
        panel = new DockPanel();

        // Create two stacked widgets
        widgets.push(new Widget());
        panel.addWidget(widgets[0]);
        widgets.push(new Widget());
        panel.addWidget(widgets[1], { mode: 'tab-after' });
      });

      afterEach(() => {
        panel.dispose();
      });

      it("should be 'display' mode by default", () => {
        expect(panel.hiddenMode).to.equal(Widget.HiddenMode.Display);
      });

      it("should switch to 'scale'", () => {
        widgets[0].hiddenMode = Widget.HiddenMode.Scale;

        panel.hiddenMode = Widget.HiddenMode.Scale;

        expect(widgets[0].hiddenMode).to.equal(Widget.HiddenMode.Scale);
        expect(widgets[1].hiddenMode).to.equal(Widget.HiddenMode.Scale);
      });

      it("should switch to 'display'", () => {
        widgets[0].hiddenMode = Widget.HiddenMode.Scale;

        panel.hiddenMode = Widget.HiddenMode.Scale;
        panel.hiddenMode = Widget.HiddenMode.Display;

        expect(widgets[0].hiddenMode).to.equal(Widget.HiddenMode.Display);
        expect(widgets[1].hiddenMode).to.equal(Widget.HiddenMode.Display);
      });

      it("should not set 'scale' if only one widget", () => {
        panel.layout!.removeWidget(widgets[1]);

        panel.hiddenMode = Widget.HiddenMode.Scale;

        expect(widgets[0].hiddenMode).to.equal(Widget.HiddenMode.Display);
      });
    });

    describe('#tabsMovable', () => {
      it('should get whether tabs are movable', () => {
        let panel = new DockPanel();
        expect(panel.tabsMovable).to.equal(true);
      });

      it('should set tabsMovable of all tabs', () => {
        let panel = new DockPanel();
        let w1 = new Widget();
        let w2 = new Widget();
        panel.addWidget(w1);
        panel.addWidget(w2, { mode: 'split-right', ref: w1 });
        for (const tabBar of panel.tabBars()) {
          expect(tabBar.tabsMovable).to.equal(true);
        }

        panel.tabsMovable = false;
        for (const tabBar of panel.tabBars()) {
          expect(tabBar.tabsMovable).to.equal(false);
        }
      });
    });

    describe('group resizing', () => {
      it('should highlight an intersecting handle pair on hover', () => {
        const { panel } = attachedGrid();
        const layout = panel.layout as DockLayout;
        const { horizontal, vertical } = visibleHandles(panel);
        const primary = horizontal[0];
        const rH = primary.getBoundingClientRect();
        const rV = vertical[0].getBoundingClientRect();
        const x = (rH.left + rH.right) / 2;
        const y = (rV.top + rV.bottom) / 2;
        const peer = layout.findIntersectingHandle(primary, x, y);
        expect(peer).to.not.equal(null);

        primary.dispatchEvent(
          new PointerEvent('pointermove', { bubbles, clientX: x, clientY: y })
        );
        expect(primary.classList.contains('lm-mod-intersection')).to.equal(
          true
        );
        expect(peer!.classList.contains('lm-mod-intersection')).to.equal(true);
        panel.dispose();
      });

      it('should clear the hover highlight on pointerleave', () => {
        const { panel } = attachedGrid();
        const layout = panel.layout as DockLayout;
        const { horizontal, vertical } = visibleHandles(panel);
        const primary = horizontal[0];
        const rH = primary.getBoundingClientRect();
        const rV = vertical[0].getBoundingClientRect();
        const x = (rH.left + rH.right) / 2;
        const y = (rV.top + rV.bottom) / 2;
        const peer = layout.findIntersectingHandle(primary, x, y)!;

        primary.dispatchEvent(
          new PointerEvent('pointermove', { bubbles, clientX: x, clientY: y })
        );
        panel.node.dispatchEvent(new PointerEvent('pointerleave', { bubbles }));
        expect(primary.classList.contains('lm-mod-intersection')).to.equal(
          false
        );
        expect(peer.classList.contains('lm-mod-intersection')).to.equal(false);
        panel.dispose();
      });

      it('should move both handles when dragging an intersection', () => {
        const { panel } = attachedGrid();
        const layout = panel.layout as DockLayout;
        const { horizontal } = visibleHandles(panel);
        const primary = horizontal[0];
        const rH = primary.getBoundingClientRect();
        // Pick an intersection point on the primary handle.
        let x = (rH.left + rH.right) / 2;
        let y = 0;
        let peer: HTMLDivElement | null = null;
        for (const v of visibleHandles(panel).vertical) {
          const rV = v.getBoundingClientRect();
          const cy = (rV.top + rV.bottom) / 2;
          if (layout.findIntersectingHandle(primary, x, cy)) {
            y = cy;
            peer = layout.findIntersectingHandle(primary, x, cy);
            break;
          }
        }
        expect(peer).to.not.equal(null);

        const hLeft = primary.offsetLeft;
        const vTop = peer!.offsetTop;
        primary.dispatchEvent(
          new PointerEvent('pointerdown', { bubbles, clientX: x, clientY: y })
        );
        document.body.dispatchEvent(
          new PointerEvent('pointermove', {
            bubbles,
            clientX: x - 30,
            clientY: y + 30
          })
        );
        MessageLoop.flush();
        expect(primary.offsetLeft).to.not.equal(hLeft);
        expect(peer!.offsetTop).to.not.equal(vTop);
        document.body.dispatchEvent(new PointerEvent('pointerup', { bubbles }));
        panel.dispose();
      });

      it('should move only one handle when there is no intersection', () => {
        const { panel } = attachedGrid();
        const layout = panel.layout as DockLayout;
        const { horizontal, vertical } = visibleHandles(panel);
        const primary = horizontal[0];
        const rH = primary.getBoundingClientRect();
        const x = (rH.left + rH.right) / 2;
        // Near the top of the middle bar, away from any horizontal bar.
        const y = rH.top + 3;
        // Compare as a boolean so a failure never inspects a DOM node.
        expect(layout.findIntersectingHandle(primary, x, y) === null).to.equal(
          true
        );

        const peer = vertical[0];
        const hLeft = primary.offsetLeft;
        const vTop = peer.offsetTop;
        primary.dispatchEvent(
          new PointerEvent('pointerdown', { bubbles, clientX: x, clientY: y })
        );
        document.body.dispatchEvent(
          new PointerEvent('pointermove', {
            bubbles,
            clientX: x - 30,
            clientY: y
          })
        );
        MessageLoop.flush();
        expect(primary.offsetLeft).to.not.equal(hLeft);
        expect(peer.offsetTop).to.equal(vTop);
        document.body.dispatchEvent(new PointerEvent('pointerup', { bubbles }));
        panel.dispose();
      });
    });
  });
});
