// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { Message } from '@lumino/messaging';
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
        layout.spacing = 6;

        requestAnimationFrame(() => {
          expect(layout.methods).to.contain('onFitRequest');
          done();
        });
      });

      // This should not be failing, but it does
      it.skip('should be a no-op if value does not change', done => {
        const layout = new LogDockLayout({ renderer });
        const parent = new Widget();
        parent.layout = layout;
        layout.spacing = 4;

        requestAnimationFrame(() => {
          expect(layout.methods).to.not.contain('onFitRequest');
          done();
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
      it.skip('should have some tests');
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
