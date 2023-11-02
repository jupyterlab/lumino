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

import { MimeData } from '@lumino/coreutils';

import { Drag } from '@lumino/dragdrop';

import '@lumino/dragdrop/style/index.css';

class DropTarget {
  node = document.createElement('div');

  events: string[] = [];

  constructor() {
    this.node.style.minWidth = '100px';
    this.node.style.minHeight = '100px';
    this.node.addEventListener('lm-dragenter', this);
    this.node.addEventListener('lm-dragover', this);
    this.node.addEventListener('lm-dragleave', this);
    this.node.addEventListener('lm-drop', this);
    document.body.appendChild(this.node);
  }

  dispose(): void {
    document.body.removeChild(this.node);
    this.node.removeEventListener('lm-dragenter', this);
    this.node.removeEventListener('lm-dragover', this);
    this.node.removeEventListener('lm-dragleave', this);
    this.node.removeEventListener('lm-drop', this);
  }

  handleEvent(event: Event): void {
    this.events.push(event.type);
    switch (event.type) {
      case 'lm-dragenter':
        this._evtDragEnter(event as Drag.Event);
        break;
      case 'lm-dragleave':
        this._evtDragLeave(event as Drag.Event);
        break;
      case 'lm-dragover':
        this._evtDragOver(event as Drag.Event);
        break;
      case 'lm-drop':
        this._evtDrop(event as Drag.Event);
        break;
    }
  }

  private _evtDragEnter(event: Drag.Event): void {
    event.preventDefault();
    event.stopPropagation();
  }

  private _evtDragLeave(event: Drag.Event): void {
    event.preventDefault();
    event.stopPropagation();
  }

  private _evtDragOver(event: Drag.Event): void {
    event.preventDefault();
    event.stopPropagation();
    event.dropAction = event.proposedAction;
  }

  private _evtDrop(event: Drag.Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.proposedAction === 'none') {
      event.dropAction = 'none';
      return;
    }
    event.dropAction = event.proposedAction;
  }
}

