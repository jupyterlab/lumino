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

import { StackedLayout, StackedPanel, Widget } from '@lumino/widgets';

describe('@lumino/widgets', () => {
  describe('StackedPanel', () => {
    describe('#constructor()', () => {
      it('should take no arguments', () => {
        let panel = new StackedPanel();
        expect(panel).to.be.an.instanceof(StackedPanel);
      });

      it('should take options', () => {
        let layout = new StackedLayout();
        let panel = new StackedPanel({ layout });
        expect(panel.layout).to.equal(layout);
      });

      it('should add the `lm-StackedPanel` class', () => {
        let panel = new StackedPanel();
        expect(panel.hasClass('lm-StackedPanel')).to.equal(true);
      });
    });

    describe('hiddenMode', () => {
      let panel: StackedPanel;
      let widgets: Widget[] = [];

      beforeEach(() => {
        panel = new StackedPanel();

        // Create two stacked widgets
        widgets.push(new Widget());
        panel.addWidget(widgets[0]);
        widgets.push(new Widget());
        panel.addWidget(widgets[1]);
      });

      afterEach(() => {
        panel.dispose();
      });

      it("should be 'display' mode by default", () => {
        expect(panel.hiddenMode).to.equal(Widget.HiddenMode.Display);
      });

      it("should switch to 'scale'", () => {
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

    describe('#widgetRemoved', () => {
      it('should be emitted when a widget is removed from a stacked panel', () => {
        let panel = new StackedPanel();
        let widget = new Widget();
        panel.addWidget(widget);
        panel.widgetRemoved.connect((sender, args) => {
          expect(sender).to.equal(panel);
          expect(args).to.equal(widget);
        });
        widget.parent = null;
      });
    });

    describe('#onChildAdded()', () => {
      it('should add a class to the child widget', () => {
        let panel = new StackedPanel();
        let widget = new Widget();
        panel.addWidget(widget);
        expect(widget.hasClass('lm-StackedPanel-child')).to.equal(true);
      });
    });

    describe('#onChildRemoved()', () => {
      it('should remove a class to the child widget', () => {
        let panel = new StackedPanel();
        let widget = new Widget();
        panel.addWidget(widget);
        widget.parent = null;
        expect(widget.hasClass('lm-StackedPanel-child')).to.equal(false);
      });
    });
  });
});
