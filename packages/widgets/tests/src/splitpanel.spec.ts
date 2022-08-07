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

import { each, every } from '@lumino/algorithm';

import { MessageLoop } from '@lumino/messaging';

import { SplitLayout, SplitPanel, Widget } from '@lumino/widgets';

const bubbles = true;
const renderer: SplitPanel.IRenderer = {
  createHandle: () => document.createElement('div')
};

function dragHandle(panel: LogSplitPanel): void {
  MessageLoop.sendMessage(panel, Widget.Msg.UpdateRequest);
  let handle = panel.handles[0];
  let rect = handle.getBoundingClientRect();
  let args = { bubbles, clientX: rect.left + 1, clientY: rect.top + 1 };
  handle.dispatchEvent(new PointerEvent('pointerdown', args));
  args = { bubbles, clientX: rect.left + 10, clientY: rect.top + 1 };
  document.body.dispatchEvent(new PointerEvent('pointermove', args));
  document.body.dispatchEvent(new PointerEvent('pointerup', { bubbles }));
}

class LogSplitPanel extends SplitPanel {
  events: string[] = [];

  handleEvent(event: Event): void {
    super.handleEvent(event);
    this.events.push(event.type);
  }
}

describe('@lumino/widgets', () => {
  describe('SplitPanel', () => {
    describe('#constructor()', () => {
      it('should accept no arguments', () => {
        let panel = new SplitPanel();
        expect(panel).to.be.an.instanceof(SplitPanel);
      });

      it('should accept options', () => {
        let panel = new SplitPanel({
          orientation: 'vertical',
          spacing: 5,
          renderer
        });
        expect(panel.orientation).to.equal('vertical');
        expect(panel.spacing).to.equal(5);
        expect(panel.renderer).to.equal(renderer);
      });

      it('should accept a layout option', () => {
        let layout = new SplitLayout({ renderer });
        let panel = new SplitPanel({ layout });
        expect(panel.layout).to.equal(layout);
      });

      it('should ignore other options if a layout is given', () => {
        let ignored = Object.create(renderer);
        let layout = new SplitLayout({ renderer });
        let panel = new SplitPanel({
          layout,
          orientation: 'vertical',
          spacing: 5,
          renderer: ignored
        });
        expect(panel.layout).to.equal(layout);
        expect(panel.orientation).to.equal('horizontal');
        expect(panel.spacing).to.equal(4);
        expect(panel.renderer).to.equal(renderer);
      });

      it('should add the `lm-SplitPanel` class', () => {
        let panel = new SplitPanel();
        expect(panel.hasClass('lm-SplitPanel')).to.equal(true);
      });
    });

    describe('#dispose()', () => {
      it('should dispose of the resources held by the panel', () => {
        let panel = new LogSplitPanel();
        let layout = panel.layout as SplitLayout;
        let widgets = [new Widget(), new Widget(), new Widget()];
        each(widgets, w => {
          panel.addWidget(w);
        });
        Widget.attach(panel, document.body);
        let handle = layout.handles[0];
        handle.dispatchEvent(new PointerEvent('pointerdown', { bubbles }));
        expect(panel.events).to.contain('pointerdown');
        panel.node.dispatchEvent(new KeyboardEvent('keydown', { bubbles }));
        expect(panel.events).to.contain('keydown');
        let node = panel.node;
        panel.dispose();
        expect(every(widgets, w => w.isDisposed));
        node.dispatchEvent(new MouseEvent('contextmenu', { bubbles }));
        expect(panel.events).to.not.contain('contextmenu');
      });
    });

    describe('#orientation', () => {
      it('should get the layout orientation for the split panel', () => {
        let panel = new SplitPanel();
        expect(panel.orientation).to.equal('horizontal');
      });

      it('should set the layout orientation for the split panel', () => {
        let panel = new SplitPanel();
        panel.orientation = 'vertical';
        expect(panel.orientation).to.equal('vertical');
      });
    });

    describe('#spacing', () => {
      it('should default to `4`', () => {
        let panel = new SplitPanel();
        expect(panel.spacing).to.equal(4);
      });

      it('should set the spacing for the panel', () => {
        let panel = new SplitPanel();
        panel.spacing = 10;
        expect(panel.spacing).to.equal(10);
      });
    });

    describe('#renderer', () => {
      it('should get the renderer for the panel', () => {
        let panel = new SplitPanel({ renderer });
        expect(panel.renderer).to.equal(renderer);
      });
    });

    describe('#handleMoved', () => {
      it('should be emitted when a handle is moved by the user', done => {
        let panel = new LogSplitPanel();
        let widgets = [new Widget(), new Widget()];
        panel.orientation = 'horizontal';
        each(widgets, w => {
          w.node.style.minHeight = '40px';
          w.node.style.minWidth = '40px';
          panel.addWidget(w);
        });
        panel.setRelativeSizes([40, 80]);
        Widget.attach(panel, document.body);
        panel.handleMoved.connect((sender, _) => {
          expect(sender).to.equal(panel);
          done();
        });
        dragHandle(panel);
      });
    });

    describe('#handles', () => {
      it('should get the read-only sequence of the split handles in the panel', () => {
        let panel = new SplitPanel();
        let widgets = [new Widget(), new Widget(), new Widget()];
        each(widgets, w => {
          panel.addWidget(w);
        });
        expect(panel.handles.length).to.equal(3);
      });
    });

    describe('#relativeSizes()', () => {
      it('should get the current sizes of the widgets in the panel', () => {
        let panel = new SplitPanel();
        let widgets = [new Widget(), new Widget(), new Widget()];
        each(widgets, w => {
          panel.addWidget(w);
        });
        let sizes = panel.relativeSizes();
        expect(sizes).to.deep.equal([1 / 3, 1 / 3, 1 / 3]);
      });
    });

    describe('#setRelativeSizes()', () => {
      it('should set the desired sizes for the widgets in the panel', () => {
        let panel = new SplitPanel();
        let widgets = [new Widget(), new Widget(), new Widget()];
        each(widgets, w => {
          panel.addWidget(w);
        });
        panel.setRelativeSizes([10, 20, 30]);
        let sizes = panel.relativeSizes();
        expect(sizes).to.deep.equal([10 / 60, 20 / 60, 30 / 60]);
      });

      it('should ignore extra values', () => {
        let panel = new SplitPanel();
        let widgets = [new Widget(), new Widget(), new Widget()];
        each(widgets, w => {
          panel.addWidget(w);
        });
        panel.setRelativeSizes([10, 30, 40, 20]);
        let sizes = panel.relativeSizes();
        expect(sizes).to.deep.equal([10 / 80, 30 / 80, 40 / 80]);
      });
    });

    describe('#handleEvent()', () => {
      let panel: LogSplitPanel;
      let layout: SplitLayout;

      beforeEach(() => {
        panel = new LogSplitPanel();
        layout = panel.layout as SplitLayout;
        let widgets = [new Widget(), new Widget(), new Widget()];
        each(widgets, w => {
          panel.addWidget(w);
        });
        panel.setRelativeSizes([10, 10, 10, 20]);
        Widget.attach(panel, document.body);
        MessageLoop.flush();
      });

      afterEach(() => {
        panel.dispose();
      });

      context('pointerdown', () => {
        it('should attach other event listeners', () => {
          let handle = layout.handles[0];
          let body = document.body;
          handle.dispatchEvent(new PointerEvent('pointerdown', { bubbles }));
          expect(panel.events).to.contain('pointerdown');
          body.dispatchEvent(new PointerEvent('pointermove', { bubbles }));
          expect(panel.events).to.contain('pointermove');
          body.dispatchEvent(new KeyboardEvent('keydown', { bubbles }));
          expect(panel.events).to.contain('keydown');
          body.dispatchEvent(new MouseEvent('contextmenu', { bubbles }));
          expect(panel.events).to.contain('contextmenu');
          body.dispatchEvent(new PointerEvent('pointerup', { bubbles }));
          expect(panel.events).to.contain('pointerup');
        });

        it('should be a no-op if it is not the left button', () => {
          layout.handles[0].dispatchEvent(
            new PointerEvent('pointerdown', {
              bubbles,
              button: 1
            })
          );
          expect(panel.events).to.contain('pointerdown');
          document.body.dispatchEvent(
            new PointerEvent('pointermove', { bubbles })
          );
          expect(panel.events).to.not.contain('pointermove');
        });
      });

      context('pointermove', () => {
        it('should move the handle right', done => {
          let handle = layout.handles[1];
          let rect = handle.getBoundingClientRect();
          handle.dispatchEvent(new PointerEvent('pointerdown', { bubbles }));
          document.body.dispatchEvent(
            new PointerEvent('pointermove', {
              bubbles,
              clientX: rect.left + 10,
              clientY: rect.top
            })
          );
          requestAnimationFrame(() => {
            let newRect = handle.getBoundingClientRect();
            expect(newRect.left).to.not.equal(rect.left);
            done();
          });
        });

        it('should move the handle down', done => {
          panel.orientation = 'vertical';
          each(panel.widgets, w => {
            w.node.style.minHeight = '20px';
          });
          let handle = layout.handles[1];
          let rect = handle.getBoundingClientRect();
          handle.dispatchEvent(new PointerEvent('pointerdown', { bubbles }));
          document.body.dispatchEvent(
            new PointerEvent('pointermove', {
              bubbles,
              clientX: rect.left,
              clientY: rect.top - 2
            })
          );
          requestAnimationFrame(() => {
            let newRect = handle.getBoundingClientRect();
            expect(newRect.top).to.not.equal(rect.top);
            done();
          });
        });
      });

      context('pointerup', () => {
        it('should remove the event listeners', () => {
          let handle = layout.handles[0];
          let body = document.body;
          handle.dispatchEvent(new PointerEvent('pointerdown', { bubbles }));
          expect(panel.events).to.contain('pointerdown');
          body.dispatchEvent(new PointerEvent('pointerup', { bubbles }));
          expect(panel.events).to.contain('pointerup');
          body.dispatchEvent(new PointerEvent('pointermove', { bubbles }));
          expect(panel.events).to.not.contain('pointermove');
          body.dispatchEvent(new KeyboardEvent('keydown', { bubbles }));
          expect(panel.events).to.not.contain('keydown');
          body.dispatchEvent(new MouseEvent('contextmenu', { bubbles }));
          expect(panel.events).to.not.contain('contextmenu');
        });

        it('should be a no-op if not the left button', () => {
          let handle = layout.handles[0];
          let body = document.body;
          handle.dispatchEvent(new PointerEvent('pointerdown', { bubbles }));
          expect(panel.events).to.contain('pointerdown');
          body.dispatchEvent(
            new PointerEvent('pointerup', {
              bubbles,
              button: 1
            })
          );
          expect(panel.events).to.contain('pointerup');
          body.dispatchEvent(new PointerEvent('pointermove', { bubbles }));
          expect(panel.events).to.contain('pointermove');
        });
      });

      context('keydown', () => {
        it('should release the mouse if `Escape` is pressed', () => {
          let handle = layout.handles[0];
          handle.dispatchEvent(new PointerEvent('pointerdown', { bubbles }));
          panel.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              bubbles,
              keyCode: 27
            })
          );
          expect(panel.events).to.contain('keydown');
          panel.node.dispatchEvent(
            new PointerEvent('pointermove', { bubbles })
          );
          expect(panel.events).to.not.contain('pointermove');
        });
      });

      context('contextmenu', () => {
        it('should prevent events during drag', () => {
          let handle = layout.handles[0];
          handle.dispatchEvent(new PointerEvent('pointerdown', { bubbles }));
          let event = new MouseEvent('contextmenu', {
            bubbles,
            cancelable: true
          });
          let cancelled = !document.body.dispatchEvent(event);
          expect(cancelled).to.equal(true);
          expect(panel.events).to.contain('contextmenu');
        });
      });
    });

    describe('#onAfterAttach()', () => {
      it('should attach a pointerdown listener to the node', () => {
        let panel = new LogSplitPanel();
        Widget.attach(panel, document.body);
        panel.node.dispatchEvent(new PointerEvent('pointerdown', { bubbles }));
        expect(panel.events).to.contain('pointerdown');
        panel.dispose();
      });
    });

    describe('#onBeforeDetach()', () => {
      it('should remove all listeners', () => {
        let panel = new LogSplitPanel();
        Widget.attach(panel, document.body);
        panel.node.dispatchEvent(new PointerEvent('pointerdown', { bubbles }));
        expect(panel.events).to.contain('pointerdown');
        Widget.detach(panel);
        panel.events = [];
        panel.node.dispatchEvent(new PointerEvent('pointerdown', { bubbles }));
        expect(panel.events).to.not.contain('pointerdown');
        document.body.dispatchEvent(new KeyboardEvent('keyup', { bubbles }));
        expect(panel.events).to.not.contain('keyup');
      });
    });

    describe('#onChildAdded()', () => {
      it('should add a class to the child widget', () => {
        let panel = new SplitPanel();
        let widget = new Widget();
        panel.addWidget(widget);
        expect(widget.hasClass('lm-SplitPanel-child')).to.equal(true);
      });
    });

    describe('#onChildRemoved()', () => {
      it('should remove a class to the child widget', () => {
        let panel = new SplitPanel();
        let widget = new Widget();
        panel.addWidget(widget);
        widget.parent = null;
        expect(widget.hasClass('lm-SplitPanel-child')).to.equal(false);
      });
    });

    describe('.Renderer()', () => {
      describe('#createHandle()', () => {
        it('should create a new handle node', () => {
          let renderer = new SplitPanel.Renderer();
          let node1 = renderer.createHandle();
          let node2 = renderer.createHandle();
          expect(node1).to.be.an.instanceof(HTMLElement);
          expect(node2).to.be.an.instanceof(HTMLElement);
          expect(node1).to.not.equal(node2);
        });

        it('should add the "lm-SplitPanel-handle" class', () => {
          let renderer = new SplitPanel.Renderer();
          let node = renderer.createHandle();
          expect(node.classList.contains('lm-SplitPanel-handle')).to.equal(
            true
          );
        });
      });
    });

    describe('.defaultRenderer', () => {
      it('should be an instance of `Renderer`', () => {
        expect(SplitPanel.defaultRenderer).to.be.an.instanceof(
          SplitPanel.Renderer
        );
      });
    });

    describe('.getStretch()', () => {
      it('should get the split panel stretch factor for the given widget', () => {
        let widget = new Widget();
        expect(SplitPanel.getStretch(widget)).to.equal(0);
      });
    });

    describe('.setStretch()', () => {
      it('should set the split panel stretch factor for the given widget', () => {
        let widget = new Widget();
        SplitPanel.setStretch(widget, 10);
        expect(SplitPanel.getStretch(widget)).to.equal(10);
      });
    });
  });
});
