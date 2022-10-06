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

import { CommandRegistry } from '@lumino/commands';

import { JSONObject } from '@lumino/coreutils';

import { Platform } from '@lumino/domutils';

import { Message } from '@lumino/messaging';

import { h, VirtualDOM } from '@lumino/virtualdom';

import { Menu, Widget } from '@lumino/widgets';

class LogMenu extends Menu {
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

  protected onActivateRequest(msg: Message): void {
    super.onActivateRequest(msg);
    this.methods.push('onActivateRequest');
  }

  protected onUpdateRequest(msg: Message): void {
    super.onUpdateRequest(msg);
    this.methods.push('onUpdateRequest');
  }

  protected onCloseRequest(msg: Message): void {
    super.onCloseRequest(msg);
    this.methods.push('onCloseRequest');
  }
}

const bubbles = true;

describe('@lumino/widgets', () => {
  let commands = new CommandRegistry();
  let logMenu: LogMenu = null!;
  let menu: Menu = null!;
  let executed = '';
  const iconClass = 'foo';
  const iconRenderer = {
    render: (host: HTMLElement, options?: any) => {
      const renderNode = document.createElement('div');
      host.classList.add(iconClass);
      host.appendChild(renderNode);
    }
  };

  before(() => {
    commands.addCommand('test', {
      execute: (args: JSONObject) => {
        executed = 'test';
      },
      label: 'Test Label',
      icon: iconRenderer,
      iconClass,
      caption: 'Test Caption',
      className: 'testClass',
      mnemonic: 0
    });
    commands.addCommand('test-toggled', {
      execute: (args: JSONObject) => {
        executed = 'test-toggled';
      },
      label: 'Test Toggled Label',
      icon: iconRenderer,
      className: 'testClass',
      isToggled: (args: JSONObject) => true,
      mnemonic: 6
    });
    commands.addCommand('test-disabled', {
      execute: (args: JSONObject) => {
        executed = 'test-disabled';
      },
      label: 'Test Disabled Label',
      icon: iconRenderer,
      className: 'testClass',
      isEnabled: (args: JSONObject) => false,
      mnemonic: 5
    });
    commands.addCommand('test-hidden', {
      execute: (args: JSONObject) => {
        executed = 'test-hidden';
      },
      label: 'Hidden Label',
      icon: iconRenderer,
      className: 'testClass',
      isVisible: (args: JSONObject) => false
    });
    commands.addCommand('test-zenith', {
      execute: (args: JSONObject) => {
        executed = 'test-zenith';
      },
      label: 'Zenith Label',
      icon: iconRenderer,
      className: 'testClass'
    });
    commands.addKeyBinding({
      keys: ['Ctrl T'],
      selector: 'body',
      command: 'test'
    });
  });

  beforeEach(() => {
    executed = '';
    menu = new Menu({ commands });
    logMenu = new LogMenu({ commands });
  });

  afterEach(() => {
    menu.dispose();
    logMenu.dispose();
  });

  describe('Menu', () => {
    describe('#constructor()', () => {
      it('should take options for initializing the menu', () => {
        let menu = new Menu({ commands });
        expect(menu).to.be.an.instanceof(Menu);
      });

      it('should add the `lm-Menu` class', () => {
        let menu = new Menu({ commands });
        expect(menu.hasClass('lm-Menu')).to.equal(true);
      });
    });

    describe('#dispose()', () => {
      it('should dispose of the resources held by the menu', () => {
        menu.addItem({});
        expect(menu.items.length).to.equal(1);
        menu.dispose();
        expect(menu.items.length).to.equal(0);
        expect(menu.isDisposed).to.equal(true);
      });
    });

    describe('#aboutToClose', () => {
      it('should be emitted just before the menu is closed', () => {
        let called = false;
        menu.open(0, 0);
        menu.aboutToClose.connect((sender, args) => {
          called = true;
        });
        menu.close();
        expect(called).to.equal(true);
      });

      it('should not be emitted if the menu is not attached', () => {
        let called = false;
        menu.open(0, 0);
        menu.aboutToClose.connect(() => {
          called = true;
        });
        Widget.detach(menu);
        menu.close();
        expect(called).to.equal(false);
      });
    });

    describe('menuRequested', () => {
      it('should be emitted when a left arrow key is pressed and a submenu cannot be opened or closed', () => {
        let called = false;
        menu.open(0, 0);
        menu.menuRequested.connect((sender, args) => {
          expect(args).to.equal('previous');
          called = true;
        });
        menu.node.dispatchEvent(
          new KeyboardEvent('keydown', {
            bubbles,
            keyCode: 37 // Left arrow
          })
        );
        expect(called).to.equal(true);
      });

      it('should be emitted when a right arrow key is pressed and a submenu cannot be opened or closed', () => {
        let called = false;
        menu.open(0, 0);
        menu.menuRequested.connect((sender, args) => {
          expect(args).to.equal('next');
          called = true;
        });
        menu.node.dispatchEvent(
          new KeyboardEvent('keydown', {
            bubbles,
            keyCode: 39 // Right arrow
          })
        );
        expect(called).to.equal(true);
      });

      it('should only be emitted for the root menu in a hierarchy', () => {
        let submenu = new Menu({ commands });
        let item = menu.addItem({ type: 'submenu', submenu });
        menu.open(0, 0);
        menu.activeItem = item;
        menu.triggerActiveItem();
        let called = false;
        let submenuCalled = false;
        menu.menuRequested.connect((sender, args) => {
          expect(args).to.equal('next');
          called = true;
        });
        submenu.menuRequested.connect(() => {
          submenuCalled = true;
        });
        submenu.node.dispatchEvent(
          new KeyboardEvent('keydown', {
            bubbles,
            keyCode: 39 // Right arrow
          })
        );
        expect(called).to.equal(true);
        expect(submenuCalled).to.equal(false);
      });
    });

    describe('#commands', () => {
      it('should be the command registry for the menu', () => {
        expect(menu.commands).to.equal(commands);
      });
    });

    describe('#renderer', () => {
      it('should default to the default renderer', () => {
        expect(menu.renderer).to.equal(Menu.defaultRenderer);
      });

      it('should be the renderer for the menu', () => {
        let renderer = Object.create(Menu.defaultRenderer);
        let menu = new Menu({ commands, renderer });
        expect(menu.renderer).to.equal(renderer);
      });
    });

    describe('#parentMenu', () => {
      it('should get the parent menu of the menu', () => {
        let submenu = new Menu({ commands });
        let item = menu.addItem({ type: 'submenu', submenu });
        menu.open(0, 0);
        menu.activeItem = item;
        menu.triggerActiveItem();
        expect(submenu.parentMenu).to.equal(menu);
      });

      it('should be `null` if the menu is not an open submenu', () => {
        let submenu = new Menu({ commands });
        menu.addItem({ type: 'submenu', submenu });
        menu.open(0, 0);
        expect(submenu.parentMenu).to.equal(null);
        expect(menu.parentMenu).to.equal(null);
      });
    });

    describe('#childMenu', () => {
      it('should get the child menu of the menu', () => {
        let submenu = new Menu({ commands });
        let item = menu.addItem({ type: 'submenu', submenu });
        menu.open(0, 0);
        menu.activeItem = item;
        menu.triggerActiveItem();
        expect(menu.childMenu).to.equal(submenu);
      });

      it('should be `null` if the menu does not have an open submenu', () => {
        let submenu = new Menu({ commands });
        menu.addItem({ type: 'submenu', submenu });
        menu.open(0, 0);
        expect(menu.childMenu).to.equal(null);
      });
    });

    describe('#rootMenu', () => {
      it('should get the root menu of the menu hierarchy', () => {
        let submenu1 = new Menu({ commands });
        let submenu2 = new Menu({ commands });
        let item1 = menu.addItem({ type: 'submenu', submenu: submenu1 });
        let item2 = submenu1.addItem({ type: 'submenu', submenu: submenu2 });
        menu.open(0, 0);
        menu.activeItem = item1;
        menu.triggerActiveItem();
        submenu1.activeItem = item2;
        submenu1.triggerActiveItem();
        expect(submenu2.rootMenu).to.equal(menu);
      });

      it('should be itself if the menu is not an open submenu', () => {
        let submenu1 = new Menu({ commands });
        let submenu2 = new Menu({ commands });
        menu.addItem({ type: 'submenu', submenu: submenu1 });
        submenu1.addItem({ type: 'submenu', submenu: submenu2 });
        menu.open(0, 0);
        expect(menu.rootMenu).to.equal(menu);
        expect(submenu1.rootMenu).to.equal(submenu1);
        expect(submenu2.rootMenu).to.equal(submenu2);
      });
    });

    describe('#leafMenu', () => {
      it('should get the leaf menu of the menu hierarchy', () => {
        let submenu1 = new Menu({ commands });
        let submenu2 = new Menu({ commands });
        let item1 = menu.addItem({ type: 'submenu', submenu: submenu1 });
        let item2 = submenu1.addItem({ type: 'submenu', submenu: submenu2 });
        menu.open(0, 0);
        menu.activeItem = item1;
        menu.triggerActiveItem();
        submenu1.activeItem = item2;
        submenu1.triggerActiveItem();
        expect(menu.leafMenu).to.equal(submenu2);
      });

      it('should be itself if the menu does not have an open submenu', () => {
        let submenu1 = new Menu({ commands });
        let submenu2 = new Menu({ commands });
        menu.addItem({ type: 'submenu', submenu: submenu1 });
        submenu1.addItem({ type: 'submenu', submenu: submenu2 });
        menu.open(0, 0);
        expect(menu.leafMenu).to.equal(menu);
        expect(submenu1.leafMenu).to.equal(submenu1);
        expect(submenu2.leafMenu).to.equal(submenu2);
      });
    });

    describe('#contentNode', () => {
      it('should get the menu content node', () => {
        let content = menu.contentNode;
        expect(content.classList.contains('lm-Menu-content')).to.equal(true);
      });
    });

    describe('#activeItem', () => {
      it('should get the currently active menu item', () => {
        let item = menu.addItem({ command: 'test' });
        menu.activeIndex = 0;
        expect(menu.activeItem).to.equal(item);
      });

      it('should be `null` if no menu item is active', () => {
        expect(menu.activeItem).to.equal(null);
        menu.addItem({ command: 'test' });
        expect(menu.activeItem).to.equal(null);
      });

      it('should set the currently active menu item', () => {
        expect(menu.activeItem).to.equal(null);
        let item = (menu.activeItem = menu.addItem({ command: 'test' }));
        expect(menu.activeItem).to.equal(item);
      });

      it('should set to `null` if the item cannot be activated', () => {
        expect(menu.activeItem).to.equal(null);
        menu.activeItem = menu.addItem({ command: 'test-disabled' });
        expect(menu.activeItem).to.equal(null);
      });
    });

    describe('#activeIndex', () => {
      it('should get the index of the currently active menu item', () => {
        menu.activeItem = menu.addItem({ command: 'test' });
        expect(menu.activeIndex).to.equal(0);
      });

      it('should be `-1` if no menu item is active', () => {
        expect(menu.activeIndex).to.equal(-1);
        menu.addItem({ command: 'test' });
        expect(menu.activeIndex).to.equal(-1);
      });

      it('should set the currently active menu item index', () => {
        expect(menu.activeIndex).to.equal(-1);
        menu.addItem({ command: 'test' });
        menu.activeIndex = 0;
        expect(menu.activeIndex).to.equal(0);
      });

      it('should set to `-1` if the item cannot be activated', () => {
        menu.addItem({ command: 'test-disabled' });
        menu.activeIndex = 0;
        expect(menu.activeIndex).to.equal(-1);
      });
    });

    describe('#items', () => {
      it('should be a read-only array of the menu items in the menu', () => {
        let item1 = menu.addItem({ command: 'foo' });
        let item2 = menu.addItem({ command: 'bar' });
        expect(menu.items).to.deep.equal([item1, item2]);
      });
    });

    describe('#activateNextItem()', () => {
      it('should activate the next selectable item in the menu', () => {
        menu.addItem({ command: 'test-disabled' });
        menu.addItem({ command: 'test' });
        menu.activateNextItem();
        expect(menu.activeIndex).to.equal(1);
      });

      it('should set the index to `-1` if no item is selectable', () => {
        menu.addItem({ command: 'test-disabled' });
        menu.addItem({ type: 'separator' });
        menu.activateNextItem();
        expect(menu.activeIndex).to.equal(-1);
      });
    });

    describe('#activatePreviousItem()', () => {
      it('should activate the next selectable item in the menu', () => {
        menu.addItem({ command: 'test' });
        menu.addItem({ command: 'test-disabled' });
        menu.activatePreviousItem();
        expect(menu.activeIndex).to.equal(0);
      });

      it('should set the index to `-1` if no item is selectable', () => {
        menu.addItem({ command: 'test-disabled' });
        menu.addItem({ type: 'separator' });
        menu.activatePreviousItem();
        expect(menu.activeIndex).to.equal(-1);
      });
    });

    describe('#triggerActiveItem()', () => {
      it('should execute a command if it is the active item', () => {
        menu.addItem({ command: 'test' });
        menu.open(0, 0);
        menu.activeIndex = 0;
        menu.triggerActiveItem();
        expect(executed).to.equal('test');
      });

      it('should open a submenu and activate the first item', () => {
        let submenu = new Menu({ commands });
        submenu.addItem({ command: 'test' });
        menu.addItem({ type: 'submenu', submenu });
        menu.open(0, 0);
        menu.activeIndex = 0;
        menu.triggerActiveItem();
        expect(submenu.parentMenu).to.equal(menu);
        expect(submenu.activeIndex).to.equal(0);
      });

      it('should be a no-op if the menu is not attached', () => {
        let submenu = new Menu({ commands });
        submenu.addItem({ command: 'test' });
        menu.addItem({ type: 'submenu', submenu });
        menu.activeIndex = 0;
        menu.triggerActiveItem();
        expect(submenu.parentMenu).to.equal(null);
        expect(submenu.activeIndex).to.equal(-1);
      });

      it('should be a no-op if there is no active item', () => {
        let submenu = new Menu({ commands });
        submenu.addItem({ command: 'test' });
        menu.addItem({ type: 'submenu', submenu });
        menu.open(0, 0);
        menu.triggerActiveItem();
        expect(submenu.parentMenu).to.equal(null);
        expect(submenu.activeIndex).to.equal(-1);
      });
    });

    describe('#addItem()', () => {
      it('should add a menu item to the end of the menu', () => {
        menu.addItem({});
        let item = menu.addItem({ command: 'test' });
        expect(menu.items[1]).to.equal(item);
      });
    });

    describe('#insertItem()', () => {
      it('should insert a menu item into the menu at the specified index', () => {
        let item1 = menu.insertItem(0, { command: 'test' });
        let item2 = menu.insertItem(0, { command: 'test-disabled' });
        let item3 = menu.insertItem(0, { command: 'test-toggled' });
        expect(menu.items[0]).to.equal(item3);
        expect(menu.items[1]).to.equal(item2);
        expect(menu.items[2]).to.equal(item1);
      });

      it('should clamp the index to the bounds of the items', () => {
        let item1 = menu.insertItem(0, { command: 'test' });
        let item2 = menu.insertItem(10, { command: 'test-disabled' });
        let item3 = menu.insertItem(-10, { command: 'test-toggled' });
        expect(menu.items[0]).to.equal(item3);
        expect(menu.items[1]).to.equal(item1);
        expect(menu.items[2]).to.equal(item2);
      });

      it('should close the menu if attached', () => {
        menu.open(0, 0);
        expect(menu.isAttached).to.equal(true);
        menu.insertItem(0, { command: 'test' });
        expect(menu.isAttached).to.equal(false);
      });
    });

    describe('#removeItem()', () => {
      it('should remove a menu item from the menu by value', () => {
        menu.removeItem(menu.addItem({ command: 'test' }));
        expect(menu.items.length).to.equal(0);
      });

      it('should close the menu if it is attached', () => {
        let item = menu.addItem({ command: 'test' });
        menu.open(0, 0);
        expect(menu.isAttached).to.equal(true);
        menu.removeItem(item);
        expect(menu.isAttached).to.equal(false);
      });
    });

    describe('#removeItemAt()', () => {
      it('should remove a menu item from the menu by index', () => {
        menu.addItem({ command: 'test' });
        menu.removeItemAt(0);
        expect(menu.items.length).to.equal(0);
      });

      it('should close the menu if it is attached', () => {
        menu.addItem({ command: 'test' });
        menu.open(0, 0);
        expect(menu.isAttached).to.equal(true);
        menu.removeItemAt(0);
        expect(menu.isAttached).to.equal(false);
      });
    });

    describe('#clearItems()', () => {
      it('should remove all items from the menu', () => {
        menu.addItem({ command: 'test-disabled' });
        menu.addItem({ command: 'test' });
        menu.activeIndex = 1;
        menu.clearItems();
        expect(menu.items.length).to.equal(0);
        expect(menu.activeIndex).to.equal(-1);
      });

      it('should close the menu if it is attached', () => {
        menu.addItem({ command: 'test-disabled' });
        menu.addItem({ command: 'test' });
        menu.open(0, 0);
        expect(menu.isAttached).to.equal(true);
        menu.clearItems();
        expect(menu.isAttached).to.equal(false);
      });
    });

    describe('#open()', () => {
      it('should open the menu at the specified location', () => {
        menu.addItem({ command: 'test' });
        menu.open(10, 10);
        expect(menu.node.style.transform).to.equal('translate(10px, 10px)');
      });

      it('should be adjusted to fit naturally on the screen', () => {
        menu.addItem({ command: 'test' });
        menu.open(-10, 10000);
        expect(
          menu.node.style.transform.startsWith('translate(0px, ')
        ).to.equal(true);
        expect(menu.node.style.transform.endsWith(', 10000px)')).to.equal(
          false
        );
      });

      it('should accept flags to force the location', () => {
        menu.addItem({ command: 'test' });
        menu.open(10000, 10000, { forceX: true, forceY: true });
        expect(menu.node.style.transform).to.equal(
          'translate(10000px, 10000px)'
        );
      });

      it('should bail if already attached', () => {
        menu.addItem({ command: 'test' });
        menu.open(10, 10);
        menu.open(100, 100);
        expect(menu.node.style.transform).to.equal('translate(10px, 10px)');
      });
    });

    describe('#handleEvent()', () => {
      context('keydown', () => {
        it('should trigger the active item on enter', () => {
          menu.addItem({ command: 'test' });
          menu.activeIndex = 0;
          menu.open(0, 0);
          menu.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              bubbles,
              keyCode: 13 // Enter
            })
          );
          expect(executed).to.equal('test');
        });

        it('should close the menu on escape', () => {
          menu.open(0, 0);
          expect(menu.isAttached).to.equal(true);
          menu.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              bubbles,
              keyCode: 27 // Escape
            })
          );
          expect(menu.isAttached).to.equal(false);
        });

        it('should close the menu on left arrow if there is a parent menu', () => {
          let submenu = new Menu({ commands });
          submenu.addItem({ command: 'test' });
          menu.addItem({ type: 'submenu', submenu });
          menu.open(0, 0);
          menu.activateNextItem();
          menu.triggerActiveItem();
          expect(menu.childMenu).to.equal(submenu);
          submenu.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              bubbles,
              keyCode: 37 // Left arrow
            })
          );
          expect(menu.childMenu).to.equal(null);
        });

        it('should activate the previous item on up arrow', () => {
          menu.addItem({ command: 'test' });
          menu.addItem({ command: 'test' });
          menu.addItem({ command: 'test' });
          menu.open(0, 0);
          menu.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              bubbles,
              keyCode: 38 // Up arrow
            })
          );
          expect(menu.activeIndex).to.equal(2);
        });

        it('should trigger the active item on right arrow if the item is a submenu', () => {
          let submenu = new Menu({ commands });
          submenu.addItem({ command: 'test' });
          menu.addItem({ type: 'submenu', submenu });
          menu.open(0, 0);
          menu.activateNextItem();
          expect(menu.childMenu).to.equal(null);
          menu.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              bubbles,
              keyCode: 39 // Right arrow
            })
          );
          expect(menu.childMenu).to.equal(submenu);
        });

        it('should activate the next item on down arrow', () => {
          menu.addItem({ command: 'test' });
          menu.addItem({ command: 'test' });
          menu.open(0, 0);
          menu.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              bubbles,
              keyCode: 40 // Down arrow
            })
          );
          expect(menu.activeIndex).to.equal(0);
        });

        it('should activate the first matching mnemonic', () => {
          let submenu1 = new Menu({ commands });
          submenu1.title.label = 'foo';
          submenu1.title.mnemonic = 0;
          submenu1.addItem({ command: 'test' });

          let submenu2 = new Menu({ commands });
          submenu2.title.label = 'bar';
          submenu2.title.mnemonic = 0;
          submenu2.addItem({ command: 'test' });

          menu.addItem({ type: 'submenu', submenu: submenu1 });
          menu.addItem({ type: 'separator' });
          menu.addItem({ type: 'submenu', submenu: submenu2 });

          menu.open(0, 0);
          menu.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              bubbles,
              keyCode: 70 // `F` key
            })
          );
          expect(menu.activeIndex).to.equal(0);
        });

        it('should activate an item with no matching mnemonic, but matching first character', () => {
          menu.addItem({ command: 'test' });
          menu.addItem({ command: 'test-disabled' });
          menu.addItem({ command: 'test-toggled' });
          menu.addItem({ command: 'test-hidden' });
          menu.addItem({ command: 'test-zenith' });
          menu.open(0, 0);
          expect(menu.activeIndex).to.equal(-1);
          menu.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              bubbles,
              keyCode: 90 // `Z` key
            })
          );
          expect(menu.activeIndex).to.equal(4);
        });
      });

      context('mouseup', () => {
        it('should trigger the active item', () => {
          menu.addItem({ command: 'test' });
          menu.activeIndex = 0;
          menu.open(0, 0);
          menu.node.dispatchEvent(new MouseEvent('mouseup', { bubbles }));
          expect(executed).to.equal('test');
        });

        it('should bail if not a left mouse button', () => {
          menu.addItem({ command: 'test' });
          menu.activeIndex = 0;
          menu.open(0, 0);
          menu.node.dispatchEvent(
            new MouseEvent('mouseup', {
              bubbles,
              button: 1
            })
          );
          expect(executed).to.equal('');
        });
      });

      context('mousemove', () => {
        it('should set the active index', () => {
          menu.addItem({ command: 'test' });
          menu.open(0, 0);
          let node = menu.node.getElementsByClassName('lm-Menu-item')[0];
          let rect = node.getBoundingClientRect();
          menu.node.dispatchEvent(
            new MouseEvent('mousemove', {
              bubbles,
              clientX: rect.left,
              clientY: rect.top
            })
          );
          expect(menu.activeIndex).to.equal(0);
        });

        it('should open a child menu after a timeout', done => {
          let submenu = new Menu({ commands });
          submenu.addItem({ command: 'test' });
          submenu.title.label = 'Test Label';
          menu.addItem({ type: 'submenu', submenu });
          menu.open(0, 0);
          let node = menu.node.getElementsByClassName('lm-Menu-item')[0];
          let rect = node.getBoundingClientRect();
          menu.node.dispatchEvent(
            new MouseEvent('mousemove', {
              bubbles,
              clientX: rect.left,
              clientY: rect.top
            })
          );
          expect(menu.activeIndex).to.equal(0);
          expect(submenu.isAttached).to.equal(false);
          setTimeout(() => {
            expect(submenu.isAttached).to.equal(true);
            done();
          }, 500);
        });

        it('should close an open sub menu', done => {
          let submenu = new Menu({ commands });
          submenu.addItem({ command: 'test' });
          submenu.title.label = 'Test Label';
          menu.addItem({ command: 'test' });
          menu.addItem({ type: 'submenu', submenu });
          menu.open(0, 0);
          menu.activeIndex = 1;
          menu.triggerActiveItem();
          let node = menu.node.getElementsByClassName('lm-Menu-item')[0];
          let rect = node.getBoundingClientRect();
          menu.node.dispatchEvent(
            new MouseEvent('mousemove', {
              bubbles,
              clientX: rect.left,
              clientY: rect.top
            })
          );
          expect(menu.activeIndex).to.equal(0);
          expect(submenu.isAttached).to.equal(true);
          setTimeout(() => {
            expect(submenu.isAttached).to.equal(false);
            done();
          }, 500);
        });
      });

      context('mouseleave', () => {
        it('should reset the active index', () => {
          let submenu = new Menu({ commands });
          submenu.addItem({ command: 'test' });
          submenu.title.label = 'Test Label';
          menu.addItem({ type: 'submenu', submenu });
          menu.open(0, 0);
          let node = menu.node.getElementsByClassName('lm-Menu-item')[0];
          let rect = node.getBoundingClientRect();
          menu.node.dispatchEvent(
            new MouseEvent('mousemove', {
              bubbles,
              clientX: rect.left,
              clientY: rect.top
            })
          );
          expect(menu.activeIndex).to.equal(0);
          menu.node.dispatchEvent(
            new MouseEvent('mouseleave', {
              bubbles,
              clientX: rect.left,
              clientY: rect.top
            })
          );
          expect(menu.activeIndex).to.equal(-1);
          menu.dispose();
        });
      });

      context('mousedown', () => {
        it('should not close the menu if on a child node', () => {
          menu.addItem({ command: 'test' });
          menu.open(0, 0);
          expect(menu.isAttached).to.equal(true);
          let rect = menu.node.getBoundingClientRect();
          menu.node.dispatchEvent(
            new MouseEvent('mousedown', {
              bubbles,
              clientX: rect.left,
              clientY: rect.top
            })
          );
          expect(menu.isAttached).to.equal(true);
        });

        it('should close the menu if not on a child node', () => {
          menu.addItem({ command: 'test' });
          menu.open(0, 0);
          expect(menu.isAttached).to.equal(true);
          menu.node.dispatchEvent(
            new MouseEvent('mousedown', {
              bubbles,
              clientX: -10
            })
          );
          expect(menu.isAttached).to.equal(false);
        });
      });
    });

    describe('#onBeforeAttach()', () => {
      it('should add event listeners', () => {
        let node = logMenu.node;
        logMenu.open(0, 0);
        expect(logMenu.methods).to.contain('onBeforeAttach');
        node.dispatchEvent(new KeyboardEvent('keydown', { bubbles }));
        expect(logMenu.events).to.contain('keydown');
        node.dispatchEvent(new MouseEvent('mouseup', { bubbles }));
        expect(logMenu.events).to.contain('mouseup');
        node.dispatchEvent(new MouseEvent('mousemove', { bubbles }));
        expect(logMenu.events).to.contain('mousemove');
        node.dispatchEvent(new MouseEvent('mouseenter', { bubbles }));
        expect(logMenu.events).to.contain('mouseenter');
        node.dispatchEvent(new MouseEvent('mouseleave', { bubbles }));
        expect(logMenu.events).to.contain('mouseleave');
        node.dispatchEvent(new MouseEvent('contextmenu', { bubbles }));
        expect(logMenu.events).to.contain('contextmenu');
        document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles }));
        expect(logMenu.events).to.contain('mousedown');
      });
    });

    describe('#onAfterDetach()', () => {
      it('should remove event listeners', () => {
        let node = logMenu.node;
        logMenu.open(0, 0);
        logMenu.close();
        expect(logMenu.methods).to.contain('onAfterDetach');
        node.dispatchEvent(new KeyboardEvent('keydown', { bubbles }));
        expect(logMenu.events).to.not.contain('keydown');
        node.dispatchEvent(new MouseEvent('mouseup', { bubbles }));
        expect(logMenu.events).to.not.contain('mouseup');
        node.dispatchEvent(new MouseEvent('mousemove', { bubbles }));
        expect(logMenu.events).to.not.contain('mousemove');
        node.dispatchEvent(new MouseEvent('mouseenter', { bubbles }));
        expect(logMenu.events).to.not.contain('mouseenter');
        node.dispatchEvent(new MouseEvent('mouseleave', { bubbles }));
        expect(logMenu.events).to.not.contain('mouseleave');
        node.dispatchEvent(new MouseEvent('contextmenu', { bubbles }));
        expect(logMenu.events).to.not.contain('contextmenu');
        document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles }));
        expect(logMenu.events).to.not.contain('mousedown');
      });
    });

    describe('#onActivateRequest', () => {
      it('should focus the menu', done => {
        logMenu.open(0, 0);
        expect(document.activeElement).to.not.equal(logMenu.node);
        expect(logMenu.methods).to.not.contain('onActivateRequest');
        requestAnimationFrame(() => {
          expect(document.activeElement).to.equal(logMenu.node);
          expect(logMenu.methods).to.contain('onActivateRequest');
          done();
        });
      });
    });

    describe('#onUpdateRequest()', () => {
      it('should be called prior to opening', () => {
        expect(logMenu.methods).to.not.contain('onUpdateRequest');
        logMenu.open(0, 0);
        expect(logMenu.methods).to.contain('onUpdateRequest');
      });

      it('should collapse extra separators', () => {
        menu.addItem({ type: 'separator' });
        menu.addItem({ command: 'test' });
        menu.addItem({ type: 'separator' });
        menu.addItem({ type: 'separator' });
        menu.addItem({ type: 'submenu', submenu: new Menu({ commands }) });
        menu.addItem({ type: 'separator' });
        menu.open(0, 0);
        let elements = menu.node.querySelectorAll(
          '.lm-Menu-item[data-type="separator"'
        );
        expect(elements.length).to.equal(4);
        expect(elements[0].classList.contains('lm-mod-collapsed')).to.equal(
          true
        );
        expect(elements[1].classList.contains('lm-mod-collapsed')).to.equal(
          false
        );
        expect(elements[2].classList.contains('lm-mod-collapsed')).to.equal(
          true
        );
        expect(elements[3].classList.contains('lm-mod-collapsed')).to.equal(
          true
        );
      });
    });

    describe('#onCloseRequest()', () => {
      it('should reset the active index', () => {
        menu.addItem({ command: 'test' });
        menu.activeIndex = 0;
        menu.open(0, 0);
        menu.close();
        expect(menu.activeIndex).to.equal(-1);
      });

      it('should close any open child menu', () => {
        let submenu = new Menu({ commands });
        submenu.addItem({ command: 'test' });
        menu.addItem({ type: 'submenu', submenu });
        menu.open(0, 0);
        menu.activateNextItem();
        menu.triggerActiveItem();
        expect(menu.childMenu).to.equal(submenu);
        expect(submenu.isAttached).equal(true);
        menu.close();
        expect(menu.childMenu).to.equal(null);
        expect(submenu.isAttached).equal(false);
      });

      it('should remove the menu from its parent and activate the parent', done => {
        let submenu = new Menu({ commands });
        submenu.addItem({ command: 'test' });
        menu.addItem({ type: 'submenu', submenu });
        menu.open(0, 0);
        menu.activateNextItem();
        menu.triggerActiveItem();
        expect(menu.childMenu).to.equal(submenu);
        expect(submenu.parentMenu).to.equal(menu);
        expect(submenu.isAttached).to.equal(true);
        submenu.close();
        expect(menu.childMenu).to.equal(null);
        expect(submenu.parentMenu).to.equal(null);
        expect(submenu.isAttached).to.equal(false);
        requestAnimationFrame(() => {
          expect(document.activeElement).to.equal(menu.node);
          done();
        });
      });

      it('should emit the `aboutToClose` signal if attached', () => {
        let called = false;
        menu.open(0, 0);
        menu.aboutToClose.connect((sender, args) => {
          expect(sender).to.equal(menu);
          expect(args).to.equal(undefined);
          called = true;
        });
        menu.close();
        expect(called).to.equal(true);
      });
    });

    describe('.IItem', () => {
      describe('#type', () => {
        it('should get the type of the menu item', () => {
          let item = menu.addItem({ type: 'separator' });
          expect(item.type).to.equal('separator');
        });

        it("should default to `'command'`", () => {
          let item = menu.addItem({});
          expect(item.type).to.equal('command');
        });
      });

      describe('#command', () => {
        it('should get the command to execute when the item is triggered', () => {
          let item = menu.addItem({ command: 'foo' });
          expect(item.command).to.equal('foo');
        });

        it('should default to an empty string', () => {
          let item = menu.addItem({});
          expect(item.command).to.equal('');
        });
      });

      describe('#args', () => {
        it('should get the arguments for the command', () => {
          let item = menu.addItem({ args: { foo: 1 } });
          expect(item.args).to.deep.equal({ foo: 1 });
        });

        it('should default to an empty object', () => {
          let item = menu.addItem({});
          expect(item.args).to.deep.equal({});
        });
      });

      describe('#submenu', () => {
        it('should get the submenu for the item', () => {
          let submenu = new Menu({ commands });
          let item = menu.addItem({ submenu });
          expect(item.submenu).to.equal(submenu);
        });

        it('should default to `null`', () => {
          let item = menu.addItem({});
          expect(item.submenu).to.equal(null);
        });
      });

      describe('#label', () => {
        it('should get the label of a command item for a `command` type', () => {
          let item = menu.addItem({ command: 'test' });
          expect(item.label).to.equal('Test Label');
        });

        it('should get the title label of a submenu item for a `submenu` type', () => {
          let submenu = new Menu({ commands });
          submenu.title.label = 'foo';
          let item = menu.addItem({ type: 'submenu', submenu });
          expect(item.label).to.equal('foo');
        });

        it('should default to an empty string', () => {
          let item = menu.addItem({});
          expect(item.label).to.equal('');
          item = menu.addItem({ type: 'separator' });
          expect(item.label).to.equal('');
        });
      });

      describe('#mnemonic', () => {
        it('should get the mnemonic index of a command item for a `command` type', () => {
          let item = menu.addItem({ command: 'test' });
          expect(item.mnemonic).to.equal(0);
        });

        it('should get the title mnemonic of a submenu item for a `submenu` type', () => {
          let submenu = new Menu({ commands });
          submenu.title.mnemonic = 1;
          let item = menu.addItem({ type: 'submenu', submenu });
          expect(item.mnemonic).to.equal(1);
        });

        it('should default to `-1`', () => {
          let item = menu.addItem({});
          expect(item.mnemonic).to.equal(-1);
          item = menu.addItem({ type: 'separator' });
          expect(item.mnemonic).to.equal(-1);
        });
      });

      describe('#icon', () => {
        it('should get the title icon of a submenu item for a `submenu` type', () => {
          let submenu = new Menu({ commands });
          submenu.title.iconClass = 'bar';
          let item = menu.addItem({ type: 'submenu', submenu });
          expect(item.iconClass).to.equal('bar');
        });

        it('should default to undefined', () => {
          let item = menu.addItem({});
          expect(item.icon).to.equal(undefined);
          item = menu.addItem({ type: 'separator' });
          expect(item.icon).to.equal(undefined);
        });
      });

      describe('#caption', () => {
        it('should get the caption of a command item for a `command` type', () => {
          let item = menu.addItem({ command: 'test' });
          expect(item.caption).to.equal('Test Caption');
        });

        it('should get the title caption of a submenu item for a `submenu` type', () => {
          let submenu = new Menu({ commands });
          submenu.title.caption = 'foo caption';
          let item = menu.addItem({ type: 'submenu', submenu });
          expect(item.caption).to.equal('foo caption');
        });

        it('should default to an empty string', () => {
          let item = menu.addItem({});
          expect(item.caption).to.equal('');
          item = menu.addItem({ type: 'separator' });
          expect(item.caption).to.equal('');
        });
      });

      describe('#className', () => {
        it('should get the extra class name of a command item for a `command` type', () => {
          let item = menu.addItem({ command: 'test' });
          expect(item.className).to.equal('testClass');
        });

        it('should get the title extra class name of a submenu item for a `submenu` type', () => {
          let submenu = new Menu({ commands });
          submenu.title.className = 'fooClass';
          let item = menu.addItem({ type: 'submenu', submenu });
          expect(item.className).to.equal('fooClass');
        });

        it('should default to an empty string', () => {
          let item = menu.addItem({});
          expect(item.className).to.equal('');
          item = menu.addItem({ type: 'separator' });
          expect(item.className).to.equal('');
        });
      });

      describe('#isEnabled', () => {
        it('should get whether the command is enabled for a `command` type', () => {
          let item = menu.addItem({ command: 'test-disabled' });
          expect(item.isEnabled).to.equal(false);
          item = menu.addItem({ type: 'command' });
          expect(item.isEnabled).to.equal(false);
          item = menu.addItem({ command: 'test' });
          expect(item.isEnabled).to.equal(true);
        });

        it('should get whether there is a submenu for a `submenu` type', () => {
          let submenu = new Menu({ commands });
          let item = menu.addItem({ type: 'submenu', submenu });
          expect(item.isEnabled).to.equal(true);
          item = menu.addItem({ type: 'submenu' });
          expect(item.isEnabled).to.equal(false);
        });

        it('should be `true` for a separator item', () => {
          let item = menu.addItem({ type: 'separator' });
          expect(item.isEnabled).to.equal(true);
        });
      });

      describe('#isToggled', () => {
        it('should get whether the command is toggled for a `command` type', () => {
          let item = menu.addItem({ command: 'test-toggled' });
          expect(item.isToggled).to.equal(true);
          item = menu.addItem({ command: 'test' });
          expect(item.isToggled).to.equal(false);
          item = menu.addItem({ type: 'command' });
          expect(item.isToggled).to.equal(false);
        });

        it('should be `false` for other item types', () => {
          let item = menu.addItem({ type: 'separator' });
          expect(item.isToggled).to.equal(false);
          item = menu.addItem({ type: 'submenu' });
          expect(item.isToggled).to.equal(false);
        });
      });

      describe('#isVisible', () => {
        it('should get whether the command is visible for a `command` type', () => {
          let item = menu.addItem({ command: 'test-hidden' });
          expect(item.isVisible).to.equal(false);
          item = menu.addItem({ command: 'test' });
          expect(item.isVisible).to.equal(true);
        });

        it('should get whether there is a submenu for a `submenu` type', () => {
          let submenu = new Menu({ commands });
          let item = menu.addItem({ type: 'submenu', submenu });
          expect(item.isVisible).to.equal(true);
          item = menu.addItem({ type: 'submenu' });
          expect(item.isVisible).to.equal(false);
        });

        it('should be `true` for a separator item', () => {
          let item = menu.addItem({ type: 'separator' });
          expect(item.isVisible).to.equal(true);
        });
      });

      describe('#keyBinding', () => {
        it('should get the key binding for the menu item', () => {
          let item = menu.addItem({ command: 'test' });
          expect(item.keyBinding!.keys).to.deep.equal(['Ctrl T']);
        });

        it('should be `null` for submenus and separators', () => {
          let item = menu.addItem({ type: 'separator' });
          expect(item.keyBinding).to.equal(null);
          item = menu.addItem({ type: 'submenu' });
          expect(item.keyBinding).to.equal(null);
        });
      });
    });

    describe('.Renderer', () => {
      let renderer = new Menu.Renderer();

      describe('#renderItem()', () => {
        it('should render an item node for the menu', () => {
          let item = menu.addItem({ command: 'test' });
          let vNode = renderer.renderItem({
            item,
            active: false,
            collapsed: false
          });
          let node = VirtualDOM.realize(vNode);
          expect(node.classList.contains('lm-Menu-item')).to.equal(true);
          expect(node.classList.contains('lm-mod-hidden')).to.equal(false);
          expect(node.classList.contains('lm-mod-disabled')).to.equal(false);
          expect(node.classList.contains('lm-mod-toggled')).to.equal(false);
          expect(node.classList.contains('lm-mod-active')).to.equal(false);
          expect(node.classList.contains('lm-mod-collapsed')).to.equal(false);
          expect(node.getAttribute('data-command')).to.equal('test');
          expect(node.getAttribute('data-type')).to.equal('command');
          expect(node.querySelector('.lm-Menu-itemIcon')).to.not.equal(null);
          expect(node.querySelector('.lm-Menu-itemLabel')).to.not.equal(null);
          expect(node.querySelector('.lm-Menu-itemSubmenuIcon')).to.not.equal(
            null
          );
        });

        it('should handle the hidden item state', () => {
          let item = menu.addItem({ command: 'test-hidden' });
          let vNode = renderer.renderItem({
            item,
            active: false,
            collapsed: false
          });
          let node = VirtualDOM.realize(vNode);
          expect(node.classList.contains('lm-mod-hidden')).to.equal(true);
        });

        it('should handle the disabled item state', () => {
          let item = menu.addItem({ command: 'test-disabled' });
          let vNode = renderer.renderItem({
            item,
            active: false,
            collapsed: false
          });
          let node = VirtualDOM.realize(vNode);
          expect(node.classList.contains('lm-mod-disabled')).to.equal(true);
        });

        it('should handle the toggled item state', () => {
          let item = menu.addItem({ command: 'test-toggled' });
          let vNode = renderer.renderItem({
            item,
            active: false,
            collapsed: false
          });
          let node = VirtualDOM.realize(vNode);
          expect(node.classList.contains('lm-mod-toggled')).to.equal(true);
        });

        it('should handle the active item state', () => {
          let item = menu.addItem({ command: 'test' });
          let vNode = renderer.renderItem({
            item,
            active: true,
            collapsed: false
          });
          let node = VirtualDOM.realize(vNode);
          expect(node.classList.contains('lm-mod-active')).to.equal(true);
        });

        it('should handle the collapsed item state', () => {
          let item = menu.addItem({ command: 'test-collapsed' });
          let vNode = renderer.renderItem({
            item,
            active: false,
            collapsed: true
          });
          let node = VirtualDOM.realize(vNode);
          expect(node.classList.contains('lm-mod-collapsed')).to.equal(true);
        });
      });

      describe('#renderIcon()', () => {
        it('should render the icon node for the menu', () => {
          let item = menu.addItem({ command: 'test' });
          let vNode = renderer.renderIcon({
            item,
            active: false,
            collapsed: false
          });
          let node = VirtualDOM.realize(vNode);
          expect(node.classList.contains('lm-Menu-itemIcon')).to.equal(true);
          expect(node.classList.contains('foo')).to.equal(true);
        });
      });

      describe('#renderLabel()', () => {
        it('should render the label node for the menu', () => {
          let item = menu.addItem({ command: 'test' });
          let vNode = renderer.renderLabel({
            item,
            active: false,
            collapsed: false
          });
          let node = VirtualDOM.realize(vNode);
          let span = '<span class="lm-Menu-itemMnemonic">T</span>est Label';
          expect(node.classList.contains('lm-Menu-itemLabel')).to.equal(true);
          expect(node.innerHTML).to.equal(span);
        });
      });

      describe('#renderShortcut()', () => {
        it('should render the shortcut node for the menu', () => {
          let item = menu.addItem({ command: 'test' });
          let vNode = renderer.renderShortcut({
            item,
            active: false,
            collapsed: false
          });
          let node = VirtualDOM.realize(vNode);
          expect(node.classList.contains('lm-Menu-itemShortcut')).to.equal(
            true
          );
          if (Platform.IS_MAC) {
            expect(node.innerHTML).to.equal('\u2303 T');
          } else {
            expect(node.innerHTML).to.equal('Ctrl+T');
          }
        });
      });

      describe('#renderSubmenu()', () => {
        it('should render the submenu icon node for the menu', () => {
          let item = menu.addItem({ command: 'test' });
          let vNode = renderer.renderSubmenu({
            item,
            active: false,
            collapsed: false
          });
          let node = VirtualDOM.realize(vNode);
          expect(node.classList.contains('lm-Menu-itemSubmenuIcon')).to.equal(
            true
          );
        });
      });

      describe('#createItemClass()', () => {
        it('should create the full class name for the item node', () => {
          let item = menu.addItem({ command: 'test' });

          let name = renderer.createItemClass({
            item,
            active: false,
            collapsed: false
          });
          let expected = 'lm-Menu-item testClass';
          expect(name).to.equal(expected);

          name = renderer.createItemClass({
            item,
            active: true,
            collapsed: false
          });
          expected = 'lm-Menu-item lm-mod-active testClass';
          expect(name).to.equal(expected);

          name = renderer.createItemClass({
            item,
            active: false,
            collapsed: true
          });
          expected = 'lm-Menu-item lm-mod-collapsed testClass';
          expect(name).to.equal(expected);

          item = menu.addItem({ command: 'test-disabled' });
          name = renderer.createItemClass({
            item,
            active: false,
            collapsed: false
          });
          expected = 'lm-Menu-item lm-mod-disabled testClass';
          expect(name).to.equal(expected);

          item = menu.addItem({ command: 'test-toggled' });
          name = renderer.createItemClass({
            item,
            active: false,
            collapsed: false
          });
          expected = 'lm-Menu-item lm-mod-toggled testClass';
          expect(name).to.equal(expected);

          item = menu.addItem({ command: 'test-hidden' });
          name = renderer.createItemClass({
            item,
            active: false,
            collapsed: false
          });
          expected = 'lm-Menu-item lm-mod-hidden testClass';
          expect(name).to.equal(expected);

          let submenu = new Menu({ commands });
          submenu.title.className = 'fooClass';
          item = menu.addItem({ type: 'submenu', submenu });
          name = renderer.createItemClass({
            item,
            active: false,
            collapsed: false
          });
          expected = 'lm-Menu-item fooClass';
          expect(name).to.equal(expected);
        });
      });

      describe('#createItemDataset()', () => {
        it('should create the item dataset', () => {
          let item = menu.addItem({ command: 'test' });
          let dataset = renderer.createItemDataset({
            item,
            active: false,
            collapsed: false
          });
          expect(dataset).to.deep.equal({ type: 'command', command: 'test' });

          item = menu.addItem({ type: 'separator' });
          dataset = renderer.createItemDataset({
            item,
            active: false,
            collapsed: false
          });
          expect(dataset).to.deep.equal({ type: 'separator' });

          let submenu = new Menu({ commands });
          item = menu.addItem({ type: 'submenu', submenu });
          dataset = renderer.createItemDataset({
            item,
            active: false,
            collapsed: false
          });
          expect(dataset).to.deep.equal({ type: 'submenu' });
        });
      });

      describe('#createIconClass()', () => {
        it('should create the icon class name', () => {
          let item = menu.addItem({ command: 'test' });
          let name = renderer.createIconClass({
            item,
            active: false,
            collapsed: false
          });
          let expected = 'lm-Menu-itemIcon foo';
          expect(name).to.equal(expected);

          item = menu.addItem({ type: 'separator' });
          name = renderer.createIconClass({
            item,
            active: false,
            collapsed: false
          });
          expected = 'lm-Menu-itemIcon';
          expect(name).to.equal(expected);

          let submenu = new Menu({ commands });
          submenu.title.iconClass = 'bar';
          item = menu.addItem({ type: 'submenu', submenu });
          name = renderer.createIconClass({
            item,
            active: false,
            collapsed: false
          });
          expected = 'lm-Menu-itemIcon bar';
          expect(name).to.equal(expected);
        });
      });

      describe('#formatLabel()', () => {
        it('should format the item label', () => {
          let item = menu.addItem({ command: 'test' });
          let child = renderer.formatLabel({
            item,
            active: false,
            collapsed: false
          });
          let node = VirtualDOM.realize(h.div(child));
          let span = '<span class="lm-Menu-itemMnemonic">T</span>est Label';
          expect(node.innerHTML).to.equal(span);

          item = menu.addItem({ type: 'separator' });
          child = renderer.formatLabel({
            item,
            active: false,
            collapsed: false
          });
          expect(child).to.equal('');

          let submenu = new Menu({ commands });
          submenu.title.label = 'Submenu Label';
          item = menu.addItem({ type: 'submenu', submenu });
          child = renderer.formatLabel({
            item,
            active: false,
            collapsed: false
          });
          expect(child).to.equal('Submenu Label');
        });
      });

      describe('#formatShortcut()', () => {
        it('should format the item shortcut', () => {
          let item = menu.addItem({ command: 'test' });
          let child = renderer.formatShortcut({
            item,
            active: false,
            collapsed: false
          });
          if (Platform.IS_MAC) {
            expect(child).to.equal('\u2303 T');
          } else {
            expect(child).to.equal('Ctrl+T');
          }
        });
      });
    });
  });
});
