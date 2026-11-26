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
 * Wait for the next animation frame, since hover intersection updates are
 * coalesced onto one.
 */
function nextFrame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
}

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

function center(handle: HTMLDivElement): { x: number; y: number } {
  const r = handle.getBoundingClientRect();
  return { x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2 };
}

/**
 * Assert handle identity without letting chai inspect DOM nodes on failure.
 *
 * Comparing against an attached element with `expect(...).to.equal(node)` makes
 * chai serialize the element (and its subtree) when the assertion fails, which
 * can hang or crash the test renderer. Comparing booleans avoids that.
 */
function expectSame(
  actual: HTMLDivElement | null,
  expected: HTMLDivElement | null,
  msg: string
): void {
  expect(actual === expected, msg).to.equal(true);
}

class TestOverlay implements DockPanel.IOverlay {
  readonly node = document.createElement('div');

  hidden = true;

  show(): void {
    this.hidden = false;
  }

  hide(): void {
    this.hidden = true;
  }
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

      it('should dispose of the widgets in the tab areas', () => {
        const panel = new DockPanel();
        const widgets = [new Widget(), new Widget(), new Widget()];
        let disposed = 0;
        widgets.forEach(widget => {
          widget.disposed.connect(() => {
            disposed++;
          });
        });
        panel.addWidget(widgets[0]);
        panel.addWidget(widgets[1]);
        panel.addWidget(widgets[2], { mode: 'split-right' });
        panel.dispose();
        expect(widgets.map(widget => widget.isDisposed)).to.deep.equal([
          true,
          true,
          true
        ]);
        expect(disposed).to.equal(3);
      });
    });

    describe('drag-drop overlay', () => {
      let overlay: TestOverlay;
      let panel: DockPanel;
      let descendant: HTMLElement;

      beforeEach(() => {
        overlay = new TestOverlay();
        panel = new DockPanel({ overlay });
        descendant = document.createElement('div');
        Widget.attach(panel, document.body);
        panel.node.appendChild(descendant);
        overlay.show();
      });

      afterEach(() => {
        panel.dispose();
      });

      it('should hide when a descendant handles the drop', () => {
        descendant.addEventListener('lm-drop', event => {
          event.preventDefault();
          event.stopPropagation();
        });

        descendant.dispatchEvent(
          new Event('lm-drop', { bubbles: true, cancelable: true })
        );

        expect(overlay.hidden).to.equal(true);
      });

      it('should hide when a descendant handles the drag leave', () => {
        descendant.addEventListener('lm-dragleave', event => {
          event.preventDefault();
          event.stopPropagation();
        });

        descendant.dispatchEvent(
          new Event('lm-dragleave', { bubbles: true, cancelable: true })
        );

        expect(overlay.hidden).to.equal(true);
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

    describe('#handleEvent()', () => {
      let panel: DockPanel;

      beforeEach(() => {
        panel = new DockPanel();
        let w1 = new Widget();
        let w2 = new Widget();
        panel.addWidget(w1);
        panel.addWidget(w2, { mode: 'split-right', ref: w1 });
        Widget.attach(panel, document.body);
        MessageLoop.flush();
      });

      afterEach(() => {
        Widget.detach(panel);
      });

      context('pointercancel', () => {
        it('should release the handle drag', () => {
          let handle = Array.from(panel.handles())[0];
          let rect = handle.getBoundingClientRect();
          handle.dispatchEvent(
            new PointerEvent('pointerdown', {
              bubbles,
              clientX: rect.left + 1,
              clientY: rect.top + 1
            })
          );

          // The cursor override backdrop is attached while the drag is live.
          expect(!!document.body.querySelector('.lm-cursor-backdrop')).to.equal(
            true
          );

          document.dispatchEvent(
            new PointerEvent('pointercancel', { bubbles })
          );

          // The overlay should be gone once the drag is released.
          expect(!!document.body.querySelector('.lm-cursor-backdrop')).to.equal(
            false
          );

          // The captured keydown listener should no longer be installed.
          let event = new KeyboardEvent('keydown', {
            bubbles,
            cancelable: true
          });
          document.dispatchEvent(event);
          expect(event.defaultPrevented).to.equal(false);
        });

        it('should not release the handle drag for another pointer', () => {
          let handle = Array.from(panel.handles())[0];
          let rect = handle.getBoundingClientRect();
          handle.dispatchEvent(
            new PointerEvent('pointerdown', {
              bubbles,
              pointerId: 1,
              clientX: rect.left + 1,
              clientY: rect.top + 1
            })
          );

          document.dispatchEvent(
            new PointerEvent('pointercancel', { bubbles, pointerId: 2 })
          );

          expect(!!document.body.querySelector('.lm-cursor-backdrop')).to.equal(
            true
          );
        });
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

    describe('#_findIntersectingHandle()', () => {
      /**
       * Build a `DockPanel` on a sized, attached node and lay it out so the
       * handles have real geometry. The caller chooses the widget arrangement.
       */
      function attached(
        build: (dock: DockPanel, w: Widget[]) => void,
        widgetCount: number
      ): DockPanel {
        const panel = new DockPanel({ spacing: 4 });
        const widgets: Widget[] = [];
        for (let i = 0; i < widgetCount; ++i) {
          const w = new Widget();
          w.node.style.minWidth = '40px';
          w.node.style.minHeight = '40px';
          widgets.push(w);
        }
        build(panel, widgets);
        panel.node.style.position = 'absolute';
        panel.node.style.width = '600px';
        panel.node.style.height = '600px';
        Widget.attach(panel, document.body);
        MessageLoop.flush();
        return panel;
      }

      // This 3-widget arrangement (a left column split above/below, beside a
      // right widget) yields exactly one visible horizontal-split handle (the
      // middle vertical bar) and one visible vertical-split handle (the left
      // horizontal bar) — a single, unambiguous orthogonal pair.
      function cross(): DockPanel {
        return attached((dock, w) => {
          dock.addWidget(w[0]);
          dock.addWidget(w[1], { mode: 'split-right', ref: w[0] });
          dock.addWidget(w[2], { mode: 'split-bottom', ref: w[0] });
        }, 3);
      }

      it('should return null when the panel has no handles', () => {
        const panel = new DockPanel();
        const handle = document.createElement('div');
        expectSame(
          panel['_findIntersectingHandle'](handle, 0, 0),
          null,
          'no handles → null'
        );
      });

      it('should return null when the handle has no orthogonal peer', () => {
        // A single split yields one visible handle and no orthogonal peer.
        const panel = attached((dock, w) => {
          dock.addWidget(w[0]);
          dock.addWidget(w[1], { mode: 'split-right', ref: w[0] });
        }, 2);
        const { horizontal } = visibleHandles(panel);
        const handle = horizontal[0];
        const c = center(handle);
        // Aiming at the handle itself must not return the handle (identity skip)
        // and there is no other candidate, so the result is null.
        expectSame(
          panel['_findIntersectingHandle'](handle, c.x, c.y),
          null,
          'self only → null'
        );
        panel.dispose();
      });

      it('should return the orthogonal handle under the point', () => {
        const panel = cross();
        const { horizontal, vertical } = visibleHandles(panel);
        const primary = horizontal[0];
        const peer = vertical[0];
        const c = center(peer);
        const found = panel['_findIntersectingHandle'](primary, c.x, c.y);
        expectSame(found, peer, 'orthogonal peer under point');
        panel.dispose();
      });

      it('should skip a hidden candidate', () => {
        const panel = cross();
        const { horizontal, vertical } = visibleHandles(panel);
        const primary = horizontal[0];
        const peer = vertical[0];
        const c = center(peer);
        // Sanity: the peer is found before being hidden.
        expectSame(
          panel['_findIntersectingHandle'](primary, c.x, c.y),
          peer,
          'peer found before hiding'
        );
        // Hiding the orthogonal candidate removes the match.
        vertical.forEach(h => h.classList.add('lm-mod-hidden'));
        expectSame(
          panel['_findIntersectingHandle'](primary, c.x, c.y),
          null,
          'hidden peer skipped'
        );
        panel.dispose();
      });

      it('should skip a candidate with the same orientation', () => {
        const panel = cross();
        const { horizontal, vertical } = visibleHandles(panel);
        const primary = horizontal[0];
        const peer = vertical[0];
        const c = center(peer);
        expectSame(
          panel['_findIntersectingHandle'](primary, c.x, c.y),
          peer,
          'peer found before re-tagging'
        );
        // Re-tagging the orthogonal candidate to match the primary's
        // orientation makes it ineligible.
        vertical.forEach(h => h.setAttribute('data-orientation', 'horizontal'));
        expectSame(
          panel['_findIntersectingHandle'](primary, c.x, c.y),
          null,
          'same-orientation peer skipped'
        );
        panel.dispose();
      });

      it('should honor the cross-axis tolerance band', () => {
        const panel = cross();
        const { horizontal, vertical } = visibleHandles(panel);
        // Use a vertical-bar primary (orientation 'horizontal'); the candidate
        // rect is expanded on the X axis by 8 px.
        const primary = horizontal[0];
        const peer = vertical[0];
        const r = peer.getBoundingClientRect();
        const y = (r.top + r.bottom) / 2;
        const tol = 8;
        // Just inside the expanded right edge → match.
        expectSame(
          panel['_findIntersectingHandle'](primary, r.right + tol - 2, y),
          peer,
          'within tolerance → match'
        );
        // Just beyond the expanded right edge → no match.
        expectSame(
          panel['_findIntersectingHandle'](primary, r.right + tol + 5, y),
          null,
          'beyond tolerance → null'
        );
        panel.dispose();
      });

      it('should match a peer 3 px away at zero spacing', () => {
        const panel = cross();
        panel.spacing = 0;
        MessageLoop.flush();
        const { horizontal, vertical } = visibleHandles(panel);
        const primary = horizontal[0];
        const peer = vertical[0];
        const x = primary.getBoundingClientRect().left;
        const y = peer.getBoundingClientRect().top + 3;
        expectSame(
          panel['_findIntersectingHandle'](primary, x, y),
          peer,
          'peer 3 px away → match'
        );
        panel.dispose();
      });

      it('should return the nearer of two orthogonal handles', () => {
        const panel = attached((dock, w) => {
          dock.addWidget(w[0]);
          dock.addWidget(w[1], { mode: 'split-right', ref: w[0] });
          dock.addWidget(w[2], { mode: 'split-bottom', ref: w[0] });
          dock.addWidget(w[3], { mode: 'split-bottom', ref: w[1] });
        }, 4);
        const { horizontal, vertical } = visibleHandles(panel);
        const primary = horizontal[0];
        const right = vertical.find(h => h.offsetLeft > primary.offsetLeft)!;
        // Both bars stay within the tolerance of the vertical bar.
        (panel.layout as DockLayout).moveHandle(
          right,
          right.offsetLeft,
          right.offsetTop + 10
        );
        MessageLoop.flush();
        expectSame(
          panel['_findIntersectingHandle'](
            primary,
            center(primary).x,
            center(right).y
          ),
          right,
          'nearer peer → match'
        );
        panel.dispose();
      });
    });

    describe('group resizing', () => {
      it('should highlight an intersecting handle pair on hover', async () => {
        const { panel } = attachedGrid();
        const { horizontal, vertical } = visibleHandles(panel);
        const primary = horizontal[0];
        const rH = primary.getBoundingClientRect();
        const rV = vertical[0].getBoundingClientRect();
        const x = (rH.left + rH.right) / 2;
        const y = (rV.top + rV.bottom) / 2;
        const peer = panel['_findIntersectingHandle'](primary, x, y);
        expect(peer).to.not.equal(null);

        primary.dispatchEvent(
          new PointerEvent('pointermove', { bubbles, clientX: x, clientY: y })
        );
        // The hover search is coalesced onto an animation frame.
        await nextFrame();
        expect(primary.classList.contains('lm-mod-intersection')).to.equal(
          true
        );
        expect(peer!.classList.contains('lm-mod-intersection')).to.equal(true);
        panel.dispose();
      });

      it('should find an intersection within tolerance of the peer handle thickness', () => {
        const { panel } = attachedGrid();
        const { horizontal, vertical } = visibleHandles(panel);
        const primary = horizontal[0];
        const rH = primary.getBoundingClientRect();
        const rV = vertical[0].getBoundingClientRect();
        const x = (rH.left + rH.right) / 2;
        // A few pixels above the peer handle's own thin band, but still
        // within the intersection tolerance.
        const y = rV.top - 8;
        const peer = panel['_findIntersectingHandle'](primary, x, y);
        expect(peer).to.not.equal(null);
        panel.dispose();
      });

      it('should clear the hover highlight on pointerleave', async () => {
        const { panel } = attachedGrid();
        const { horizontal, vertical } = visibleHandles(panel);
        const primary = horizontal[0];
        const rH = primary.getBoundingClientRect();
        const rV = vertical[0].getBoundingClientRect();
        const x = (rH.left + rH.right) / 2;
        const y = (rV.top + rV.bottom) / 2;
        const peer = panel['_findIntersectingHandle'](primary, x, y)!;

        primary.dispatchEvent(
          new PointerEvent('pointermove', { bubbles, clientX: x, clientY: y })
        );
        await nextFrame();
        expect(primary.classList.contains('lm-mod-intersection')).to.equal(
          true
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
          if (panel['_findIntersectingHandle'](primary, x, cy)) {
            y = cy;
            peer = panel['_findIntersectingHandle'](primary, x, cy);
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
        // Handle moves are coalesced onto an animation frame; releasing the
        // pointer applies the pending move synchronously.
        document.body.dispatchEvent(new PointerEvent('pointerup', { bubbles }));
        MessageLoop.flush();
        expect(primary.offsetLeft).to.not.equal(hLeft);
        expect(peer!.offsetTop).to.not.equal(vTop);
        panel.dispose();
      });

      it('should move only one handle when there is no intersection', () => {
        const { panel } = attachedGrid();
        const { horizontal, vertical } = visibleHandles(panel);
        const primary = horizontal[0];
        const rH = primary.getBoundingClientRect();
        const x = (rH.left + rH.right) / 2;
        // Near the top of the middle bar, away from any horizontal bar.
        const y = rH.top + 3;
        // Compare as a boolean so a failure never inspects a DOM node.
        expect(
          panel['_findIntersectingHandle'](primary, x, y) === null
        ).to.equal(true);

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
        document.body.dispatchEvent(new PointerEvent('pointerup', { bubbles }));
        MessageLoop.flush();
        expect(primary.offsetLeft).to.not.equal(hLeft);
        expect(peer.offsetTop).to.equal(vTop);
        panel.dispose();
      });

      it('should not move the crossing handles from a press 12 px from a junction', () => {
        const { panel } = attachedGrid();
        const { horizontal, vertical } = visibleHandles(panel);
        const primary = horizontal[0];
        const rH = primary.getBoundingClientRect();
        const rV = vertical[0].getBoundingClientRect();
        const x = (rH.left + rH.right) / 2;
        const y = rV.top - 12;
        const tops = vertical.map(h => h.offsetTop);
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
        document.body.dispatchEvent(new PointerEvent('pointerup', { bubbles }));
        MessageLoop.flush();
        expect(vertical.map(h => h.offsetTop)).to.deep.equal(tops);
        panel.dispose();
      });

      it('should not keep the nodes of a closed widget after a hover', async () => {
        const { panel, widgets } = attachedGrid();
        const content = document.createElement('div');
        widgets[0].node.appendChild(content);
        content.dispatchEvent(new PointerEvent('pointermove', { bubbles }));
        await nextFrame();
        widgets[0].dispose();
        const kept = [panel['_hoverTarget'], panel['_hoverChild']];
        expect(
          kept.some(node => widgets[0].node.contains(node as Node | null))
        ).to.equal(false);
        panel.dispose();
      });
    });
  });
});
