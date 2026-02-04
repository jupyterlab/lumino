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

import { range } from '@lumino/algorithm';

import { Message, MessageLoop } from '@lumino/messaging';

import { TabBar, Title, Widget } from '@lumino/widgets';

import { VirtualDOM, VirtualElement } from '@lumino/virtualdom';

class LogTabBar extends TabBar<Widget> {
  events: string[] = [];

  methods: string[] = [];

  handleEvent(event: Event): void {
    super.handleEvent(event);
    this.events.push(event.type);
  }

  protected onBeforeAttach(msg: Message): void {
    super.onBeforeAttach(msg);
    this.methods.push('onBeforeAttach');
  }

  protected onAfterDetach(msg: Message): void {
    super.onAfterDetach(msg);
    this.methods.push('onAfterDetach');
  }

  protected onUpdateRequest(msg: Message): void {
    super.onUpdateRequest(msg);
    this.methods.push('onUpdateRequest');
  }
}

function populateBar(bar: TabBar<Widget>): void {
  // Add some tabs with labels.
  for (const i of range(3)) {
    let widget = new Widget();
    widget.title.label = `Test - ${i}`;
    widget.title.closable = true;
    bar.addTab(widget.title);
  }
  // Force the tabs to render
  MessageLoop.sendMessage(bar, Widget.Msg.UpdateRequest);
  // Add the close icon content.
  for (const i of range(3)) {
    let tab = bar.contentNode.children[i];
    let icon = tab.querySelector(bar.renderer.closeIconSelector);
    icon!.textContent = 'X';
  }
}

type Action = 'pointerdown' | 'pointermove' | 'pointerup' | 'dblclick';

type Direction = 'left' | 'right' | 'up' | 'down';

function startDrag(
  bar: LogTabBar,
  index = 0,
  direction: Direction = 'right'
): void {
  bar.tabsMovable = true;
  let tab = bar.contentNode.children[index] as HTMLElement;
  bar.currentIndex = index;
  // Force an update.
  MessageLoop.sendMessage(bar, Widget.Msg.UpdateRequest);
  let called = false;
  bar.tabDetachRequested.connect((sender, args) => {
    called = true;
  });
  let rect = bar.contentNode.getBoundingClientRect();
  let args: any;
  switch (direction) {
    case 'left':
      args = { clientX: rect.left - 200, clientY: rect.top };
      break;
    case 'up':
      args = { clientX: rect.left, clientY: rect.top - 200 };
      break;
    case 'down':
      args = { clientX: rect.left, clientY: rect.bottom + 200 };
      break;
    default:
      args = { clientX: rect.right + 200, clientY: rect.top };
      break;
  }
  simulateOnNode(tab, 'pointerdown');
  document.body.dispatchEvent(
    new PointerEvent('pointermove', {
      ...args,
      cancelable: true
    })
  );
  expect(called).to.equal(true);
  bar.events = [];
}

function simulateOnNode(node: Element, action: Action): void {
  let rect = node.getBoundingClientRect();
  node.dispatchEvent(
    new PointerEvent(action, {
      clientX: rect.left + 1,
      clientY: rect.top + 1,
      cancelable: true,
      bubbles: true
    })
  );
}