describe('@lumino/dragdrop', () => {
  describe('Drag', () => {
    describe('#constructor()', () => {
      it('should accept an options object', () => {
        let drag = new Drag({ mimeData: new MimeData() });
        expect(drag).to.be.an.instanceof(Drag);
      });

      it('should accept optional options', () => {
        let dragImage = document.createElement('i');
        let source = {};
        let mimeData = new MimeData();
        let drag = new Drag({
          mimeData,
          dragImage,
          proposedAction: 'copy',
          supportedActions: 'copy-link',
          source
        });
        expect(drag).to.be.an.instanceof(Drag);
        expect(drag.mimeData).to.equal(mimeData);
        expect(drag.dragImage).to.equal(dragImage);
        expect(drag.proposedAction).to.equal('copy');
        expect(drag.supportedActions).to.equal('copy-link');
        expect(drag.source).to.equal(source);
      });
    });

    describe('#dispose()', () => {
      it('should dispose of the resources held by the drag object', () => {
        let drag = new Drag({ mimeData: new MimeData() });
        drag.dispose();
        expect(drag.isDisposed).to.equal(true);
      });

      it('should cancel the drag operation if it is active', done => {
        let drag = new Drag({ mimeData: new MimeData() });
        drag.start(0, 0).then(action => {
          expect(action).to.equal('none');
          done();
        });
        drag.dispose();
      });

      it('should be a no-op if already disposed', () => {
        let drag = new Drag({ mimeData: new MimeData() });
        drag.dispose();
        drag.dispose();
        expect(drag.isDisposed).to.equal(true);
      });
    });

    describe('#isDisposed()', () => {
      it('should test whether the drag object is disposed', () => {
        let drag = new Drag({ mimeData: new MimeData() });
        expect(drag.isDisposed).to.equal(false);
        drag.dispose();
        expect(drag.isDisposed).to.equal(true);
      });
    });

    describe('#mimeData', () => {
      it('should get the mime data for the drag object', () => {
        let mimeData = new MimeData();
        let drag = new Drag({ mimeData });
        expect(drag.mimeData).to.equal(mimeData);
      });
    });

    describe('#dragImage', () => {
      it('should get the drag image element for the drag object', () => {
        let dragImage = document.createElement('i');
        let drag = new Drag({ mimeData: new MimeData(), dragImage });
        expect(drag.dragImage).to.equal(dragImage);
      });

      it('should default to `null`', () => {
        let drag = new Drag({ mimeData: new MimeData() });
        expect(drag.dragImage).to.equal(null);
      });
    });

    describe('#proposedAction', () => {
      it('should get the proposed drop action for the drag object', () => {
        let drag = new Drag({
          mimeData: new MimeData(),
          proposedAction: 'link'
        });
        expect(drag.proposedAction).to.equal('link');
      });

      it("should default to `'copy'`", () => {
        let drag = new Drag({ mimeData: new MimeData() });
        expect(drag.proposedAction).to.equal('copy');
      });
    });

    describe('#supportedActions', () => {
      it('should get the supported drop actions for the drag object', () => {
        let drag = new Drag({
          mimeData: new MimeData(),
          supportedActions: 'copy-move'
        });
        expect(drag.supportedActions).to.equal('copy-move');
      });

      it("should default to `'all'`", () => {
        let drag = new Drag({ mimeData: new MimeData() });
        expect(drag.supportedActions).to.equal('all');
      });
    });

    describe('#source', () => {
      it('should get the drag source for the drag object', () => {
        let source = {};
        let drag = new Drag({ mimeData: new MimeData(), source });
        expect(drag.source).to.equal(source);
      });

      it('should default to `null`', () => {
        let drag = new Drag({ mimeData: new MimeData() });
        expect(drag.source).to.equal(null);
      });
    });

    describe('#start()', () => {
      it('should start the drag operation at the specified client position', () => {
        let dragImage = document.createElement('span');
        dragImage.style.minHeight = '10px';
        dragImage.style.minWidth = '10px';
        let drag = new Drag({ mimeData: new MimeData(), dragImage });
        drag.start(10, 20);
        expect(dragImage.style.transform).to.equal(`translate(10px, 20px)`);
        drag.dispose();
      });

      it('should return a previous promise if a drag has already been started', () => {
        let drag = new Drag({ mimeData: new MimeData() });
        let promise = drag.start(0, 0);
        expect(drag.start(10, 10)).to.equal(promise);
        drag.dispose();
      });

      it("should resolve to `'none'` if the drag operation has been disposed", done => {
        let drag = new Drag({ mimeData: new MimeData() });
        drag.start(0, 0).then(action => {
          expect(action).to.equal('none');
          done();
        });
        drag.dispose();
      });
    });

    context('Event Handling', () => {
      let drag: Drag = null!;
      let child0: DropTarget = null!;
      let child1: DropTarget = null!;

      beforeEach(() => {
        child0 = new DropTarget();
        child1 = new DropTarget();

        let dragImage = document.createElement('div');
        dragImage.style.minHeight = '10px';
        dragImage.style.minWidth = '10px';

        drag = new Drag({ mimeData: new MimeData(), dragImage });
        drag.start(0, 0);
      });

      afterEach(() => {
        drag.dispose();
        child0.dispose();
        child1.dispose();
      });

      describe('pointermove', () => {
        it('should be prevented during a drag event', () => {
          let event = new PointerEvent('pointermove', { cancelable: true });
          let canceled = !document.body.dispatchEvent(event);
          expect(canceled).to.equal(true);
        });

        it('should dispatch an enter and leave events', () => {
          let rect = child0.node.getBoundingClientRect();
          child0.node.dispatchEvent(
            new PointerEvent('pointermove', {
              clientX: rect.left + 1,
              clientY: rect.top + 1
            })
          );
          expect(child0.events).to.contain('lm-dragenter');
          child0.events = [];
          rect = child1.node.getBoundingClientRect();
          child1.node.dispatchEvent(
            new PointerEvent('pointermove', {
              clientX: rect.left + 1,
              clientY: rect.top + 1
            })
          );
          expect(child0.events).to.contain('lm-dragleave');
          expect(child1.events).to.contain('lm-dragenter');
        });

        it('should dispatch drag over event', () => {
          let rect = child0.node.getBoundingClientRect();
          child0.node.dispatchEvent(
            new PointerEvent('pointermove', {
              clientX: rect.left + 1,
              clientY: rect.top + 1
            })
          );
          expect(child0.events).to.contain('lm-dragover');
        });

        it('should move the drag image to the client location', () => {
          let rect = child0.node.getBoundingClientRect();
          child0.node.dispatchEvent(
            new PointerEvent('pointermove', {
              clientX: rect.left + 1,
              clientY: rect.top + 1
            })
          );
          let image = drag.dragImage!;
          expect(image.style.transform).to.equal(
            `translate(${rect.left + 1}px, ${rect.top + 1}px)`
          );
        });
      });

      describe('pointerup', () => {
        it('should be prevented during a drag event', () => {
          let event = new PointerEvent('pointerup', { cancelable: true });
          let canceled = !document.body.dispatchEvent(event);
          expect(canceled).to.equal(true);
        });

        it('should do nothing if the left button is not released', () => {
          let rect = child0.node.getBoundingClientRect();
          child0.node.dispatchEvent(
            new PointerEvent('pointerup', {
              clientX: rect.left + 1,
              clientY: rect.top + 1,
              button: 1
            })
          );
          expect(child0.events).to.not.contain('lm-dragenter');
        });

        it('should dispatch enter and leave events', () => {
          let rect = child0.node.getBoundingClientRect();
          child0.node.dispatchEvent(
            new PointerEvent('pointermove', {
              clientX: rect.left + 1,
              clientY: rect.top + 1
            })
          );
          expect(child0.events).to.contain('lm-dragenter');
          child0.events = [];
          rect = child1.node.getBoundingClientRect();
          child1.node.dispatchEvent(
            new PointerEvent('pointerup', {
              clientX: rect.left + 1,
              clientY: rect.top + 1
            })
          );
          expect(child0.events).to.contain('lm-dragleave');
          expect(child1.events).to.contain('lm-dragenter');
        });

        it("should dispatch a leave event if the last drop action was `'none'", () => {
          drag.dispose();
          drag = new Drag({
            mimeData: new MimeData(),
            supportedActions: 'none'
          });
          drag.start(0, 0);
          let rect = child0.node.getBoundingClientRect();
          child0.node.dispatchEvent(
            new PointerEvent('pointerup', {
              clientX: rect.left + 1,
              clientY: rect.top + 1
            })
          );
          expect(child0.events).to.contain('lm-dragleave');
        });

        it("should finalize the drag with `'none' if the last drop action was `'none`", done => {
          drag.dispose();
          drag = new Drag({
            mimeData: new MimeData(),
            supportedActions: 'none'
          });
          drag.start(0, 0).then(action => {
            expect(action).to.equal('none');
            done();
          });
          let rect = child0.node.getBoundingClientRect();
          child0.node.dispatchEvent(
            new PointerEvent('pointerup', {
              clientX: rect.left + 1,
              clientY: rect.top + 1
            })
          );
        });

        it('should dispatch the drop event at the current target', () => {
          let rect = child0.node.getBoundingClientRect();
          child0.node.dispatchEvent(
            new PointerEvent('pointerup', {
              clientX: rect.left + 1,
              clientY: rect.top + 1
            })
          );
          expect(child0.events).to.contain('lm-drop');
        });

        it('should resolve with the drop action', done => {
          drag.dispose();
          drag = new Drag({
            mimeData: new MimeData(),
            proposedAction: 'link',
            supportedActions: 'link'
          });
          drag.start(0, 0).then(action => {
            expect(action).to.equal('link');
            done();
          });
          let rect = child0.node.getBoundingClientRect();
          child0.node.dispatchEvent(
            new PointerEvent('pointerup', {
              clientX: rect.left + 1,
              clientY: rect.top + 1
            })
          );
        });

        it('should handle a `move` action', done => {
          drag.dispose();
          drag = new Drag({
            mimeData: new MimeData(),
            proposedAction: 'move',
            supportedActions: 'copy-move'
          });
          drag.start(0, 0).then(action => {
            expect(action).to.equal('move');
            done();
          });
          let rect = child0.node.getBoundingClientRect();
          child0.node.dispatchEvent(
            new PointerEvent('pointerup', {
              clientX: rect.left + 1,
              clientY: rect.top + 1
            })
          );
        });

        it('should dispose of the drop', () => {
          let rect = child0.node.getBoundingClientRect();
          child0.node.dispatchEvent(
            new PointerEvent('pointerup', {
              clientX: rect.left + 1,
              clientY: rect.top + 1
            })
          );
          expect(drag.isDisposed).to.equal(true);
        });

        it('should detach the drag image', () => {
          let image = drag.dragImage!;
          let rect = child0.node.getBoundingClientRect();
          child0.node.dispatchEvent(
            new PointerEvent('pointerup', {
              clientX: rect.left + 1,
              clientY: rect.top + 1
            })
          );
          expect(document.body.contains(image)).to.equal(false);
        });

        it('should remove event listeners', () => {
          let rect = child0.node.getBoundingClientRect();
          child0.node.dispatchEvent(
            new PointerEvent('pointerup', {
              clientX: rect.left + 1,
              clientY: rect.top + 1
            })
          );
          ['pointermove', 'keydown', 'contextmenu'].forEach(name => {
            let event = new Event(name, { cancelable: true });
            let canceled = !document.body.dispatchEvent(event);
            expect(canceled).to.equal(false);
          });
        });
      });

      describe('keydown', () => {
        it('should be prevented during a drag event', () => {
          let event = new KeyboardEvent('keydown', { cancelable: true });
          let canceled = !document.body.dispatchEvent(event);
          expect(canceled).to.equal(true);
        });

        it('should dispose of the drag if `Escape` is pressed', () => {
          let event = new KeyboardEvent('keydown', {
            cancelable: true,
            keyCode: 27
          });
          document.body.dispatchEvent(event);
          expect(drag.isDisposed).to.equal(true);
        });
      });

      describe('pointerenter', () => {
        it('should be prevented during a drag event', () => {
          let event = new PointerEvent('pointerenter', { cancelable: true });
          let canceled = !document.body.dispatchEvent(event);
          expect(canceled).to.equal(true);
        });
      });

      describe('pointerleave', () => {
        it('should be prevented during a drag event', () => {
          let event = new PointerEvent('pointerleave', { cancelable: true });
          let canceled = !document.body.dispatchEvent(event);
          expect(canceled).to.equal(true);
        });
      });

      describe('pointerover', () => {
        it('should be prevented during a drag event', () => {
          let event = new PointerEvent('pointerover', { cancelable: true });
          let canceled = !document.body.dispatchEvent(event);
          expect(canceled).to.equal(true);
        });
      });

      describe('pointerout', () => {
        it('should be prevented during a drag event', () => {
          let event = new PointerEvent('pointerout', { cancelable: true });
          let canceled = !document.body.dispatchEvent(event);
          expect(canceled).to.equal(true);
        });
      });

      describe('keyup', () => {
        it('should be prevented during a drag event', () => {
          let event = new KeyboardEvent('keyup', { cancelable: true });
          let canceled = !document.body.dispatchEvent(event);
          expect(canceled).to.equal(true);
        });
      });

      describe('keypress', () => {
        it('should be prevented during a drag event', () => {
          let event = new KeyboardEvent('keypress', { cancelable: true });
          let canceled = !document.body.dispatchEvent(event);
          expect(canceled).to.equal(true);
        });
      });

      describe('contextmenu', () => {
        it('should be prevented during a drag event', () => {
          let event = new MouseEvent('contextmenu', { cancelable: true });
          let canceled = !document.body.dispatchEvent(event);
          expect(canceled).to.equal(true);
        });
      });
    });

    describe('.overrideCursor()', () => {
      it('should attach a backdrop with `cursor` style', () => {
        expect(document.querySelector('.lm-cursor-backdrop')).to.equal(null);
        let override = Drag.overrideCursor('wait');
        const backdrop = document.querySelector(
          '.lm-cursor-backdrop'
        ) as HTMLElement;
        expect(backdrop.style.cursor).to.equal('wait');
        override.dispose();
      });

      it('should detach the backdrop when disposed', () => {
        expect(document.querySelector('.lm-cursor-backdrop')).to.equal(null);
        let override = Drag.overrideCursor('wait');
        expect(document.querySelector('.lm-cursor-backdrop')).to.not.equal(
          null
        );
        override.dispose();
        expect(document.querySelector('.lm-cursor-backdrop')).to.equal(null);
      });

      it('should respect the most recent override', () => {
        let one = Drag.overrideCursor('wait');
        const backdrop = document.querySelector(
          '.lm-cursor-backdrop'
        ) as HTMLElement;
        expect(backdrop.style.cursor).to.equal('wait');
        expect(backdrop.isConnected).to.equal(true);
        let two = Drag.overrideCursor('default');
        expect(backdrop.style.cursor).to.equal('default');
        expect(backdrop.isConnected).to.equal(true);
        let three = Drag.overrideCursor('cell');
        expect(backdrop.style.cursor).to.equal('cell');
        expect(backdrop.isConnected).to.equal(true);
        two.dispose();
        expect(backdrop.style.cursor).to.equal('cell');
        expect(backdrop.isConnected).to.equal(true);
        one.dispose();
        expect(backdrop.style.cursor).to.equal('cell');
        expect(backdrop.isConnected).to.equal(true);
        three.dispose();
        expect(backdrop.isConnected).to.equal(false);
      });

      it('should move backdrop with pointer', () => {
        let override = Drag.overrideCursor('wait');
        const backdrop = document.querySelector(
          '.lm-cursor-backdrop'
        ) as HTMLElement;
        document.dispatchEvent(
          new PointerEvent('pointermove', {
            clientX: 100,
            clientY: 500
          })
        );
        expect(backdrop.style.transform).to.equal('translate(100px, 500px)');
        override.dispose();
      });

      it('should propagate scroll to underlying target', () => {
        let override = Drag.overrideCursor('wait');
        const backdrop = document.querySelector(
          '.lm-cursor-backdrop'
        ) as HTMLElement;

        const wrapper = document.createElement('div');
        const content = document.createElement('div');
        document.elementFromPoint = (_x, _y) => {
          return wrapper;
        };
        document.body.appendChild(wrapper);
        wrapper.appendChild(content);
        wrapper.setAttribute('data-lm-dragscroll', 'true');
        wrapper.style.overflow = 'scroll';
        wrapper.style.height = '100px';
        wrapper.style.width = '100px';
        content.style.height = '2000px';
        content.style.width = '2000px';

        backdrop.scrollTop += 400;
        backdrop.dispatchEvent(new Event('scroll'));
        expect(wrapper.scrollTop).to.equal(400);

        backdrop.scrollTop += 400;
        backdrop.dispatchEvent(new Event('scroll'));
        expect(wrapper.scrollTop).to.equal(800);

        override.dispose();
        document.body.removeChild(wrapper);
      });
    });
  });
});
