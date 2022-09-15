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

import { DockPanel, TabBar, Widget } from '@lumino/widgets';

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
  });
});