describe('@lumino/widgets', () => {
  describe('TabBar', () => {
    let bar: LogTabBar;

    beforeEach(() => {
      bar = new LogTabBar();
      Widget.attach(bar, document.body);
    });

    afterEach(() => {
      bar.dispose();
    });

    describe('#constructor()', () => {
      it('should take no arguments', () => {
        let newBar = new TabBar<Widget>();
        expect(newBar).to.be.an.instanceof(TabBar);
      });

      it('should take an options argument', () => {
        let renderer = new TabBar.Renderer();
        let newBar = new TabBar<Widget>({
          orientation: 'horizontal',
          tabsMovable: true,
          allowDeselect: true,
          addButtonEnabled: true,
          insertBehavior: 'select-tab',
          removeBehavior: 'select-previous-tab',
          renderer
        });
        expect(newBar).to.be.an.instanceof(TabBar);
        expect(newBar.tabsMovable).to.equal(true);
        expect(newBar.renderer).to.equal(renderer);
        expect(newBar.addButtonEnabled).to.equal(true);
      });

      it('should add the `lm-TabBar` class', () => {
        let newBar = new TabBar<Widget>();
        expect(newBar.hasClass('lm-TabBar')).to.equal(true);
      });
    });

    describe('#dispose()', () => {
      it('should dispose of the resources held by the widget', () => {
        bar.dispose();
        expect(bar.isDisposed).to.equal(true);
        bar.dispose();
        expect(bar.isDisposed).to.equal(true);
      });
    });

    describe('#currentChanged', () => {
      it('should be emitted when the current tab is changed', () => {
        populateBar(bar);
        let called = false;
        let titles = bar.titles;
        bar.currentChanged.connect((sender, args) => {
          expect(sender).to.equal(bar);
          expect(args.previousIndex).to.equal(0);
          expect(args.previousTitle).to.equal(titles[0]);
          expect(args.currentIndex).to.equal(1);
          expect(args.currentTitle).to.equal(titles[1]);
          called = true;
        });
        bar.currentTitle = titles[1];
        expect(called).to.equal(true);
      });

      it('should not be emitted when another tab is inserted', () => {
        populateBar(bar);
        let called = false;
        bar.currentChanged.connect((sender, args) => {
          called = true;
        });
        let widget = new Widget();
        bar.insertTab(0, widget.title);
        expect(called).to.equal(false);
      });

      it('should not be emitted when another tab is removed', () => {
        populateBar(bar);
        let called = false;
        bar.currentIndex = 1;
        bar.currentChanged.connect((sender, args) => {
          called = true;
        });
        bar.removeTab(bar.titles[0]);
        expect(called).to.equal(false);
      });

      it('should not be emitted when the current tab is moved', () => {
        populateBar(bar);
        let called = false;
        bar.currentChanged.connect((sender, args) => {
          called = true;
        });
        bar.insertTab(2, bar.titles[0]);
        expect(called).to.equal(false);
      });
    });

    describe('#tabMoved', () => {
      it('should be emitted when a tab is moved right by the user', done => {
        populateBar(bar);
        let titles = bar.titles.slice();
        bar.tabMoved.connect((sender, args) => {
          expect(sender).to.equal(bar);
          expect(args.fromIndex).to.equal(0);
          expect(args.toIndex).to.equal(2);
          expect(args.title).to.equal(titles[0]);
          done();
        });
        startDrag(bar);
        document.body.dispatchEvent(
          new PointerEvent('pointerup', {
            cancelable: true
          })
        );
      });

      it('should be emitted when a tab is moved left by the user', done => {
        populateBar(bar);
        let titles = bar.titles.slice();
        bar.tabMoved.connect((sender, args) => {
          expect(sender).to.equal(bar);
          expect(args.fromIndex).to.equal(2);
          expect(args.toIndex).to.equal(0);
          expect(args.title).to.equal(titles[2]);
          done();
        });
        startDrag(bar, 2, 'left');
        document.body.dispatchEvent(new PointerEvent('pointerup'));
      });

      it('should not be emitted when a tab is moved programmatically', () => {
        populateBar(bar);
        let called = false;
        bar.tabMoved.connect((sender, args) => {
          called = true;
        });
        bar.insertTab(2, bar.titles[0]);
        expect(called).to.equal(false);
      });
    });

    describe('#tabActivateRequested', () => {
      let tab: HTMLElement;

      beforeEach(() => {
        populateBar(bar);
        bar.tabsMovable = false;
        tab = bar.contentNode.getElementsByClassName(
          'lm-TabBar-tab'
        )[2] as HTMLElement;
      });

      it('should be emitted when a tab is left pressed by the user', () => {
        let called = false;
        bar.currentIndex = 0;
        // Force an update.
        MessageLoop.sendMessage(bar, Widget.Msg.UpdateRequest);
        bar.tabActivateRequested.connect((sender, args) => {
          expect(sender).to.equal(bar);
          expect(args.index).to.equal(2);
          expect(args.title).to.equal(bar.titles[2]);
          called = true;
        });
        simulateOnNode(tab, 'pointerdown');
        expect(called).to.equal(true);
      });

      it('should make the tab current and emit the `currentChanged` signal', () => {
        let called = 0;
        bar.currentIndex = 1;
        // Force an update.
        MessageLoop.sendMessage(bar, Widget.Msg.UpdateRequest);
        bar.tabActivateRequested.connect(() => {
          called++;
        });
        bar.currentChanged.connect(() => {
          called++;
        });
        simulateOnNode(tab, 'pointerdown');
        expect(bar.currentIndex).to.equal(2);
        expect(called).to.equal(2);
      });

      it('should emit even if the pressed tab is the current tab', () => {
        let called = false;
        bar.currentIndex = 2;
        // Force an update.
        MessageLoop.sendMessage(bar, Widget.Msg.UpdateRequest);
        bar.tabActivateRequested.connect(() => {
          called = true;
        });
        simulateOnNode(tab, 'pointerdown');
        expect(bar.currentIndex).to.equal(2);
        expect(called).to.equal(true);
      });
    });

    describe('#tabCloseRequested', () => {
      let tab: Element;
      let closeIcon: Element;

      beforeEach(() => {
        populateBar(bar);
        bar.currentIndex = 0;
        tab = bar.contentNode.children[0];
        closeIcon = tab.querySelector(bar.renderer.closeIconSelector)!;
      });

      it('should be emitted when a tab close icon is left clicked', () => {
        let called = false;
        let rect = closeIcon.getBoundingClientRect();
        bar.tabCloseRequested.connect((sender, args) => {
          expect(sender).to.equal(bar);
          expect(args.index).to.equal(0);
          expect(args.title).to.equal(bar.titles[0]);
          called = true;
        });
        closeIcon.dispatchEvent(
          new PointerEvent('pointerdown', {
            clientX: rect.left + 1,
            clientY: rect.top + 1,
            button: 0,
            bubbles: true
          })
        );
        closeIcon.dispatchEvent(
          new PointerEvent('pointerup', {
            clientX: rect.left + 1,
            clientY: rect.top + 1,
            button: 0
          })
        );
        expect(called).to.equal(true);
      });

      it('should be emitted when a tab is middle clicked', () => {
        let called = false;
        let rect = tab.getBoundingClientRect();
        bar.tabCloseRequested.connect((sender, args) => {
          expect(sender).to.equal(bar);
          expect(args.index).to.equal(0);
          expect(args.title).to.equal(bar.titles[0]);
          called = true;
        });
        tab.dispatchEvent(
          new PointerEvent('pointerdown', {
            clientX: rect.left + 1,
            clientY: rect.top + 1,
            button: 1,
            bubbles: true
          })
        );
        tab.dispatchEvent(
          new PointerEvent('pointerup', {
            clientX: rect.left + 1,
            clientY: rect.top + 1,
            button: 1
          })
        );
        expect(called).to.equal(true);
      });

      it('should not be emitted if the tab title is not `closable`', () => {
        let called = false;
        let title = bar.titles[0];
        title.closable = false;
        bar.tabCloseRequested.connect((sender, args) => {
          expect(sender).to.equal(bar);
          expect(args.index).to.equal(0);
          expect(args.title).to.equal(bar.titles[0]);
          called = true;
        });
        let rect1 = closeIcon.getBoundingClientRect();
        let rect2 = tab.getBoundingClientRect();
        closeIcon.dispatchEvent(
          new PointerEvent('pointerdown', {
            clientX: rect1.left + 1,
            clientY: rect1.top + 1,
            button: 0,
            cancelable: true
          })
        );
        closeIcon.dispatchEvent(
          new PointerEvent('pointerup', {
            clientX: rect1.left + 1,
            clientY: rect1.top + 1,
            button: 0,
            cancelable: true
          })
        );
        tab.dispatchEvent(
          new PointerEvent('pointerdown', {
            clientX: rect2.left + 1,
            clientY: rect2.top + 1,
            button: 1,
            cancelable: true
          })
        );
        tab.dispatchEvent(
          new PointerEvent('pointerup', {
            clientX: rect2.left + 1,
            clientY: rect2.top + 1,
            button: 1,
            cancelable: true
          })
        );
        expect(called).to.equal(false);
      });
    });

    describe('#addRequested', () => {
      let addButton: Element;

      beforeEach(() => {
        populateBar(bar);
        bar.currentIndex = 0;
        addButton = bar.addButtonNode;
      });

      it('should be emitted when the add button is clicked', () => {
        bar.addButtonEnabled = true;
        let called = false;
        let rect = addButton.getBoundingClientRect();
        bar.addRequested.connect((sender, args) => {
          expect(sender).to.equal(bar);
          expect(args).to.equal(undefined);
          called = true;
        });
        addButton.dispatchEvent(
          new PointerEvent('pointerdown', {
            clientX: rect.left + 1,
            clientY: rect.top + 1,
            button: 0,
            bubbles: true
          })
        );
        addButton.dispatchEvent(
          new PointerEvent('pointerup', {
            clientX: rect.left + 1,
            clientY: rect.top + 1,
            button: 0
          })
        );
        expect(called).to.equal(true);
      });

      it('should not be emitted if addButtonEnabled is `false`', () => {
        bar.addButtonEnabled = false;
        let called = false;
        let rect = addButton.getBoundingClientRect();
        bar.addRequested.connect((sender, args) => {
          expect(sender).to.equal(bar);
          expect(args).to.equal(undefined);
          called = true;
        });
        addButton.dispatchEvent(
          new PointerEvent('pointerdown', {
            clientX: rect.left + 1,
            clientY: rect.top + 1,
            button: 0,
            cancelable: true
          })
        );
        addButton.dispatchEvent(
          new PointerEvent('pointerup', {
            clientX: rect.left + 1,
            clientY: rect.top + 1,
            button: 0,
            cancelable: true
          })
        );
        expect(called).to.equal(false);
      });
    });

    describe('#tabDetachRequested', () => {
      let tab: HTMLElement;

      beforeEach(() => {
        populateBar(bar);
        bar.tabsMovable = true;
        tab = bar.contentNode.children[bar.currentIndex] as HTMLElement;
      });

      it('should be emitted when a tab is dragged beyond the detach threshold', () => {
        simulateOnNode(tab, 'pointerdown');
        let called = false;
        bar.tabDetachRequested.connect((sender, args) => {
          expect(sender).to.equal(bar);
          expect(args.index).to.equal(0);
          expect(args.title).to.equal(bar.titles[0]);
          expect(args.clientX).to.equal(rect.right + 200);
          // Firefox on macos sometimes returns floats for rect.top
          expect(args.clientY).to.equal(Math.round(rect.top));
          called = true;
        });
        let rect = bar.contentNode.getBoundingClientRect();
        document.body.dispatchEvent(
          new PointerEvent('pointermove', {
            clientX: rect.right + 200,
            clientY: Math.round(rect.top),
            cancelable: true
          })
        );
        expect(called).to.equal(true);
      });

      it('should be handled by calling `releaseMouse` and removing the tab', () => {
        simulateOnNode(tab, 'pointerdown');
        let called = false;
        bar.tabDetachRequested.connect((sender, args) => {
          bar.releaseMouse();
          bar.removeTabAt(args.index);
          called = true;
        });
        let rect = bar.contentNode.getBoundingClientRect();
        document.body.dispatchEvent(
          new PointerEvent('pointermove', {
            clientX: rect.right + 200,
            clientY: rect.top,
            cancelable: true
          })
        );
        expect(called).to.equal(true);
      });

      it('should only be emitted once per drag cycle', () => {
        simulateOnNode(tab, 'pointerdown');
        let called = 0;
        bar.tabDetachRequested.connect((sender, args) => {
          bar.releaseMouse();
          bar.removeTabAt(args.index);
          called++;
        });
        let rect = bar.contentNode.getBoundingClientRect();
        document.body.dispatchEvent(
          new PointerEvent('pointermove', {
            clientX: rect.right + 200,
            clientY: rect.top,
            cancelable: true
          })
        );
        expect(called).to.equal(1);
        document.body.dispatchEvent(
          new PointerEvent('pointermove', {
            clientX: rect.right + 201,
            clientY: rect.top,
            cancelable: true
          })
        );
        expect(called).to.equal(1);
      });

      it('should add the `lm-mod-dragging` class to the tab and the bar', () => {
        simulateOnNode(tab, 'pointerdown');
        let called = false;
        bar.tabDetachRequested.connect((sender, args) => {
          expect(tab.classList.contains('lm-mod-dragging')).to.equal(true);
          expect(bar.hasClass('lm-mod-dragging')).to.equal(true);
          called = true;
        });
        let rect = bar.contentNode.getBoundingClientRect();
        document.body.dispatchEvent(
          new PointerEvent('pointermove', {
            clientX: rect.right + 200,
            clientY: rect.top,
            cancelable: true
          })
        );
        expect(called).to.equal(true);
      });
    });

    describe('#renderer', () => {
      it('should be the tab bar renderer', () => {
        let renderer = Object.create(TabBar.defaultRenderer);
        let bar = new TabBar<Widget>({ renderer });
        expect(bar.renderer).to.equal(renderer);
      });

      it('should default to the default renderer', () => {
        let bar = new TabBar<Widget>();
        expect(bar.renderer).to.equal(TabBar.defaultRenderer);
      });
    });

    describe('#tabsMovable', () => {
      it('should get whether the tabs are movable by the user', () => {
        let bar = new TabBar<Widget>();
        expect(bar.tabsMovable).to.equal(false);
      });

      it('should set whether the tabs are movable by the user', () => {
        let bar = new TabBar<Widget>();
        bar.tabsMovable = true;
        expect(bar.tabsMovable).to.equal(true);
      });

      it('should still allow programmatic moves', () => {
        populateBar(bar);
        let titles = bar.titles.slice();
        bar.insertTab(2, titles[0]);
        expect(bar.titles[2]).to.equal(titles[0]);
      });
    });

    describe('#addButtonEnabled', () => {
      it('should get whether the add button is enabled', () => {
        let bar = new TabBar<Widget>();
        expect(bar.addButtonEnabled).to.equal(false);
      });

      it('should set whether the add button is enabled', () => {
        let bar = new TabBar<Widget>();
        bar.addButtonEnabled = true;
        expect(bar.addButtonEnabled).to.equal(true);
      });

      it('should not show the add button if not set', () => {
        populateBar(bar);
        expect(bar.addButtonNode.classList.contains('lm-mod-hidden')).to.equal(
          true
        );

        bar.addButtonEnabled = true;
        expect(bar.addButtonNode.classList.contains('lm-mod-hidden')).to.equal(
          false
        );
      });
    });

    describe('#allowDeselect', () => {
      it('should determine whether a tab can be deselected by the user', () => {
        populateBar(bar);
        bar.allowDeselect = false;
        bar.tabsMovable = false;
        bar.currentIndex = 2;
        // Force the tabs to render
        MessageLoop.sendMessage(bar, Widget.Msg.UpdateRequest);
        let tab = bar.contentNode.getElementsByClassName(
          'lm-TabBar-tab'
        )[2] as HTMLElement;
        simulateOnNode(tab, 'pointerdown');
        expect(bar.currentIndex).to.equal(2);
        simulateOnNode(tab, 'pointerup');

        bar.allowDeselect = true;
        simulateOnNode(tab, 'pointerdown');
        expect(bar.currentIndex).to.equal(-1);
        simulateOnNode(tab, 'pointerup');
      });

      it('should always allow programmatic deselection', () => {
        populateBar(bar);
        bar.allowDeselect = false;
        bar.currentIndex = -1;
        expect(bar.currentIndex).to.equal(-1);
      });

      it('focus should work if there is no current tab', () => {
        populateBar(bar);
        bar.allowDeselect = true;
        const tab = bar.contentNode.firstChild as HTMLElement;
        expect(bar.currentIndex).to.equal(0);
        expect(tab.getAttribute('tabindex')).to.equal('0');
        simulateOnNode(tab, 'pointerdown');
        expect(bar.currentIndex).to.equal(-1);
        expect(tab.getAttribute('tabindex')).to.equal('0');
      });
    });

    describe('#insertBehavior', () => {
      it('should not change the selection', () => {
        populateBar(bar);
        bar.insertBehavior = 'none';
        bar.currentIndex = 0;
        bar.insertTab(2, new Widget().title);
        expect(bar.currentIndex).to.equal(0);
      });

      it('should select the tab', () => {
        populateBar(bar);
        bar.insertBehavior = 'select-tab';
        bar.currentIndex = 0;
        bar.insertTab(2, new Widget().title);
        expect(bar.currentIndex).to.equal(2);

        bar.currentIndex = -1;
        bar.insertTab(1, new Widget().title);
        expect(bar.currentIndex).to.equal(1);
      });

      it('should select the tab if needed', () => {
        populateBar(bar);
        bar.insertBehavior = 'select-tab-if-needed';
        bar.currentIndex = 0;
        bar.insertTab(2, new Widget().title);
        expect(bar.currentIndex).to.equal(0);

        bar.currentIndex = -1;
        bar.insertTab(1, new Widget().title);
        expect(bar.currentIndex).to.equal(1);
      });
    });

    describe('#removeBehavior', () => {
      it('should select no tab', () => {
        populateBar(bar);
        bar.removeBehavior = 'none';
        bar.currentIndex = 2;
        bar.removeTabAt(2);
        expect(bar.currentIndex).to.equal(-1);
      });

      it('should select the tab after the removed tab if possible', () => {
        populateBar(bar);
        bar.removeBehavior = 'select-tab-after';
        bar.currentIndex = 0;
        bar.removeTabAt(0);
        expect(bar.currentIndex).to.equal(0);

        bar.currentIndex = 1;
        bar.removeTabAt(1);
        expect(bar.currentIndex).to.equal(0);
      });

      it('should select the tab before the removed tab if possible', () => {
        populateBar(bar);
        bar.removeBehavior = 'select-tab-before';
        bar.currentIndex = 1;
        bar.removeTabAt(1);
        expect(bar.currentIndex).to.equal(0);
        bar.removeTabAt(0);
        expect(bar.currentIndex).to.equal(0);
      });

      it('should select the previously selected tab if possible', () => {
        populateBar(bar);
        bar.removeBehavior = 'select-previous-tab';
        bar.currentIndex = 0;
        bar.currentIndex = 2;
        bar.removeTabAt(2);
        expect(bar.currentIndex).to.equal(0);

        // Reset the bar.
        bar.removeTabAt(0);
        bar.removeTabAt(0);
        populateBar(bar);

        bar.currentIndex = 1;
        bar.removeTabAt(1);
        expect(bar.currentIndex).to.equal(0);
      });
    });

    describe('#currentTitle', () => {
      it('should get the currently selected title', () => {
        populateBar(bar);
        bar.currentIndex = 0;
        expect(bar.currentTitle).to.equal(bar.titles[0]);
      });

      it('should be `null` if no tab is selected', () => {
        populateBar(bar);
        bar.currentIndex = -1;
        expect(bar.currentTitle).to.equal(null);
      });

      it('should set the currently selected title', () => {
        populateBar(bar);
        bar.currentTitle = bar.titles[1];
        expect(bar.currentTitle).to.equal(bar.titles[1]);
      });

      it('should set the title to `null` if the title does not exist', () => {
        populateBar(bar);
        bar.currentTitle = new Widget().title;
        expect(bar.currentTitle).to.equal(null);
      });
    });

    describe('#currentIndex', () => {
      it('should get index of the currently selected tab', () => {
        populateBar(bar);
        expect(bar.currentIndex).to.equal(0);
      });

      it('should be `null` if no tab is selected', () => {
        expect(bar.currentIndex).to.equal(-1);
      });

      it('should set index of the currently selected tab', () => {
        populateBar(bar);
        bar.currentIndex = 1;
        expect(bar.currentIndex).to.equal(1);
      });

      it('should set the index to `-1` if the value is out of range', () => {
        populateBar(bar);
        bar.currentIndex = -1;
        expect(bar.currentIndex).to.equal(-1);
        bar.currentIndex = 10;
        expect(bar.currentIndex).to.equal(-1);
      });

      it('should emit the `currentChanged` signal', () => {
        populateBar(bar);
        let titles = bar.titles;
        let called = false;
        bar.currentChanged.connect((sender, args) => {
          expect(sender).to.equal(bar);
          expect(args.previousIndex).to.equal(0);
          expect(args.previousTitle).to.equal(titles[0]);
          expect(args.currentIndex).to.equal(1);
          expect(args.currentTitle).to.equal(titles[1]);
          called = true;
        });
        bar.currentIndex = 1;
        expect(called).to.equal(true);
      });

      it('should schedule an update of the tabs', done => {
        populateBar(bar);
        requestAnimationFrame(() => {
          bar.currentIndex = 1;
          bar.methods = [];
          requestAnimationFrame(() => {
            expect(bar.methods.indexOf('onUpdateRequest')).to.not.equal(-1);
            done();
          });
        });
      });

      it('should be a no-op if the index does not change', done => {
        populateBar(bar);
        requestAnimationFrame(() => {
          bar.currentIndex = 0;
          bar.methods = [];
          requestAnimationFrame(() => {
            expect(bar.methods.indexOf('onUpdateRequest')).to.equal(-1);
            done();
          });
        });
      });
    });

    describe('#orientation', () => {
      it('should be the orientation of the tab bar', () => {
        expect(bar.orientation).to.equal('horizontal');
        bar.orientation = 'vertical';
        expect(bar.orientation).to.equal('vertical');
      });

      it('should set the orientation attribute of the tab bar', () => {
        bar.orientation = 'horizontal';
        expect(bar.node.getAttribute('data-orientation')).to.equal(
          'horizontal'
        );
        bar.orientation = 'vertical';
        expect(bar.node.getAttribute('data-orientation')).to.equal('vertical');
      });
    });

    describe('#titles', () => {
      it('should get the read-only array of titles in the tab bar', () => {
        let bar = new TabBar<Widget>();
        let widgets = [new Widget(), new Widget(), new Widget()];
        widgets.forEach(widget => {
          bar.addTab(widget.title);
        });
        expect(bar.titles.length).to.equal(3);
        for (const [i, title] of bar.titles.entries()) {
          expect(title.owner).to.equal(widgets[i]);
        }
      });
    });

    describe('#contentNode', () => {
      it('should get the tab bar content node', () => {
        expect(
          bar.contentNode.classList.contains('lm-TabBar-content')
        ).to.equal(true);
      });
    });

    describe('#addTab()', () => {
      it('should add a tab to the end of the tab bar', () => {
        populateBar(bar);
        let title = new Widget().title;
        bar.addTab(title);
        expect(bar.titles[3]).to.equal(title);
      });

      it('should accept a title options object', () => {
        let owner = new Widget();
        bar.addTab({ owner, label: 'foo' });
        expect(bar.titles[0]).to.be.an.instanceof(Title);
        expect(bar.titles[0].label).to.equal('foo');
      });

      it('should move an existing title to the end', () => {
        populateBar(bar);
        let titles = bar.titles.slice();
        bar.addTab(titles[0]);
        expect(bar.titles[2]).to.equal(titles[0]);
      });
    });

    describe('#insertTab()', () => {
      it('should insert a tab into the tab bar at the specified index', () => {
        populateBar(bar);
        let title = new Widget().title;
        bar.insertTab(1, title);
        expect(bar.titles[1]).to.equal(title);
      });

      it('should accept a title options object', () => {
        populateBar(bar);
        let title = bar.insertTab(1, { owner: new Widget(), label: 'foo' });
        expect(title).to.be.an.instanceof(Title);
        expect(title.label).to.equal('foo');
      });

      it('should clamp the index to the bounds of the tabs', () => {
        populateBar(bar);
        let title = new Widget().title;
        bar.insertTab(-1, title);
        expect(bar.titles[0]).to.equal(title);
        title = new Widget().title;
        bar.insertTab(10, title);
        expect(bar.titles[4]).to.equal(title);
      });

      it('should move an existing tab', () => {
        populateBar(bar);
        let titles = bar.titles.slice();
        bar.insertTab(1, titles[0]);
        expect(bar.titles[1]).to.equal(titles[0]);
      });

      it('should schedule an update of the tabs', done => {
        let bar = new LogTabBar();
        bar.insertTab(0, new Widget().title);
        requestAnimationFrame(() => {
          expect(bar.methods.indexOf('onUpdateRequest')).to.not.equal(-1);
          done();
        });
      });

      it('should schedule an update if the title changes', done => {
        let bar = new LogTabBar();
        let title = new Widget().title;
        bar.insertTab(0, title);
        requestAnimationFrame(() => {
          expect(bar.methods.indexOf('onUpdateRequest')).to.not.equal(-1);
          bar.methods = [];
          title.label = 'foo';
          requestAnimationFrame(() => {
            expect(bar.methods.indexOf('onUpdateRequest')).to.not.equal(-1);
            done();
          });
        });
      });
    });

    describe('#removeTab()', () => {
      it('should remove a tab from the tab bar by value', () => {
        populateBar(bar);
        let titles = bar.titles.slice();
        bar.removeTab(titles[0]);
        expect(bar.titles[0]).to.equal(titles[1]);
      });

      it('should return be a no-op if the title is not in the tab bar', () => {
        populateBar(bar);
        bar.removeTab(new Widget().title);
      });

      it('should schedule an update of the tabs', done => {
        let bar = new LogTabBar();
        bar.insertTab(0, new Widget().title);
        requestAnimationFrame(() => {
          bar.removeTab(bar.titles[0]);
          bar.methods = [];
          requestAnimationFrame(() => {
            expect(bar.methods.indexOf('onUpdateRequest')).to.not.equal(-1);
            done();
          });
        });
      });
    });

    describe('#removeTabAt()', () => {
      it('should remove a tab at a specific index', () => {
        populateBar(bar);
        let titles = bar.titles.slice();
        bar.removeTabAt(0);
        expect(bar.titles[0]).to.equal(titles[1]);
      });

      it('should return be a no-op if the index is out of range', () => {
        populateBar(bar);
        bar.removeTabAt(9);
      });

      it('should schedule an update of the tabs', done => {
        let bar = new LogTabBar();
        bar.insertTab(0, new Widget().title);
        requestAnimationFrame(() => {
          bar.removeTabAt(0);
          bar.methods = [];
          requestAnimationFrame(() => {
            expect(bar.methods.indexOf('onUpdateRequest')).to.not.equal(-1);
            done();
          });
        });
      });
    });

    describe('#clearTabs()', () => {
      it('should remove all tabs from the tab bar', () => {
        populateBar(bar);
        bar.clearTabs();
        expect(bar.titles.length).to.equal(0);
      });

      it('should be a no-op if there are no tabs', () => {
        let bar = new TabBar<Widget>();
        bar.clearTabs();
        expect(bar.titles.length).to.equal(0);
      });

      it('should emit the `currentChanged` signal if there was a selected tab', () => {
        populateBar(bar);
        let called = false;
        bar.currentIndex = 0;
        bar.currentChanged.connect((sender, args) => {
          expect(sender).to.equal(bar);
          expect(args.previousIndex).to.equal(0);
          called = true;
        });
        bar.clearTabs();
        expect(called).to.equal(true);
      });

      it('should not emit the `currentChanged` signal if there was no selected tab', () => {
        populateBar(bar);
        let called = false;
        bar.currentIndex = -1;
        bar.currentChanged.connect((sender, args) => {
          called = true;
        });
        bar.clearTabs();
        expect(called).to.equal(false);
      });
    });

    describe('#releaseMouse()', () => {
      it('should release the mouse and restore the non-dragged tab positions', () => {
        populateBar(bar);
        startDrag(bar, 0, 'left');
        bar.releaseMouse();
        document.body.dispatchEvent(new PointerEvent('pointermove'));
        expect(bar.events.indexOf('pointermove')).to.equal(-1);
      });
    });

    describe('#handleEvent()', () => {
      let tab: Element;
      let closeIcon: Element;

      beforeEach(() => {
        bar.tabsMovable = true;
        populateBar(bar);
        bar.currentIndex = 0;
        tab = bar.contentNode.children[0];
        closeIcon = tab.querySelector(bar.renderer.closeIconSelector)!;
      });

      context('left click', () => {
        it('should emit a tab close requested signal', () => {
          let called = false;
          let rect = closeIcon.getBoundingClientRect();
          bar.tabCloseRequested.connect((sender, args) => {
            expect(sender).to.equal(bar);
            expect(args.index).to.equal(0);
            expect(args.title).to.equal(bar.titles[0]);
            called = true;
          });
          closeIcon.dispatchEvent(
            new PointerEvent('pointerdown', {
              clientX: rect.left + 1,
              clientY: rect.top + 1,
              button: 0,
              bubbles: true
            })
          );
          closeIcon.dispatchEvent(
            new PointerEvent('pointerup', {
              clientX: rect.left + 1,
              clientY: rect.top + 1,
              button: 0,
              cancelable: true
            })
          );
          expect(called).to.equal(true);
        });

        it('should do nothing if a drag is in progress', () => {
          startDrag(bar, 1, 'up');
          let called = false;
          let rect = closeIcon.getBoundingClientRect();
          bar.tabCloseRequested.connect((sender, args) => {
            called = true;
          });
          closeIcon.dispatchEvent(
            new PointerEvent('pointerdown', {
              clientX: rect.left + 1,
              clientY: rect.top + 1,
              button: 0,
              cancelable: true
            })
          );
          closeIcon.dispatchEvent(
            new PointerEvent('pointerup', {
              clientX: rect.left + 1,
              clientY: rect.top + 1,
              button: 0,
              cancelable: true
            })
          );
          expect(called).to.equal(false);
        });

        it('should do nothing if the click is not on a close icon', () => {
          let called = false;
          let rect = closeIcon.getBoundingClientRect();
          bar.tabCloseRequested.connect((sender, args) => {
            called = true;
          });
          closeIcon.dispatchEvent(
            new PointerEvent('pointerdown', {
              clientX: rect.left + 1,
              clientY: rect.top + 1,
              button: 0,
              cancelable: true
            })
          );
          closeIcon.dispatchEvent(
            new PointerEvent('pointerup', {
              clientX: rect.left - 1,
              clientY: rect.top - 1,
              button: 0,
              cancelable: true
            })
          );
          expect(called).to.equal(false);
          expect(called).to.equal(false);
        });

        it('should do nothing if the tab is not closable', () => {
          let called = false;
          bar.titles[0].closable = false;
          let rect = closeIcon.getBoundingClientRect();
          bar.tabCloseRequested.connect((sender, args) => {
            called = true;
          });
          closeIcon.dispatchEvent(
            new PointerEvent('pointerdown', {
              clientX: rect.left + 1,
              clientY: rect.top + 1,
              button: 0,
              cancelable: true
            })
          );
          closeIcon.dispatchEvent(
            new PointerEvent('pointerup', {
              clientX: rect.left + 1,
              clientY: rect.top + 1,
              button: 0,
              cancelable: true
            })
          );
          expect(called).to.equal(false);
        });
      });

      context('middle click', () => {
        it('should emit a tab close requested signal', () => {
          let called = false;
          let rect = tab.getBoundingClientRect();
          bar.tabCloseRequested.connect((sender, args) => {
            expect(sender).to.equal(bar);
            expect(args.index).to.equal(0);
            expect(args.title).to.equal(bar.titles[0]);
            called = true;
          });
          tab.dispatchEvent(
            new PointerEvent('pointerdown', {
              clientX: rect.left + 1,
              clientY: rect.top + 1,
              button: 1,
              bubbles: true
            })
          );
          tab.dispatchEvent(
            new PointerEvent('pointerup', {
              clientX: rect.left + 1,
              clientY: rect.top + 1,
              button: 1,
              cancelable: true
            })
          );
          expect(called).to.equal(true);
        });

        it('should do nothing if a drag is in progress', () => {
          startDrag(bar, 1, 'up');
          let called = false;
          let rect = tab.getBoundingClientRect();
          bar.tabCloseRequested.connect((sender, args) => {
            called = true;
          });
          tab.dispatchEvent(
            new PointerEvent('pointerdown', {
              clientX: rect.left + 1,
              clientY: rect.top + 1,
              button: 1,
              cancelable: true
            })
          );
          tab.dispatchEvent(
            new PointerEvent('pointerup', {
              clientX: rect.left + 1,
              clientY: rect.top + 1,
              button: 1,
              cancelable: true
            })
          );
          expect(called).to.equal(false);
        });

        it('should do nothing if the click is not on the tab', () => {
          let called = false;
          let rect = tab.getBoundingClientRect();
          bar.tabCloseRequested.connect((sender, args) => {
            called = true;
          });
          tab.dispatchEvent(
            new PointerEvent('pointerdown', {
              clientX: rect.left + 1,
              clientY: rect.top + 1,
              button: 1,
              cancelable: true
            })
          );
          tab.dispatchEvent(
            new PointerEvent('pointerup', {
              clientX: rect.left - 1,
              clientY: rect.top - 1,
              button: 1,
              cancelable: true
            })
          );
          expect(called).to.equal(false);
          expect(called).to.equal(false);
        });

        it('should do nothing if the tab is not closable', () => {
          let called = false;
          bar.titles[0].closable = false;
          let rect = tab.getBoundingClientRect();
          bar.tabCloseRequested.connect((sender, args) => {
            called = true;
          });
          tab.dispatchEvent(
            new PointerEvent('pointerdown', {
              clientX: rect.left + 1,
              clientY: rect.top + 1,
              button: 1,
              cancelable: true
            })
          );
          tab.dispatchEvent(
            new PointerEvent('pointerup', {
              clientX: rect.left + 1,
              clientY: rect.top + 1,
              button: 1,
              cancelable: true
            })
          );
          expect(called).to.equal(false);
        });
      });

      context('pointerdown', () => {
        it('should add event listeners if the tabs are movable', () => {
          simulateOnNode(tab, 'pointerdown');
          document.body.dispatchEvent(new PointerEvent('pointermove'));
          expect(bar.events.indexOf('pointermove')).to.not.equal(-1);
        });

        it('should do nothing if not a left mouse press', () => {
          let rect = tab.getBoundingClientRect();
          tab.dispatchEvent(
            new PointerEvent('pointerdown', {
              clientX: rect.left + 1,
              clientY: rect.top + 1,
              button: 1,
              cancelable: true
            })
          );
          document.body.dispatchEvent(new PointerEvent('pointermove'));
          expect(bar.events.indexOf('pointermove')).to.equal(-1);
        });

        it('should do nothing if the press is not on a tab', () => {
          let rect = tab.getBoundingClientRect();
          tab.dispatchEvent(
            new PointerEvent('pointerdown', {
              clientX: rect.left - 1,
              clientY: rect.top,
              cancelable: true
            })
          );
          document.body.dispatchEvent(new PointerEvent('pointermove'));
          expect(bar.events.indexOf('pointermove')).to.equal(-1);
        });

        it('should do nothing if the press is on a close icon', () => {
          simulateOnNode(closeIcon, 'pointerdown');
          document.body.dispatchEvent(new PointerEvent('pointermove'));
          expect(bar.events.indexOf('pointermove')).to.equal(-1);
        });

        it('should do nothing if the tabs are not movable', () => {
          bar.tabsMovable = false;
          simulateOnNode(tab, 'pointerdown');
          document.body.dispatchEvent(new PointerEvent('pointermove'));
          expect(bar.events.indexOf('pointermove')).to.equal(-1);
        });

        it('should do nothing if there is a drag in progress', () => {
          startDrag(bar, 2, 'down');
          let rect = tab.getBoundingClientRect();
          let event = new PointerEvent('pointerdown', {
            clientX: rect.left + 1,
            clientY: rect.top + 1,
            cancelable: true
          });
          let cancelled = !tab.dispatchEvent(event);
          expect(cancelled).to.equal(false);
        });
      });

      context('pointermove', () => {
        it('should do nothing if there is a drag in progress', () => {
          simulateOnNode(tab, 'pointerdown');
          let called = 0;
          bar.tabDetachRequested.connect((sender, args) => {
            called++;
          });
          let rect = bar.contentNode.getBoundingClientRect();
          document.body.dispatchEvent(
            new PointerEvent('pointermove', {
              clientX: rect.right + 200,
              clientY: rect.top,
              cancelable: true
            })
          );
          expect(called).to.equal(1);
          document.body.dispatchEvent(
            new PointerEvent('pointermove', {
              clientX: rect.right + 200,
              clientY: rect.top,
              cancelable: true
            })
          );
          expect(called).to.equal(1);
        });

        it('should bail if the drag threshold is not exceeded', () => {
          simulateOnNode(tab, 'pointerdown');
          let called = false;
          bar.tabDetachRequested.connect((sender, args) => {
            bar.releaseMouse();
            called = true;
          });
          let rect = bar.contentNode.getBoundingClientRect();
          document.body.dispatchEvent(
            new PointerEvent('pointermove', {
              clientX: rect.right + 1,
              clientY: rect.top,
              cancelable: true
            })
          );
          expect(called).to.equal(false);
        });

        it('should emit the detach requested signal if the threshold is exceeded', () => {
          simulateOnNode(tab, 'pointerdown');
          let called = false;
          bar.tabDetachRequested.connect((sender, args) => {
            expect(sender).to.equal(bar);
            expect(args.index).to.equal(0);
            expect(args.title).to.equal(bar.titles[0]);
            expect(args.clientX).to.equal(rect.right + 200);
            // Firefox on macos sometimes returns floats for rect.top
            expect(args.clientY).to.equal(Math.round(rect.top));
            called = true;
          });
          let rect = bar.contentNode.getBoundingClientRect();
          document.body.dispatchEvent(
            new PointerEvent('pointermove', {
              clientX: rect.right + 200,
              clientY: Math.round(rect.top),
              cancelable: true
            })
          );
          expect(called).to.equal(true);
        });

        it('should bail if the signal handler aborted the drag', () => {
          simulateOnNode(tab, 'pointerdown');
          let called = false;
          bar.tabDetachRequested.connect((sender, args) => {
            bar.releaseMouse();
            called = true;
          });
          let rect = bar.contentNode.getBoundingClientRect();
          document.body.dispatchEvent(
            new PointerEvent('pointermove', {
              clientX: rect.right + 200,
              clientY: rect.top,
              cancelable: true
            })
          );
          expect(called).to.equal(true);
          let left = rect.left;
          rect = tab.getBoundingClientRect();
          expect(left).to.equal(rect.left);
        });

        it('should update the positions of the tabs', () => {
          simulateOnNode(tab, 'pointerdown');
          let called = false;
          bar.tabDetachRequested.connect((sender, args) => {
            called = true;
          });
          let rect = bar.contentNode.getBoundingClientRect();
          document.body.dispatchEvent(
            new PointerEvent('pointermove', {
              clientX: rect.right + 200,
              clientY: rect.top,
              cancelable: true
            })
          );
          expect(called).to.equal(true);
          let left = rect.left;
          rect = tab.getBoundingClientRect();
          expect(left).to.not.equal(rect.left);
        });
      });

      context('pointerup', () => {
        it('should emit the `tabMoved` signal', done => {
          startDrag(bar);
          document.body.dispatchEvent(new PointerEvent('pointerup'));
          bar.tabMoved.connect(() => {
            done();
          });
        });

        it('should move the tab to its final position', done => {
          startDrag(bar);
          document.body.dispatchEvent(new PointerEvent('pointerup'));
          let title = bar.titles[0];
          bar.tabMoved.connect(() => {
            expect(bar.titles[2]).to.equal(title);
            done();
          });
        });

        it('should cancel a middle mouse release', () => {
          startDrag(bar);
          let event = new PointerEvent('pointerup', {
            button: 1,
            cancelable: true
          });
          let cancelled = !document.body.dispatchEvent(event);
          expect(cancelled).to.equal(true);
        });
      });

      context('keydown', () => {
        it('should prevent default', () => {
          startDrag(bar);
          let event = new KeyboardEvent('keydown', { cancelable: true });
          let cancelled = !document.body.dispatchEvent(event);
          expect(cancelled).to.equal(true);
        });

        it('should release the mouse if `Escape` is pressed', () => {
          startDrag(bar);
          document.body.dispatchEvent(
            new KeyboardEvent('keydown', {
              keyCode: 27,
              cancelable: true
            })
          );
          simulateOnNode(tab, 'pointerdown');
          expect(bar.events.indexOf('pointermove')).to.equal(-1);
        });

        it('should activate the focused title on Enter', () => {
          // Focus 3rd tab
          (bar.contentNode.children[2] as HTMLElement).focus();

          bar.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'Enter',
              cancelable: true,
              bubbles: true
            })
          );

          expect(bar.currentIndex).to.equal(2);
        });

        it('should activate the focused title on Space', () => {
          // Focus 2nd tab
          (bar.contentNode.children[1] as HTMLElement).focus();

          bar.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: ' ',
              cancelable: true,
              bubbles: true
            })
          );

          expect(bar.currentIndex).to.equal(1);
        });

        it('should add a tab when Enter is pressed with focus on add button', () => {
          let addRequested = false;
          bar.addButtonEnabled = true;
          bar.addButtonNode.focus();

          bar.addRequested.connect(() => {
            addRequested = true;
          });

          bar.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'Enter',
              cancelable: true,
              bubbles: true
            })
          );

          expect(addRequested).to.be.true;
        });

        it('should add a tab when Space is pressed with focus on add button', () => {
          let addRequested = false;
          bar.addButtonEnabled = true;
          bar.addButtonNode.focus();

          bar.addRequested.connect(() => {
            addRequested = true;
          });

          bar.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: ' ',
              cancelable: true,
              bubbles: true
            })
          );

          expect(addRequested).to.be.true;
        });

        it('should have the tabindex="0" on the first tab by default', () => {
          populateBar(bar);
          const firstTab = bar.contentNode.firstChild as HTMLElement;
          expect(firstTab.getAttribute('tabindex')).to.equal('0');
          for (let i = 1; i < bar.titles.length; i++) {
            let tab = bar.contentNode.children[i] as HTMLElement;
            expect(tab.getAttribute('tabindex')).to.equal('-1');
          }
          expect(bar.addButtonNode.getAttribute('tabindex')).to.equal('-1');
        });

        it('should have a role attribute of button', () => {
          populateBar(bar);
          expect(bar.addButtonNode.getAttribute('role')).to.equal('button');
        });

        it('should focus the second tab on right arrow keydown', () => {
          populateBar(bar);
          const firstTab = bar.contentNode.firstChild as HTMLElement;
          firstTab.focus();
          bar.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'ArrowRight',
              cancelable: true,
              bubbles: true
            })
          );
          expect(firstTab.getAttribute('tabindex')).to.equal('-1');
          const secondTab = bar.contentNode.children[1] as HTMLElement;
          expect(secondTab.getAttribute('tabindex')).to.equal('0');
          expect(document.activeElement).to.equal(secondTab);
        });

        it('should focus the last tab on left arrow keydown', () => {
          populateBar(bar);
          const firstTab = bar.contentNode.firstChild as HTMLElement;
          firstTab.focus();
          bar.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'ArrowLeft',
              cancelable: true,
              bubbles: true
            })
          );
          expect(firstTab.getAttribute('tabindex')).to.equal('-1');
          const lastTab = bar.contentNode.lastChild as HTMLElement;
          expect(lastTab.getAttribute('tabindex')).to.equal('0');
          expect(document.activeElement).to.equal(lastTab);
        });

        it('should focus the add button on left arrow keydown', () => {
          bar.addButtonEnabled = true;
          populateBar(bar);
          const firstTab = bar.contentNode.firstChild as HTMLElement;
          firstTab.focus();
          bar.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'ArrowLeft',
              cancelable: true,
              bubbles: true
            })
          );
          expect(firstTab.getAttribute('tabindex')).to.equal('-1');
          expect(bar.addButtonNode.getAttribute('tabindex')).to.equal('0');
          expect(document.activeElement).to.equal(bar.addButtonNode);
        });

        it('should be no-op on up and down arrow keydown', () => {
          populateBar(bar);
          const firstTab = bar.contentNode.firstChild as HTMLElement;
          firstTab.focus();
          bar.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'ArrowUp',
              cancelable: true,
              bubbles: true
            })
          );
          expect(firstTab.getAttribute('tabindex')).to.equal('0');
          expect(document.activeElement).to.equal(firstTab);
          bar.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'ArrowDown',
              cancelable: true,
              bubbles: true
            })
          );
          expect(firstTab.getAttribute('tabindex')).to.equal('0');
          expect(document.activeElement).to.equal(firstTab);
        });

        it('should focus the second tab on down arrow keydown', () => {
          bar.orientation = 'vertical';
          populateBar(bar);
          const firstTab = bar.contentNode.firstChild as HTMLElement;
          firstTab.focus();
          bar.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'ArrowDown',
              cancelable: true,
              bubbles: true
            })
          );
          expect(firstTab.getAttribute('tabindex')).to.equal('-1');
          const secondTab = bar.contentNode.children[1] as HTMLElement;
          expect(secondTab.getAttribute('tabindex')).to.equal('0');
          expect(document.activeElement).to.equal(secondTab);
        });

        it('should focus the last tab on up arrow keydown', () => {
          bar.orientation = 'vertical';
          populateBar(bar);
          const firstTab = bar.contentNode.firstChild as HTMLElement;
          firstTab.focus();
          bar.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'ArrowUp',
              cancelable: true,
              bubbles: true
            })
          );
          expect(firstTab.getAttribute('tabindex')).to.equal('-1');
          const lastTab = bar.contentNode.lastChild as HTMLElement;
          expect(lastTab.getAttribute('tabindex')).to.equal('0');
          expect(document.activeElement).to.equal(lastTab);
        });

        it('should be no-op on left and right arrow keydown', () => {
          bar.orientation = 'vertical';
          populateBar(bar);
          const firstTab = bar.contentNode.firstChild as HTMLElement;
          firstTab.focus();
          bar.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'ArrowLeft',
              cancelable: true,
              bubbles: true
            })
          );
          expect(firstTab.getAttribute('tabindex')).to.equal('0');
          expect(document.activeElement).to.equal(firstTab);
          bar.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'ArrowRight',
              cancelable: true,
              bubbles: true
            })
          );
          expect(firstTab.getAttribute('tabindex')).to.equal('0');
          expect(document.activeElement).to.equal(firstTab);
        });

        it('should focus the first tab on "Home" keydown', () => {
          populateBar(bar);
          const firstTab = bar.contentNode.firstChild as HTMLElement;
          const lastTab = bar.contentNode.lastChild as HTMLElement;
          firstTab.setAttribute('tabindex', '-1');
          lastTab.setAttribute('tabindex', '0');
          lastTab.focus();
          bar.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'Home',
              cancelable: true,
              bubbles: true
            })
          );
          expect(firstTab.getAttribute('tabindex')).to.equal('0');
          expect(document.activeElement).to.equal(firstTab);
        });

        it('should focus the last tab on "End" keydown', () => {
          populateBar(bar);
          const lastTab = bar.contentNode.lastChild as HTMLElement;
          bar.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'End',
              cancelable: true,
              bubbles: true
            })
          );
          expect(lastTab.getAttribute('tabindex')).to.equal('0');
          expect(document.activeElement).to.equal(lastTab);
        });

        it('should not change the tabindex values when focusing another element', () => {
          const node = document.createElement('div');
          node.setAttribute('tabindex', '0');
          document.body.append(node);
          populateBar(bar);
          const firstTab = bar.contentNode.firstChild as HTMLElement;
          firstTab.focus();
          bar.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'ArrowRight',
              cancelable: true,
              bubbles: true
            })
          );
          node.focus();
          const secondTab = bar.contentNode.children[1] as HTMLElement;
          expect(document.activeElement).not.to.equal(secondTab);
          expect(secondTab.getAttribute('tabindex')).to.equal('0');
        });

        /**
         * This test is skipped as it seems there is no way to trigger a change of focus
         * when simulating tabulation keydown.
         *
         * TODO:
         * Find a way to trigger the change of focus.
         */
        /*
        it.skip('should keep focus on the second tab on tabulation', () => {
          const node = document.createElement('div');
          node.setAttribute('tabindex', '0');
          document.body.append(node);
          populateBar(bar);
          const firstTab = bar.contentNode.firstChild as HTMLElement;
          firstTab.focus();
          bar.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'ArrowRight',
              cancelable: true,
              bubbles: true
            })
          );
          bar.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'Tab'
            })
          );
          const secondTab = bar.contentNode.children[1] as HTMLElement;
          expect(document.activeElement).not.to.equal(secondTab);
          bar.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'Tab',
              shiftKey: true
            })
          );
          expect(document.activeElement).to.equal(secondTab);
        });
        */
      });

      context('contextmenu', () => {
        it('should prevent default', () => {
          startDrag(bar);
          let event = new MouseEvent('contextmenu', { cancelable: true });
          let cancelled = !document.body.dispatchEvent(event);
          expect(cancelled).to.equal(true);
        });
      });
    });

    describe('editable title', () => {
      let title: Title<Widget>;

      const triggerDblClick = (tab: HTMLElement) => {
        const tabLabel = tab.querySelector(
          '.lm-TabBar-tabLabel'
        ) as HTMLElement;
        expect(tab.querySelector('input')).to.be.null;
        simulateOnNode(tabLabel, 'dblclick');
      };

      beforeEach(() => {
        bar.titlesEditable = true;
        let owner = new Widget();
        title = new Title({ owner, label: 'foo', closable: true });
        bar.addTab(title);
        MessageLoop.sendMessage(bar, Widget.Msg.UpdateRequest);
      });

      it('titles should be editable', () => {
        const tab = bar.contentNode.firstChild as HTMLElement;
        triggerDblClick(tab);
        const input = tab.querySelector(
          'input.lm-TabBar-tabInput'
        ) as HTMLInputElement;
        expect(input).not.to.be.null;
        expect(input.value).to.equal(title.label);
        expect(document.activeElement).to.equal(input);
      });

      it('title should be edited', () => {
        const tab = bar.contentNode.firstChild as HTMLElement;
        triggerDblClick(tab);
        let input = tab.querySelector(
          'input.lm-TabBar-tabInput'
        ) as HTMLInputElement;
        input.value = 'bar';
        input.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'Enter',
            cancelable: true,
            bubbles: true
          })
        );
        input = tab.querySelector(
          'input.lm-TabBar-tabInput'
        ) as HTMLInputElement;
        expect(input).to.be.null;
        expect(title.label).to.equal('bar');
      });

      it('title edition should be canceled', () => {
        const tab = bar.contentNode.firstChild as HTMLElement;
        triggerDblClick(tab);
        let input = tab.querySelector(
          'input.lm-TabBar-tabInput'
        ) as HTMLInputElement;
        input.value = 'bar';
        input.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'Escape',
            cancelable: true,
            bubbles: true
          })
        );
        input = tab.querySelector(
          'input.lm-TabBar-tabInput'
        ) as HTMLInputElement;
        expect(input).to.be.null;
        expect(title.label).to.equal('foo');
      });

      it('Arrow keys should have no effect on focus during edition', () => {
        populateBar(bar);
        const tab = bar.contentNode.firstChild as HTMLElement;
        triggerDblClick(tab);
        const input = tab.querySelector(
          'input.lm-TabBar-tabInput'
        ) as HTMLInputElement;
        bar.node.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'ArrowRight',
            cancelable: true,
            bubbles: true
          })
        );
        expect(document.activeElement).to.equal(input);
      });
    });

    describe('#onBeforeAttach()', () => {
      it('should add event listeners to the node', () => {
        let bar = new LogTabBar();
        Widget.attach(bar, document.body);
        expect(bar.methods).to.contain('onBeforeAttach');
        bar.node.dispatchEvent(
          new PointerEvent('pointerdown', {
            cancelable: true
          })
        );
        expect(bar.events.indexOf('pointerdown')).to.not.equal(-1);
        bar.dispose();
      });
    });

    describe('#onAfterDetach()', () => {
      it('should remove event listeners', () => {
        let bar = new LogTabBar();
        let owner = new Widget();
        bar.addTab(new Title({ owner, label: 'foo' }));
        MessageLoop.sendMessage(bar, Widget.Msg.UpdateRequest);
        Widget.attach(bar, document.body);
        let tab = bar.contentNode.firstChild as HTMLElement;
        let rect = tab.getBoundingClientRect();
        tab.dispatchEvent(
          new PointerEvent('pointerdown', {
            clientX: rect.left + 1,
            clientY: rect.top + 1,
            cancelable: true
          })
        );
        Widget.detach(bar);
        expect(bar.methods).to.contain('onAfterDetach');
        document.body.dispatchEvent(
          new PointerEvent('pointermove', {
            cancelable: true
          })
        );
        expect(bar.events.indexOf('pointermove')).to.equal(-1);
        document.body.dispatchEvent(
          new PointerEvent('pointerup', {
            cancelable: true
          })
        );
        expect(bar.events.indexOf('pointerup')).to.equal(-1);
      });
    });

    describe('#onUpdateRequest()', () => {
      it('should render tabs and set styles', () => {
        populateBar(bar);
        bar.currentIndex = 0;
        MessageLoop.sendMessage(bar, Widget.Msg.UpdateRequest);
        expect(bar.methods.indexOf('onUpdateRequest')).to.not.equal(-1);
        for (const [i, title] of bar.titles.entries()) {
          let tab = bar.contentNode.children[i] as HTMLElement;
          let label = tab.getElementsByClassName(
            'lm-TabBar-tabLabel'
          )[0] as HTMLElement;
          expect(label.textContent).to.equal(title.label);
          let current = i === 0;
          expect(tab.classList.contains('lm-mod-current')).to.equal(current);
        }
      });
    });

    describe('.Renderer', () => {
      let title: Title<Widget>;

      beforeEach(() => {
        let owner = new Widget();
        title = new Title({
          owner,
          label: 'foo',
          closable: true,
          iconClass: 'bar',
          className: 'fizz',
          caption: 'this is a caption'
        });
      });

      describe('#closeIconSelector', () => {
        it('should be `.lm-TabBar-tabCloseIcon`', () => {
          let renderer = new TabBar.Renderer();
          expect(renderer.closeIconSelector).to.equal(
            '.lm-TabBar-tabCloseIcon'
          );
        });
      });

      describe('#renderTab()', () => {
        it('should render a virtual node for a tab', () => {
          let renderer = new TabBar.Renderer();
          let vNode = renderer.renderTab({ title, current: true, zIndex: 1 });
          let node = VirtualDOM.realize(vNode);

          expect(
            node.getElementsByClassName('lm-TabBar-tabIcon').length
          ).to.equal(1);
          expect(
            node.getElementsByClassName('lm-TabBar-tabLabel').length
          ).to.equal(1);
          expect(
            node.getElementsByClassName('lm-TabBar-tabCloseIcon').length
          ).to.equal(1);

          expect(node.classList.contains('lm-TabBar-tab')).to.equal(true);
          expect(node.classList.contains(title.className)).to.equal(true);
          expect(node.classList.contains('lm-mod-current')).to.equal(true);
          expect(node.classList.contains('lm-mod-closable')).to.equal(true);
          expect(node.title).to.equal(title.caption);

          let label = node.getElementsByClassName(
            'lm-TabBar-tabLabel'
          )[0] as HTMLElement;
          expect(label.textContent).to.equal(title.label);

          let icon = node.getElementsByClassName(
            'lm-TabBar-tabIcon'
          )[0] as HTMLElement;
          expect(icon.classList.contains(title.iconClass)).to.equal(true);
        });
      });

      describe('#renderIcon()', () => {
        it('should render the icon element for a tab', () => {
          let renderer = new TabBar.Renderer();
          let vNode = renderer.renderIcon({ title, current: true, zIndex: 1 });
          let node = VirtualDOM.realize(vNode as VirtualElement);
          expect(node.className).to.contain('lm-TabBar-tabIcon');
          expect(node.classList.contains(title.iconClass)).to.equal(true);
        });
      });

      describe('#renderLabel()', () => {
        it('should render the label element for a tab', () => {
          let renderer = new TabBar.Renderer();
          let vNode = renderer.renderLabel({ title, current: true, zIndex: 1 });
          let label = VirtualDOM.realize(vNode);
          expect(label.className).to.contain('lm-TabBar-tabLabel');
          expect(label.textContent).to.equal(title.label);
        });
      });

      describe('#renderCloseIcon()', () => {
        it('should render the close icon element for a tab', () => {
          let renderer = new TabBar.Renderer();
          let vNode = renderer.renderCloseIcon({
            title,
            current: true,
            zIndex: 1
          });
          let icon = VirtualDOM.realize(vNode);
          expect(icon.className).to.contain('lm-TabBar-tabCloseIcon');
        });
      });

      describe('#createTabKey()', () => {
        it('should create a unique render key for the tab', () => {
          let renderer = new TabBar.Renderer();
          let key = renderer.createTabKey({ title, current: true, zIndex: 1 });
          let newKey = renderer.createTabKey({
            title,
            current: true,
            zIndex: 1
          });
          expect(key).to.equal(newKey);
        });
      });

      describe('#createTabStyle()', () => {
        it('should create the inline style object for a tab', () => {
          let renderer = new TabBar.Renderer();
          let style = renderer.createTabStyle({
            title,
            current: true,
            zIndex: 1
          });
          expect(style['zIndex']).to.equal('1');
        });
      });

      describe('#createTabClass()', () => {
        it('should create the class name for the tab', () => {
          let renderer = new TabBar.Renderer();
          let className = renderer.createTabClass({
            title,
            current: true,
            zIndex: 1
          });
          expect(className).to.contain('lm-TabBar-tab');
          expect(className).to.contain('lm-mod-closable');
          expect(className).to.contain('lm-mod-current');
        });
      });

      describe('#createIconClass()', () => {
        it('should create class name for the tab icon', () => {
          let renderer = new TabBar.Renderer();
          let className = renderer.createIconClass({
            title,
            current: true,
            zIndex: 1
          });
          expect(className).to.contain('lm-TabBar-tabIcon');
          expect(className).to.contain(title.iconClass);
        });
      });
    });

    describe('.defaultRenderer', () => {
      it('should be an instance of `Renderer`', () => {
        expect(TabBar.defaultRenderer).to.be.an.instanceof(TabBar.Renderer);
      });
    });
  });
});
