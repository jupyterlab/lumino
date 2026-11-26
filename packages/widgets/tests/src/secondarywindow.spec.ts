// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { expect } from 'chai';

import { CommandRegistry } from '@lumino/commands';

import { Menu, Widget } from '@lumino/widgets';

import {
  createSecondaryDocument,
  expectSame,
  ISecondaryDocument
} from './secondarydocument';

const bubbles = true;

/**
 * The size of the secondary document viewport.
 */
const WIDTH = 300;
const HEIGHT = 200;

/**
 * Tolerance for subpixel positioning.
 */
const EPSILON = 0.5;

class EventLogMenu extends Menu {
  events: string[] = [];

  handleEvent(event: Event): void {
    super.handleEvent(event);
    this.events.push(event.type);
  }
}

function pointerDown(target: EventTarget, clientX: number, clientY: number) {
  target.dispatchEvent(
    new PointerEvent('pointerdown', {
      bubbles,
      cancelable: true,
      clientX,
      clientY
    })
  );
}

function keyDown(target: EventTarget, keyCode: number) {
  target.dispatchEvent(
    new KeyboardEvent('keydown', { bubbles, cancelable: true, keyCode })
  );
}

/**
 * Count the viewport measurements of the main document while running `fn`.
 *
 * Opening a menu in a secondary document should not force a layout of the
 * main document.
 */
function countMainDocumentMeasurements(fn: () => void): number {
  const element = document.documentElement;
  const descriptor = Object.getOwnPropertyDescriptor(
    Element.prototype,
    'clientWidth'
  )!;
  let count = 0;
  Object.defineProperty(element, 'clientWidth', {
    configurable: true,
    get() {
      count++;
      return descriptor.get!.call(this);
    }
  });
  try {
    fn();
  } finally {
    delete (element as any).clientWidth;
  }
  return count;
}

