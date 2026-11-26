// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  IMessageHandler,
  IMessageHook,
  Message,
  MessageLoop
} from '@lumino/messaging';
import { DockLayout, TabBar, Widget } from '@lumino/widgets';
import { expect } from 'chai';

const renderer: DockLayout.IRenderer = {
  createTabBar: function (
    document?: Document | ShadowRoot | undefined
  ): TabBar<Widget> {
    return new TabBar();
  },
  createHandle: function (): HTMLDivElement {
    return document.createElement('div');
  }
};

const SPACING = 4;

/**
 * Build a `DockLayout` on a sized, attached parent and lay it out so the
 * handles have real geometry. The caller chooses the widget arrangement.
 */
function attachLayout(
  build: (layout: DockLayout, w: Widget[]) => void,
  widgetCount: number
): { parent: Widget; layout: DockLayout; widgets: Widget[] } {
  const layout = new DockLayout({ renderer, spacing: SPACING });
  const widgets: Widget[] = [];
  for (let i = 0; i < widgetCount; ++i) {
    const w = new Widget();
    w.node.style.minWidth = '40px';
    w.node.style.minHeight = '40px';
    widgets.push(w);
  }
  build(layout, widgets);
  const parent = new Widget();
  parent.layout = layout;
  parent.node.style.position = 'absolute';
  parent.node.style.width = '600px';
  parent.node.style.height = '600px';
  Widget.attach(parent, document.body);
  MessageLoop.flush();
  return { parent, layout, widgets };
}

/**
 * Return the visible handles of a layout grouped by `data-orientation`.
 */
