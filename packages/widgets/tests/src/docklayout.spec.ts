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

    // TODO: More tests to add
    describe('#widgets()', () => {
      it.skip('should have some tests');
    });
    describe('#selectedWidgets()', () => {
      it.skip('should have some tests');
    });
    describe('#tabBars()', () => {
      it.skip('should have some tests');
    });
    describe('#moveHandle()', () => {
      it.skip('should have some tests');
    });
    describe('#saveLayout()', () => {
      it.skip('should have some tests');
    });
    describe('#restoreLayout()', () => {
      it.skip('should have some tests');
    });
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
    describe('#removeWidget()', () => {
      it.skip('should have some tests');
    });
    describe('#hitTestTabAreas()', () => {
      it.skip('should have some tests');
    });
    describe('#attachWidget()', () => {
      it.skip('should have some tests');
    });
    describe('#detachWidget()', () => {
      it.skip('should have some tests');
    });
  });
});