function center(node: Element): { x: number; y: number } {
  const rect = node.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

describe('@lumino/widgets', () => {
  describe('secondary window support', () => {
    let commands: CommandRegistry;
    let executed: string[];
    let secondary: ISecondaryDocument;
    let widgets: Widget[];

    /**
     * Dispose the widget after the test.
     */
    function track<T extends Widget>(widget: T): T {
      widgets.push(widget);
      return widget;
    }

    function createMenu(
      ids: string[] = ['one', 'two', 'three'],
      menu: Menu = new Menu({ commands })
    ): Menu {
      for (const id of ids) {
        menu.addItem({ command: 'test', args: { id } });
      }
      return track(menu);
    }

    beforeEach(() => {
      commands = new CommandRegistry();
      executed = [];
      commands.addCommand('test', {
        label: args => `Menu item ${args.id}`,
        execute: args => {
          executed.push(args.id as string);
        }
      });
      widgets = [];
      secondary = createSecondaryDocument({ width: WIDTH, height: HEIGHT });
    });

    afterEach(() => {
      for (const widget of widgets) {
        widget.dispose();
      }
      secondary.dispose();
    });

    describe('Menu', () => {
      it('should attach to the host document', () => {
        const menu = createMenu();
        menu.open(10, 10, { host: secondary.document.body });
        expect(menu.isAttached).to.equal(true);
        expectSame(menu.node.ownerDocument, secondary.document);
        expectSame(menu.node.parentNode, secondary.document.body);
      });

      it('should close on pointerdown outside the menu in the host document', () => {
        const menu = createMenu();
        menu.open(10, 10, { host: secondary.document.body });
        pointerDown(secondary.document.body, WIDTH - 5, HEIGHT - 5);
        expect(menu.isAttached).to.equal(false);
      });

      it('should not close on pointerdown inside the menu', () => {
        const menu = createMenu();
        menu.open(10, 10, { host: secondary.document.body });
        const { x, y } = center(menu.contentNode.children[0]);
        pointerDown(menu.contentNode.children[0], x, y);
        expect(menu.isAttached).to.equal(true);
      });

      it('should not listen on the main document', () => {
        const menu = createMenu();
        menu.open(10, 10, { host: secondary.document.body });
        pointerDown(document.body, -10, -10);
        expect(menu.isAttached).to.equal(true);
      });

      it('should remove the host document listener on close', () => {
        const menu = createMenu([], new EventLogMenu({ commands }));
        menu.addItem({ command: 'test', args: { id: 'one' } });
        menu.open(10, 10, { host: secondary.document.body });
        menu.close();
        (menu as EventLogMenu).events = [];
        pointerDown(secondary.document.body, WIDTH - 5, HEIGHT - 5);
        expect((menu as EventLogMenu).events).to.not.contain('pointerdown');
      });

      it('should keep the menu within the host viewport', () => {
        const menu = createMenu();
        menu.open(WIDTH - 10, HEIGHT - 10, { host: secondary.document.body });
        const rect = menu.node.getBoundingClientRect();
        expect(rect.right).to.be.at.most(WIDTH + EPSILON);
        expect(rect.bottom).to.be.at.most(HEIGHT + EPSILON);
      });

      it('should use the text direction of the host document', () => {
        secondary.document.documentElement.dir = 'rtl';
        const menu = createMenu();
        menu.open(250, 10, { host: secondary.document.body });
        const rect = menu.node.getBoundingClientRect();
        expect(rect.right).to.be.closeTo(250, 1);
      });

      it('should open submenus in the parent menu document', () => {
        const submenu = createMenu();
        const menu = createMenu();
        menu.addItem({ type: 'submenu', submenu });
        menu.open(10, 10, { host: secondary.document.body });
        menu.activeIndex = menu.items.length - 1;
        menu.triggerActiveItem();
        expectSame(menu.childMenu, submenu);
        expectSame(submenu.node.ownerDocument, secondary.document);
        expectSame(submenu.node.parentNode, secondary.document.body);
      });

      it('should not measure the main document', () => {
        const submenu = createMenu();
        const menu = createMenu();
        menu.addItem({ type: 'submenu', submenu });
        const count = countMainDocumentMeasurements(() => {
          menu.open(10, 10, { host: secondary.document.body });
          menu.activeIndex = menu.items.length - 1;
          menu.triggerActiveItem();
        });
        expect(submenu.isAttached).to.equal(true);
        expect(count).to.equal(0);
      });

      it('should keep submenus within the parent menu viewport', () => {
        const submenu = createMenu();
        const menu = createMenu();
        menu.addItem({ type: 'submenu', submenu });
        menu.open(WIDTH, 10, { host: secondary.document.body });
        menu.activeIndex = menu.items.length - 1;
        menu.triggerActiveItem();
        const rect = submenu.node.getBoundingClientRect();
        expect(rect.right).to.be.at.most(WIDTH + EPSILON);
      });

      it('should close submenus with the root menu', () => {
        const submenu = createMenu();
        const menu = createMenu();
        menu.addItem({ type: 'submenu', submenu });
        menu.open(10, 10, { host: secondary.document.body });
        menu.activeIndex = menu.items.length - 1;
        menu.triggerActiveItem();
        pointerDown(secondary.document.body, WIDTH - 5, HEIGHT - 5);
        expect(menu.isAttached).to.equal(false);
        expect(submenu.isAttached).to.equal(false);
      });

      it('should reopen in the main document', () => {
        const menu = createMenu();
        menu.open(10, 10, { host: secondary.document.body });
        menu.close();
        menu.open(10, 10);
        expectSame(menu.node.ownerDocument, document);
        expectSame(menu.node.parentNode, document.body);
        pointerDown(secondary.document.body, WIDTH - 5, HEIGHT - 5);
        expect(menu.isAttached).to.equal(true);
        pointerDown(document.body, -10, -10);
        expect(menu.isAttached).to.equal(false);
      });

      it('should not use window data saved for another document', () => {
        const menu = createMenu();
        Menu.saveWindowData();
        menu.open(WIDTH - 10, HEIGHT - 10, { host: secondary.document.body });
        const rect = menu.node.getBoundingClientRect();
        expect(rect.right).to.be.at.most(WIDTH + EPSILON);
        expect(rect.bottom).to.be.at.most(HEIGHT + EPSILON);
      });

      it('should use window data saved for the host document', () => {
        const menu = createMenu();
        Menu.saveWindowData(secondary.document);
        // The cached viewport is still WIDTH wide, so the menu is not moved.
        secondary.resize(50, HEIGHT);
        menu.open(10, 10, { host: secondary.document.body });
        expect(menu.node.getBoundingClientRect().left).to.be.closeTo(10, 1);
      });
    });

    describe('smoke tests', () => {
      it('should support a context menu with submenus and keyboard', () => {
        const submenu = createMenu(['nested']);
        submenu.title.label = 'More';
        const menu = createMenu(['first']);
        menu.addItem({ type: 'submenu', submenu });

        // Open the menu in the secondary document like a context menu.
        menu.open(10, 10, { host: secondary.document.body });
        expectSame(menu.node.parentNode, secondary.document.body);

        // Navigate into the submenu with the keyboard.
        keyDown(menu.node, 40); // Down arrow
        keyDown(menu.node, 40); // Down arrow
        keyDown(menu.node, 39); // Right arrow
        expectSame(submenu.node.parentNode, secondary.document.body);
        const rect = submenu.node.getBoundingClientRect();
        expect(rect.right).to.be.at.most(WIDTH + EPSILON);

        // Trigger the submenu item.
        keyDown(submenu.node, 13); // Enter
        expect(executed).to.deep.equal(['nested']);
        expect(menu.isAttached).to.equal(false);
        expect(submenu.isAttached).to.equal(false);

        // Open it again and dismiss it with a click outside.
        menu.open(10, 10, { host: secondary.document.body });
        pointerDown(document.body, -10, -10);
        expect(menu.isAttached).to.equal(true);
        pointerDown(secondary.document.body, WIDTH - 5, HEIGHT - 5);
        expect(menu.isAttached).to.equal(false);

        // Open it in the main document afterwards.
        menu.open(10, 10);
        expectSame(menu.node.parentNode, document.body);
        pointerDown(document.body, -10, -10);
        expect(menu.isAttached).to.equal(false);
      });
    });
  });
});
