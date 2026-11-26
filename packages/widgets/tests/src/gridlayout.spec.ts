// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { expect } from 'chai';

import { MessageLoop } from '@lumino/messaging';

import { GridLayout, Widget } from '@lumino/widgets';

describe('@lumino/widgets', () => {
  describe('GridLayout', () => {
    describe('#onFitRequest()', () => {
      let parent: Widget;
      let widget: Widget;

      beforeEach(() => {
        parent = new Widget();
        let layout = new GridLayout({ fitPolicy: 'set-no-constraint' });
        widget = new Widget();
        parent.layout = layout;
        layout.addWidget(widget);
        parent.node.style.width = '300px';
        parent.node.style.height = '200px';
      });

      afterEach(() => {
        parent.dispose();
      });

      it("should fit the widgets inside a border added after the first layout with the 'set-no-constraint' fit policy", () => {
        Widget.attach(parent, document.body);
        MessageLoop.flush();
        parent.node.style.border = '1px solid';
        parent.fit();
        MessageLoop.flush();
        expect(widget.node.offsetWidth).to.equal(parent.node.clientWidth);
      });

      it("should fit the widgets inside a border added before the first show with the 'set-no-constraint' fit policy", () => {
        parent.hide();
        Widget.attach(parent, document.body);
        MessageLoop.flush();
        parent.node.style.border = '1px solid';
        parent.show();
        MessageLoop.flush();
        expect(widget.node.offsetWidth).to.equal(parent.node.clientWidth);
      });
    });
  });
});
