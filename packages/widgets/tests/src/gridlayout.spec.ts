// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { expect } from 'chai';

import { MessageLoop } from '@lumino/messaging';

import { GridLayout, Widget } from '@lumino/widgets';

describe('@lumino/widgets', () => {
  describe('GridLayout', () => {
    describe('#onFitRequest()', () => {
      it("should fit the widgets inside a border added after the first layout with the 'set-no-constraint' fit policy", () => {
        let parent = new Widget();
        let layout = new GridLayout({ fitPolicy: 'set-no-constraint' });
        let widget = new Widget();
        parent.layout = layout;
        layout.addWidget(widget);
        parent.node.style.width = '300px';
        parent.node.style.height = '200px';
        Widget.attach(parent, document.body);
        MessageLoop.flush();
        parent.node.style.border = '1px solid';
        parent.fit();
        MessageLoop.flush();
        expect(widget.node.offsetWidth).to.equal(parent.node.clientWidth);
        parent.dispose();
      });
    });
  });
});