function visibleHandles(layout: DockLayout): {
  horizontal: HTMLDivElement[];
  vertical: HTMLDivElement[];
} {
  const horizontal: HTMLDivElement[] = [];
  const vertical: HTMLDivElement[] = [];
  for (const h of layout.handles()) {
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

class LogDockLayout extends DockLayout {
  methods: string[] = [];

  protected init(): void {
    super.init();
    this.methods.push('init');
  }

  iter() {
    throw new Error('Method not implemented.');
  }

  protected onFitRequest(msg: Message) {
    super.onFitRequest(msg);
    this.methods.push('onFitRequest');
  }

  resetMethods() {
    this.methods = [];
  }
}

class LogHook implements IMessageHook {
  messages: string[] = [];

  messageHook(target: IMessageHandler, msg: Message): boolean {
    this.messages.push(msg.type);
    return true;
  }

  resetMessages() {
    this.messages = [];
  }
}

describe('@lumino/widgets', () => {
  describe('DockLayout', () => {
    describe('#constructor()', () => {
      it('should accept a renderer', () => {
        const layout = new DockLayout({ renderer });
        expect(layout).to.be.an.instanceOf(DockLayout);
      });

      it('should have a default spacing value', () => {
        const layout = new DockLayout({ renderer });
        expect(layout.spacing).not.to.be.null;
      });

      it('should accept a spacing value', () => {
        const layout = new DockLayout({ renderer, spacing: 6 });
        expect(layout.spacing).equal(6);
      });

      it('should normalize a spacing value to a whole number', () => {
        const layout = new DockLayout({ renderer, spacing: 5.5 });
        expect(layout.spacing).equal(5);
      });

      it('should have a default hidden mode of display', () => {
        const layout = new DockLayout({ renderer });
        expect(layout.hiddenMode).to.equal(Widget.HiddenMode.Display);
      });

      it('should have a accept hidden mode option', () => {
        const layout = new DockLayout({
          renderer,
          hiddenMode: Widget.HiddenMode.Scale
        });
        expect(layout.hiddenMode).to.equal(Widget.HiddenMode.Scale);
      });
    });

    describe('#dispose()', () => {
      it('should dispose of resources held by widget', () => {
        const layout = new DockLayout({ renderer });
        layout.addWidget(new Widget());

        layout.dispose();
        expect(layout.isDisposed).to.equal(true);

        layout.dispose();
        expect(layout.isDisposed).to.equal(true);
      });
    });

    describe('#handles()', () => {
      it('should return the handles within the layout', () => {
        const layout = new DockLayout({ renderer });
        layout.addWidget(new Widget());
        layout.addWidget(new Widget(), { mode: 'split-bottom' });
        expect(Array.from(layout.handles())).to.have.lengthOf(2);
        layout.dispose();
      });
    });

    describe('hiddenMode', () => {
      let layout: DockLayout;
      let widgets: Widget[] = [];

      beforeEach(() => {
        layout = new DockLayout({ renderer });

        // Create two stacked widgets
        widgets.push(new Widget());
        layout.addWidget(widgets[0]);
        widgets.push(new Widget());
        layout.addWidget(widgets[1], { mode: 'tab-after' });
      });

      afterEach(() => {
        layout.dispose();
      });

      it("should be 'display' mode by default", () => {
        expect(layout.hiddenMode).to.equal(Widget.HiddenMode.Display);
      });

      it("should switch to 'scale'", () => {
        widgets[0].hiddenMode = Widget.HiddenMode.Scale;

        layout.hiddenMode = Widget.HiddenMode.Scale;

        expect(widgets[0].hiddenMode).to.equal(Widget.HiddenMode.Scale);
        expect(widgets[1].hiddenMode).to.equal(Widget.HiddenMode.Scale);
      });

      it("should switch to 'display'", () => {
        widgets[0].hiddenMode = Widget.HiddenMode.Scale;

        layout.hiddenMode = Widget.HiddenMode.Scale;
        layout.hiddenMode = Widget.HiddenMode.Display;

        expect(widgets[0].hiddenMode).to.equal(Widget.HiddenMode.Display);
        expect(widgets[1].hiddenMode).to.equal(Widget.HiddenMode.Display);
      });

      it("should not set 'scale' if only one widget", () => {
        layout.removeWidget(widgets[1]);

        layout.hiddenMode = Widget.HiddenMode.Scale;

        expect(widgets[0].hiddenMode).to.equal(Widget.HiddenMode.Display);
      });

      it("should switch a single widget to 'content-visibility'", () => {
        layout.removeWidget(widgets[1]);

        layout.hiddenMode = Widget.HiddenMode.ContentVisibility;

        expect(widgets[0].hiddenMode).to.equal(
          Widget.HiddenMode.ContentVisibility
        );
      });

      it("should switch a single widget from 'content-visibility' to 'display'", () => {
        const layout = new DockLayout({
          renderer,
          hiddenMode: Widget.HiddenMode.ContentVisibility
        });
        const widget = new Widget();
        layout.addWidget(widget);

        layout.hiddenMode = Widget.HiddenMode.Display;

        expect(widget.hiddenMode).to.equal(Widget.HiddenMode.Display);

        layout.dispose();
      });

      it("should apply 'content-visibility' to the first widget", () => {
        const layout = new DockLayout({
          renderer,
          hiddenMode: Widget.HiddenMode.ContentVisibility
        });
        const widget = new Widget();

        layout.addWidget(widget);

        expect(widget.hiddenMode).to.equal(Widget.HiddenMode.ContentVisibility);

        layout.dispose();
      });

      it("should apply 'content-visibility' to subsequent widgets", () => {
        const layout = new DockLayout({
          renderer,
          hiddenMode: Widget.HiddenMode.ContentVisibility
        });
        const first = new Widget();
        const second = new Widget();

        layout.addWidget(first);
        layout.addWidget(second, { mode: 'tab-after' });

        expect(first.hiddenMode).to.equal(Widget.HiddenMode.ContentVisibility);
        expect(second.hiddenMode).to.equal(Widget.HiddenMode.ContentVisibility);

        layout.dispose();
      });

      it("should use 'display' for a single 'scale' widget", () => {
        const layout = new DockLayout({
          renderer,
          hiddenMode: Widget.HiddenMode.Scale
        });
        const first = new Widget();
        const second = new Widget();
        const third = new Widget();

        layout.addWidget(first);
        expect(first.hiddenMode).to.equal(Widget.HiddenMode.Display);

        layout.addWidget(second, { mode: 'tab-after' });
        layout.addWidget(third, { mode: 'tab-after' });

        expect(first.hiddenMode).to.equal(Widget.HiddenMode.Scale);
        expect(second.hiddenMode).to.equal(Widget.HiddenMode.Scale);
        expect(third.hiddenMode).to.equal(Widget.HiddenMode.Scale);

        layout.dispose();
      });

      it("should apply 'content-visibility' to the first widget of a split area", () => {
        const layout = new DockLayout({
          renderer,
          hiddenMode: Widget.HiddenMode.ContentVisibility
        });
        const first = new Widget();
        const second = new Widget();

        layout.addWidget(first);
        layout.addWidget(second, { ref: first, mode: 'split-right' });

        expect(first.hiddenMode).to.equal(Widget.HiddenMode.ContentVisibility);
        expect(second.hiddenMode).to.equal(Widget.HiddenMode.ContentVisibility);

        layout.dispose();
      });

      it("should apply 'scale' to single widgets which a restored layout puts in one tab area", () => {
        const layout = new DockLayout({
          renderer,
          hiddenMode: Widget.HiddenMode.Scale
        });
        const first = new Widget();
        const second = new Widget();
        layout.addWidget(first);
        layout.addWidget(second, { ref: first, mode: 'split-right' });

        layout.restoreLayout({
          main: { type: 'tab-area', widgets: [first, second], currentIndex: 0 }
        });

        expect(first.hiddenMode).to.equal(Widget.HiddenMode.Scale);
        expect(second.hiddenMode).to.equal(Widget.HiddenMode.Scale);

        layout.dispose();
      });
    });

    describe('#spacing', () => {
      it('should get spacing value', () => {
        const layout = new DockLayout({ renderer });
        expect(layout.spacing).to.not.be.an('integer');
      });

      it('should trigger a fit request on change', done => {
        const layout = new LogDockLayout({ renderer });
        const parent = new Widget();
        parent.layout = layout;
        const hook = new LogHook();
        MessageLoop.installMessageHook(parent, hook);
        requestAnimationFrame(() => {
          hook.resetMessages();
          layout.resetMethods();
          layout.spacing = layout.spacing + 1;
          requestAnimationFrame(() => {
            expect(hook.messages).to.contain('fit-request');
            expect(layout.methods).to.contain('onFitRequest');
            done();
          });
        });
      });

      // This should not be failing, but it does
      it('should be a no-op if value does not change', done => {
        const layout = new LogDockLayout({ renderer });
        const parent = new Widget();
        parent.layout = layout;
        const hook = new LogHook();
        MessageLoop.installMessageHook(parent, hook);
        requestAnimationFrame(() => {
          hook.resetMessages();
          layout.resetMethods();
          const spacing = layout.spacing;
          layout.spacing = spacing;
          requestAnimationFrame(() => {
            expect(hook.messages).to.not.contain('fit-request');
            expect(layout.methods).to.not.contain('onFitRequest');
            done();
          });
        });
      });
    });

    describe('#isEmpty()', () => {
      it('should return true for layout with no widgets', () => {
        const layout = new DockLayout({ renderer });
        expect(layout.isEmpty).to.equal(true);
      });

      it('should return false for layout with widgets', () => {
        const layout = new DockLayout({ renderer });
        layout.addWidget(new Widget());
        expect(layout.isEmpty).to.equal(false);
      });
    });

    describe('#findIntersectingHandle()', () => {
      // This 3-widget arrangement (a left column split above/below, beside a
      // right widget) yields exactly one visible horizontal-split handle (the
      // middle vertical bar) and one visible vertical-split handle (the left
      // horizontal bar) — a single, unambiguous orthogonal pair.
      function cross() {
        return attachLayout((layout, w) => {
          layout.addWidget(w[0]);
          layout.addWidget(w[1], { mode: 'split-right', ref: w[0] });
          layout.addWidget(w[2], { mode: 'split-bottom', ref: w[0] });
        }, 3);
      }

      it('should return null when the layout has no root', () => {
        const layout = new DockLayout({ renderer });
        const handle = document.createElement('div');
        expectSame(
          layout.findIntersectingHandle(handle, 0, 0),
          null,
          'no root → null'
        );
      });

      it('should return null when the handle has no orthogonal peer', () => {
        // A single split yields one visible handle and no orthogonal peer.
        const { parent, layout } = attachLayout((layout, w) => {
          layout.addWidget(w[0]);
          layout.addWidget(w[1], { mode: 'split-right', ref: w[0] });
        }, 2);
        const { horizontal } = visibleHandles(layout);
        const handle = horizontal[0];
        const c = center(handle);
        // Aiming at the handle itself must not return the handle (identity skip)
        // and there is no other candidate, so the result is null.
        expectSame(
          layout.findIntersectingHandle(handle, c.x, c.y),
          null,
          'self only → null'
        );
        parent.dispose();
      });

      it('should return the orthogonal handle under the point', () => {
        const { parent, layout } = cross();
        const { horizontal, vertical } = visibleHandles(layout);
        const primary = horizontal[0];
        const peer = vertical[0];
        const c = center(peer);
        const found = layout.findIntersectingHandle(primary, c.x, c.y);
        expectSame(found, peer, 'orthogonal peer under point');
        parent.dispose();
      });

      it('should skip a hidden candidate', () => {
        const { parent, layout } = cross();
        const { horizontal, vertical } = visibleHandles(layout);
        const primary = horizontal[0];
        const peer = vertical[0];
        const c = center(peer);
        // Sanity: the peer is found before being hidden.
        expectSame(
          layout.findIntersectingHandle(primary, c.x, c.y),
          peer,
          'peer found before hiding'
        );
        // Hiding the orthogonal candidate removes the match.
        vertical.forEach(h => h.classList.add('lm-mod-hidden'));
        expectSame(
          layout.findIntersectingHandle(primary, c.x, c.y),
          null,
          'hidden peer skipped'
        );
        parent.dispose();
      });

      it('should skip a candidate with the same orientation', () => {
        const { parent, layout } = cross();
        const { horizontal, vertical } = visibleHandles(layout);
        const primary = horizontal[0];
        const peer = vertical[0];
        const c = center(peer);
        expectSame(
          layout.findIntersectingHandle(primary, c.x, c.y),
          peer,
          'peer found before re-tagging'
        );
        // Re-tagging the orthogonal candidate to match the primary's
        // orientation makes it ineligible.
        vertical.forEach(h => h.setAttribute('data-orientation', 'horizontal'));
        expectSame(
          layout.findIntersectingHandle(primary, c.x, c.y),
          null,
          'same-orientation peer skipped'
        );
        parent.dispose();
      });

      it('should honor the cross-axis tolerance band', () => {
        const { parent, layout } = cross();
        const { horizontal, vertical } = visibleHandles(layout);
        // Use a vertical-bar primary (orientation 'horizontal'); the candidate
        // rect is expanded on the X axis by `spacing * 4`.
        const primary = horizontal[0];
        const peer = vertical[0];
        const r = peer.getBoundingClientRect();
        const y = (r.top + r.bottom) / 2;
        const tol = SPACING * 4;
        // Just inside the expanded right edge → match.
        expectSame(
          layout.findIntersectingHandle(primary, r.right + tol - 2, y),
          peer,
          'within tolerance → match'
        );
        // Just beyond the expanded right edge → no match.
        expectSame(
          layout.findIntersectingHandle(primary, r.right + tol + 5, y),
          null,
          'beyond tolerance → null'
        );
        parent.dispose();
      });

      it('should match a peer 3 px away at zero spacing', () => {
        const { parent, layout } = cross();
        layout.spacing = 0;
        MessageLoop.flush();
        const { horizontal, vertical } = visibleHandles(layout);
        const primary = horizontal[0];
        const peer = vertical[0];
        const x = primary.getBoundingClientRect().left;
        const y = peer.getBoundingClientRect().top + 3;
        expectSame(
          layout.findIntersectingHandle(primary, x, y),
          peer,
          'peer 3 px away → match'
        );
        parent.dispose();
      });

      it('should return the nearer of two orthogonal handles', () => {
        const { parent, layout } = attachLayout((layout, w) => {
          layout.addWidget(w[0]);
          layout.addWidget(w[1], { mode: 'split-right', ref: w[0] });
          layout.addWidget(w[2], { mode: 'split-bottom', ref: w[0] });
          layout.addWidget(w[3], { mode: 'split-bottom', ref: w[1] });
        }, 4);
        const { horizontal, vertical } = visibleHandles(layout);
        const primary = horizontal[0];
        const right = vertical.find(h => h.offsetLeft > primary.offsetLeft)!;
        // Both bars stay within the tolerance of the vertical bar.
        layout.moveHandle(right, right.offsetLeft, right.offsetTop + 10);
        MessageLoop.flush();
        expectSame(
          layout.findIntersectingHandle(
            primary,
            center(primary).x,
            center(right).y
          ),
          right,
          'nearer peer → match'
        );
        parent.dispose();
      });
    });

    // TODO: More tests to add
    // describe('#widgets()', () => {
    //   it.skip('should have some tests');
    // });
    // describe('#selectedWidgets()', () => {
    //   it.skip('should have some tests');
    // });
    // describe('#tabBars()', () => {
    //   it.skip('should have some tests');
    // });
    // describe('#moveHandle()', () => {
    //   it.skip('should have some tests');
    // });
    // describe('#saveLayout()', () => {
    //   it.skip('should have some tests');
    // });
    // describe('#restoreLayout()', () => {
    //   it.skip('should have some tests');
    // });
    describe('#addWidget()', () => {
      type Mode = DockLayout.InsertMode;
      it('should add widgets', () => {
        const layout = new DockLayout({ renderer });
        const widget = new Widget();
        layout.addWidget(widget);
        expect(layout['_root'].tabBar).to.exist;
        expect(layout['_root'].tabBar.titles[0].owner).to.equal(widget);
      });
      it('should add splits', () => {
        for (let i = 0, d = ['right', 'left', 'bottom', 'top']; i < 4; ++i) {
          const layout = new DockLayout({ renderer });
          const w1 = new Widget();
          const w2 = new Widget();
          layout.addWidget(w1);
          layout.addWidget(w2, { ref: w1, mode: <Mode>`split-${d[i]}` });
          expect(layout['_root'].children).to.exist;
          expect(layout['_root'].children.length).to.equal(2);
          expect(
            layout['_root'].children[0 + (i % 2)].tabBar.titles[0].owner
          ).to.equal(w1);
          expect(
            layout['_root'].children[1 - (i % 2)].tabBar.titles[0].owner
          ).to.equal(w2);
        }
      });
      it('should merge splits', () => {
        for (let i = 0, d = ['right', 'left', 'bottom', 'top']; i < 4; ++i) {
          const layout = new DockLayout({ renderer });
          const w1 = new Widget();
          const w2 = new Widget();
          const w3 = new Widget();
          layout.addWidget(w1);
          layout.addWidget(w2, { ref: w1, mode: <Mode>`merge-${d[i]}` });
          layout.addWidget(w3, { ref: w1, mode: <Mode>`merge-${d[i]}` });
          expect(layout['_root'].children).to.exist;
          expect(layout['_root'].children.length).to.equal(2);
          expect(
            layout['_root'].children[0 + (i % 2)].tabBar.titles[0].owner
          ).to.equal(w1);
          expect(
            layout['_root'].children[1 - (i % 2)].tabBar.titles[0].owner
          ).to.equal(w2);
          expect(
            layout['_root'].children[1 - (i % 2)].tabBar.titles[1].owner
          ).to.equal(w3);
        }
      });
    });
    // describe('#removeWidget()', () => {
    //   it.skip('should have some tests');
    // });
    // describe('#hitTestTabAreas()', () => {
    //   it.skip('should have some tests');
    // });
    // describe('#attachWidget()', () => {
    //   it.skip('should have some tests');
    // });
    // describe('#detachWidget()', () => {
    //   it.skip('should have some tests');
    // });
  });
});
