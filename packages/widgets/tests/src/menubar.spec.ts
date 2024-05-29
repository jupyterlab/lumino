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

import { JSONObject } from '@lumino/coreutils';

import { CommandRegistry } from '@lumino/commands';

import { DisposableSet } from '@lumino/disposable';

import { Message, MessageLoop } from '@lumino/messaging';

import { VirtualDOM, VirtualElement } from '@lumino/virtualdom';

import { Menu, MenuBar, Widget } from '@lumino/widgets';

class LogMenuBar extends MenuBar {
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

const bubbles = true;
const cancelable = true;

describe('@lumino/widgets', () => {
  const DEFAULT_CMD = 'menubar.spec.ts:defaultCmd';

  const disposables = new DisposableSet();

  let commands: CommandRegistry;

  function createMenu() {
    let menu = new Menu({ commands });
    // Several tests rely on this function returning a non-empty menu
    menu.addItem({ command: DEFAULT_CMD });
    return menu;
  }

  function createMenuBar(options?: MenuBar.IOptions): MenuBar {
    let bar = new MenuBar(options);
    for (let i = 0; i < 3; i++) {
      let menu = createMenu();
      menu.title.label = `Menu${i}`;
      menu.title.mnemonic = 4;
      bar.addMenu(menu);
    }
    bar.activeIndex = 0;
    Widget.attach(bar, document.body);
    // Force an update.
    MessageLoop.sendMessage(bar, Widget.Msg.UpdateRequest);
    return bar;
  }

  /**
   * Create a MenuBar that has no active menu item.
   */
  function createUnfocusedMenuBar(): MenuBar {
    const bar = createMenuBar();
    bar.activeIndex = -1;
    return bar;
  }

  before(() => {
    commands = new CommandRegistry();
    const iconRenderer = {
      render: (host: HTMLElement, options?: any) => {
        const renderNode = document.createElement('div');
        renderNode.className = 'foo';
        host.appendChild(renderNode);
      }
    };
    let cmd = commands.addCommand(DEFAULT_CMD, {
      execute: (args: JSONObject) => {
        return args;
      },
      label: 'LABEL',
      icon: iconRenderer,
      className: 'bar',
      isToggled: (args: JSONObject) => {
        return true;
      },
      mnemonic: 1
    });
    let kbd = commands.addKeyBinding({
      keys: ['A'],
      selector: '*',
      command: DEFAULT_CMD
    });
    disposables.add(cmd);
    disposables.add(kbd);
  });

  after(() => {
    disposables.dispose();
  });

  describe('MenuBar', () => {
    describe('#constructor()', () => {
      it('should take no arguments', () => {
        let bar = new MenuBar();
        expect(bar).to.be.an.instanceof(MenuBar);
        bar.dispose();
      });

      it('should take options for initializing the menu bar', () => {
        let renderer = new MenuBar.Renderer();
        let bar = new MenuBar({ renderer });
        expect(bar).to.be.an.instanceof(MenuBar);
        bar.dispose();
      });

      it('should accept only isVisible option', () => {
        const bar = new MenuBar({
          overflowMenuOptions: { isVisible: false }
        });

        expect(bar).to.be.an.instanceOf(MenuBar);

        bar.dispose();
      });

      it('should add the `lm-MenuBar` class', () => {
        let bar = new MenuBar();
        expect(bar.hasClass('lm-MenuBar')).to.equal(true);
        bar.dispose();
      });
    });

    describe('#dispose()', () => {
      it('should dispose of the resources held by the menu bar', () => {
        let bar = new MenuBar();
        bar.addMenu(new Menu({ commands }));
        bar.dispose();
        expect(bar.isDisposed).to.equal(true);
        bar.dispose();
        expect(bar.isDisposed).to.equal(true);
      });
    });

    describe('#renderer', () => {
      it('should get the renderer for the menu bar', () => {
        let renderer = Object.create(MenuBar.defaultRenderer);
        let bar = new MenuBar({ renderer });
        expect(bar.renderer).to.equal(renderer);
        bar.dispose();
      });
    });

    describe('#childMenu', () => {
      it('should get the child menu of the menu bar', () => {
        let bar = new MenuBar();
        let menu = createMenu();
        bar.addMenu(menu);
        bar.activeIndex = 0;
        bar.openActiveMenu();
        expect(bar.childMenu).to.equal(menu);
        bar.dispose();
      });

      it('should be `null` if there is no open menu', () => {
        let bar = new MenuBar();
        let menu = new Menu({ commands });
        bar.addMenu(menu);
        bar.activeIndex = 0;
        expect(bar.childMenu).to.equal(null);
        bar.dispose();
      });
    });

    describe('#contentNode', () => {
      it('should get the menu content node', () => {
        let bar = new MenuBar();
        let content = bar.contentNode;
        expect(content.classList.contains('lm-MenuBar-content')).to.equal(true);
        bar.dispose();
      });
    });

    describe('#activeMenu', () => {
      it('should get the active menu of the menu bar', () => {
        let bar = new MenuBar();
        let menu = createMenu();
        bar.addMenu(menu);
        bar.activeIndex = 0;
        expect(bar.activeMenu).to.equal(menu);
        bar.dispose();
      });

      it('should be `null` if there is no active menu', () => {
        let bar = new MenuBar();
        let menu = new Menu({ commands });
        bar.addMenu(menu);
        expect(bar.activeMenu).to.equal(null);
        bar.dispose();
      });

      it('should set the currently active menu', () => {
        let bar = new MenuBar();
        let menu = createMenu();
        bar.addMenu(menu);
        bar.activeMenu = menu;
        expect(bar.activeMenu).to.equal(menu);
        bar.dispose();
      });

      it('should set to `null` if the menu is not in the menu bar', () => {
        let bar = new MenuBar();
        let menu = new Menu({ commands });
        bar.activeMenu = menu;
        expect(bar.activeMenu).to.equal(null);
        bar.dispose();
      });
    });

    describe('#activeIndex', () => {
      it('should get the index of the currently active menu', () => {
        let bar = new MenuBar();
        let menu = createMenu();
        bar.addMenu(menu);
        bar.activeMenu = menu;
        expect(bar.activeIndex).to.equal(0);
        bar.dispose();
      });

      it('should be `-1` if no menu is active', () => {
        let bar = new MenuBar();
        let menu = new Menu({ commands });
        bar.addMenu(menu);
        expect(bar.activeIndex).to.equal(-1);
        bar.dispose();
      });

      it('should set the index of the currently active menu', () => {
        let bar = new MenuBar();
        let menu = createMenu();
        bar.addMenu(menu);
        bar.activeIndex = 0;
        expect(bar.activeIndex).to.equal(0);
        bar.dispose();
      });

      it('should set to `-1` if the index is out of range', () => {
        let bar = new MenuBar();
        let menu = new Menu({ commands });
        bar.addMenu(menu);
        bar.activeIndex = -2;
        expect(bar.activeIndex).to.equal(-1);
        bar.activeIndex = 1;
        expect(bar.activeIndex).to.equal(-1);
        bar.dispose();
      });

      it('should add `lm-mod-active` to the active node', () => {
        let bar = createMenuBar();
        let node = bar.contentNode.firstChild as HTMLElement;
        expect(node.classList.contains('lm-mod-active')).to.equal(true);
        expect(bar.activeIndex).to.equal(0);
        bar.dispose();
      });

      it('should set to `-1` if menu at index is empty', () => {
        let bar = createMenuBar();
        let emptyMenu = new Menu({ commands });
        bar.insertMenu(1, emptyMenu);
        bar.activeIndex = 1;
        expect(bar.activeIndex).to.equal(-1);
        bar.dispose();
      });
    });

    describe('#menus', () => {
      it('should get a read-only array of the menus in the menu bar', () => {
        let bar = new MenuBar();
        let menu0 = new Menu({ commands });
        let menu1 = new Menu({ commands });
        bar.addMenu(menu0);
        bar.addMenu(menu1);
        let menus = bar.menus;
        expect(menus.length).to.equal(2);
        expect(menus[0]).to.equal(menu0);
        expect(menus[1]).to.equal(menu1);
        bar.dispose();
      });
    });

    describe('#openActiveMenu()', () => {
      it('should open the active menu and activate its first menu item', () => {
        let bar = new MenuBar();
        let menu = new Menu({ commands });
        let item = menu.addItem({ command: DEFAULT_CMD });
        menu.addItem(item);
        bar.addMenu(menu);
        bar.activeMenu = menu;
        bar.openActiveMenu();
        expect(menu.isAttached).to.equal(true);
        expect(menu.activeItem!.command).to.equal(item.command);
        bar.dispose();
      });

      it('should be a no-op if there is no active menu', () => {
        let bar = new MenuBar();
        let menu = new Menu({ commands });
        let item = menu.addItem({ command: DEFAULT_CMD });
        menu.addItem(item);
        bar.addMenu(menu);
        bar.openActiveMenu();
        expect(menu.isAttached).to.equal(false);
        bar.dispose();
      });

      it('should be a no-op if the active menu is empty', () => {
        let bar = new MenuBar();
        let menu = new Menu({ commands });
        bar.addMenu(menu);
        bar.activeMenu = menu;
        bar.openActiveMenu();
        expect(menu.isAttached).to.equal(false);
        bar.dispose();
      });
    });

    describe('#addMenu()', () => {
      it('should add a menu to the end of the menu bar', () => {
        let bar = new MenuBar();
        let menu = new Menu({ commands });
        let item = menu.addItem({ command: DEFAULT_CMD });
        menu.addItem(item);
        bar.addMenu(new Menu({ commands }));
        bar.addMenu(menu);
        expect(bar.menus.length).to.equal(2);
        expect(bar.menus[1]).to.equal(menu);
        bar.dispose();
      });

      it('should move an existing menu to the end', () => {
        let bar = new MenuBar();
        let menu = new Menu({ commands });
        let item = menu.addItem({ command: DEFAULT_CMD });
        menu.addItem(item);
        bar.addMenu(menu);
        bar.addMenu(new Menu({ commands }));
        bar.addMenu(menu);
        expect(bar.menus.length).to.equal(2);
        expect(bar.menus[1]).to.equal(menu);
        bar.dispose();
      });
    });

    describe('#insertMenu()', () => {
      it('should insert a menu into the menu bar at the specified index', () => {
        let bar = new MenuBar();
        let menu = new Menu({ commands });
        bar.addMenu(new Menu({ commands }));
        bar.insertMenu(0, menu);
        expect(bar.menus.length).to.equal(2);
        expect(bar.menus[0]).to.equal(menu);
        bar.dispose();
      });

      it('should clamp the index to the bounds of the menus', () => {
        let bar = new MenuBar();
        let menu = new Menu({ commands });
        bar.addMenu(new Menu({ commands }));
        bar.insertMenu(-1, menu);
        expect(bar.menus.length).to.equal(2);
        expect(bar.menus[0]).to.equal(menu);

        menu = new Menu({ commands });
        bar.insertMenu(10, menu);
        expect(bar.menus.length).to.equal(3);
        expect(bar.menus[2]).to.equal(menu);

        bar.dispose();
      });

      it('should move an existing menu', () => {
        let bar = new MenuBar();
        let menu = new Menu({ commands });
        bar.addMenu(new Menu({ commands }));
        bar.insertMenu(0, menu);
        bar.insertMenu(10, menu);
        expect(bar.menus.length).to.equal(2);
        expect(bar.menus[1]).to.equal(menu);
        bar.dispose();
      });

      it('should be a no-op if there is no effective move', () => {
        let bar = new MenuBar();
        let menu = new Menu({ commands });
        bar.addMenu(new Menu({ commands }));
        bar.insertMenu(0, menu);
        bar.insertMenu(0, menu);
        expect(bar.menus.length).to.equal(2);
        expect(bar.menus[0]).to.equal(menu);
        bar.dispose();
      });
    });

    describe('#removeMenu()', () => {
      it('should remove a menu from the menu bar by value', () => {
        let bar = new MenuBar();
        let menu = new Menu({ commands });
        bar.addMenu(new Menu({ commands }));
        bar.addMenu(menu);
        bar.removeMenu(menu);
        expect(bar.menus.length).to.equal(1);
        expect(bar.menus[0]).to.not.equal(menu);
        bar.dispose();
      });

      it('should return be a no-op if the menu is not in the menu bar', () => {
        let bar = new MenuBar();
        let menu = new Menu({ commands });
        bar.addMenu(new Menu({ commands }));
        bar.addMenu(menu);
        bar.removeMenu(menu);
        bar.removeMenu(menu);
        expect(bar.menus.length).to.equal(0);
        bar.dispose();
      });
    });

    describe('#removeMenuAt()', () => {
      it('should remove a menu from the menu bar by index', () => {
        let bar = new MenuBar();
        let menu = new Menu({ commands });
        bar.addMenu(new Menu({ commands }));
        bar.addMenu(menu);
        bar.removeMenuAt(1);
        expect(bar.menus.length).to.equal(1);
        expect(bar.menus[0]).to.not.equal(menu);
        bar.dispose();
      });

      it('should be a no-op if the index is out of range', () => {
        let bar = new MenuBar();
        let menu = new Menu({ commands });
        bar.addMenu(new Menu({ commands }));
        bar.addMenu(menu);
        bar.removeMenuAt(1);
        bar.removeMenuAt(1);
        expect(bar.menus.length).to.equal(1);
        bar.dispose();
      });
    });

    describe('#clearMenus()', () => {
      it('should remove all menus from the menu bar', () => {
        let bar = new MenuBar();
        bar.addMenu(new Menu({ commands }));
        bar.addMenu(new Menu({ commands }));
        bar.clearMenus();
        expect(bar.menus).to.eql([]);
        bar.dispose();
      });

      it('should be a no-op if there are no menus', () => {
        let bar = new MenuBar();
        bar.clearMenus();
        expect(bar.menus).to.eql([]);
        bar.dispose();
      });
    });

    describe('#handleEvent()', () => {
      let bar: MenuBar;

      beforeEach(() => {
        bar = createMenuBar();
      });

      afterEach(() => {
        bar.dispose();
      });

      context('keydown', () => {
        it('should bail on Tab', () => {
          let event = new KeyboardEvent('keydown', {
            cancelable: true,
            keyCode: 9
          });
          bar.node.dispatchEvent(event);
          expect(event.defaultPrevented).to.equal(false);
        });

        it('should open the active menu on Enter', () => {
          let menu = bar.activeMenu!;
          bar.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              bubbles,
              keyCode: 13
            })
          );
          expect(menu.isAttached).to.equal(true);
        });

        it('should open the active menu on Space', () => {
          let menu = bar.activeMenu!;
          bar.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              bubbles,
              keyCode: 32
            })
          );
          expect(menu.isAttached).to.equal(true);
        });

        it('should open the active menu on Up Arrow', () => {
          let menu = bar.activeMenu!;
          bar.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              bubbles,
              keyCode: 38
            })
          );
          expect(menu.isAttached).to.equal(true);
        });

        it('should open the active menu on Down Arrow', () => {
          let menu = bar.activeMenu!;
          bar.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              bubbles,
              keyCode: 40
            })
          );
          expect(menu.isAttached).to.equal(true);
        });

        it('should close the active menu on Escape', () => {
          let menu = bar.activeMenu!;
          bar.openActiveMenu();
          bar.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              bubbles,
              keyCode: 27
            })
          );
          expect(menu.isAttached).to.equal(false);
          expect(menu.activeIndex).to.equal(-1);
          expect(menu.node.contains(document.activeElement)).to.equal(false);
        });

        it('should activate the previous menu on Left Arrow', () => {
          bar.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              bubbles,
              keyCode: 37
            })
          );
          expect(bar.activeIndex!).to.equal(2);
          bar.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              bubbles,
              keyCode: 37
            })
          );
          expect(bar.activeIndex!).to.equal(1);
        });

        it('should skip past empty menu on Left Arrow', () => {
          let emptyMenu = new Menu({ commands });
          bar.insertMenu(0, emptyMenu);
          // Update DOM so we can focus the item node.
          MessageLoop.flush();
          // Call .focus() because keyboard shortcuts work from the item that
          // has focus which may not match `bar.activeIndex`. Focus the item
          // just to the right of the item that matches the empty menu.
          (bar.contentNode.children[1] as HTMLElement).focus();
          bar.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              bubbles,
              keyCode: 37
            })
          );
          expect(bar.activeIndex).to.equal(bar.menus.length - 1);
        });

        it('should activate the next menu on Right Arrow', () => {
          bar.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              bubbles,
              keyCode: 39
            })
          );
          expect(bar.activeIndex!).to.equal(1);
          bar.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              bubbles,
              keyCode: 39
            })
          );
          expect(bar.activeIndex!).to.equal(2);
          bar.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              bubbles,
              keyCode: 39
            })
          );
          expect(bar.activeIndex!).to.equal(0);
        });

        it('should skip past empty menu on Right Arrow', () => {
          let emptyMenu = new Menu({ commands });
          bar.addMenu(emptyMenu);
          // Update DOM so we can focus the item node.
          MessageLoop.flush();
          let emptyIndex = bar.menus.indexOf(emptyMenu);
          // Call .focus() because keyboard shortcuts work from the item that
          // has focus which may not match `bar.activeIndex`. Focus the item
          // just to the left of the item that matches the empty menu.
          (bar.contentNode.children[emptyIndex - 1] as HTMLElement).focus();
          bar.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              bubbles,
              keyCode: 39
            })
          );
          expect(bar.activeIndex).to.equal(0);
        });

        it('should open the menu matching a mnemonic', () => {
          bar.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              bubbles,
              keyCode: 97 // `1` key
            })
          );
          expect(bar.activeIndex!).to.equal(1);
          let menu = bar.activeMenu!;
          expect(menu.isAttached).to.equal(true);
        });

        it('should select the next menu matching by first letter', () => {
          bar.activeIndex = 1;
          bar.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              bubbles,
              keyCode: 77 // `M` key
            })
          );
          expect(bar.activeIndex!).to.equal(1);
          let menu = bar.activeMenu!;
          expect(menu.isAttached).to.equal(false);
        });

        it('should select the first menu matching the mnemonic', () => {
          let menu = new Menu({ commands });
          menu.title.label = 'Test1';
          menu.title.mnemonic = 4;
          bar.addMenu(menu);
          bar.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              bubbles,
              keyCode: 97 // `1` key
            })
          );
          expect(bar.activeIndex).to.equal(1);
          menu = bar.activeMenu!;
          expect(menu.isAttached).to.equal(false);
        });

        it('should select the only menu matching the first letter', () => {
          let menu = createMenu();
          menu.title.label = 'Test1';
          bar.addMenu(menu);
          bar.addMenu(new Menu({ commands }));
          bar.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              bubbles,
              keyCode: 84 // `T` key
            })
          );
          expect(bar.activeIndex).to.equal(3);
          expect(bar.activeMenu).to.equal(menu);
          expect(menu.isAttached).to.equal(false);
        });
      });

      context('mousedown', () => {
        it('should bail if the mouse press was not on the menu bar', () => {
          let event = new MouseEvent('mousedown', {
            bubbles,
            cancelable: true,
            clientX: -10
          });
          bar.node.dispatchEvent(event);
          expect(event.defaultPrevented).to.equal(false);
        });

        it('should close an open menu if the press was not on an item', () => {
          bar.openActiveMenu();
          let menu = bar.activeMenu!;
          bar.node.dispatchEvent(new MouseEvent('mousedown', { bubbles }));
          expect(bar.activeIndex).to.equal(-1);
          expect(menu.isAttached).to.equal(false);
        });

        it('should close an active menu', () => {
          bar.openActiveMenu();
          let menu = bar.activeMenu!;
          let firstItemNode = bar.node.getElementsByClassName(
            'lm-MenuBar-item'
          )[0] as HTMLElement;
          let rect = firstItemNode.getBoundingClientRect();
          let mouseEvent = new MouseEvent('mousedown', {
            bubbles,
            cancelable: true,
            clientX: rect.left + 1,
            clientY: rect.top + 1
          });
          expect(bar.activeIndex).to.equal(0);
          bar.node.dispatchEvent(mouseEvent);
          expect(bar.activeIndex).to.equal(0);
          expect(menu.isAttached).to.equal(false);
          // Ensure that mousedown default is not prevented, to allow browser
          // focus to go to an item that a user clicks in the menu bar.
          expect(mouseEvent.defaultPrevented).to.equal(false);
        });

        it('should open an active menu', () => {
          let menu = bar.activeMenu!;
          let node = bar.node.getElementsByClassName(
            'lm-MenuBar-item'
          )[0] as HTMLElement;
          let rect = node.getBoundingClientRect();
          let mouseEvent = new MouseEvent('mousedown', {
            bubbles,
            cancelable: true,
            clientX: rect.left + 1,
            clientY: rect.top + 1
          });
          bar.node.dispatchEvent(mouseEvent);
          expect(bar.activeIndex).to.equal(0);
          expect(menu.isAttached).to.equal(true);
          // When opening a menu, be sure to prevent default during the
          // mousedown so that the item being clicked in the menu bar does not
          // "steal" focus from the menu being opened.
          mouseEvent.preventDefault();
          expect(mouseEvent.defaultPrevented).to.equal(true);
        });

        it('should not close an active menu if not a left mouse press', () => {
          bar.openActiveMenu();
          let menu = bar.activeMenu!;
          let node = bar.node.getElementsByClassName(
            'lm-MenuBar-item'
          )[0] as HTMLElement;
          let rect = node.getBoundingClientRect();
          bar.node.dispatchEvent(
            new MouseEvent('mousedown', {
              bubbles,
              button: 1,
              clientX: rect.left + 1,
              clientY: rect.top + 1
            })
          );
          expect(bar.activeIndex).to.equal(0);
          expect(menu.isAttached).to.equal(true);
        });

        it('should not work on a menu bar item whose menu is empty', () => {
          let emptyMenu = new Menu({ commands });
          // Add title to empty menu, otherwise it will have zero width in the
          // menu bar, which makes it impossible to test with mousedown.
          emptyMenu.title.label = 'Empty Menu';
          bar.insertMenu(0, emptyMenu);
          let node = bar.node.getElementsByClassName(
            'lm-MenuBar-item'
          )[0] as HTMLElement;
          let rect = node.getBoundingClientRect();
          bar.node.dispatchEvent(
            new MouseEvent('mousedown', {
              bubbles,
              button: 0,
              clientX: rect.left + 1,
              clientY: rect.top + 1
            })
          );
          expect(bar.activeIndex).to.equal(-1);
          expect(emptyMenu.isAttached).to.equal(false);
        });
      });

      context('mousemove', () => {
        it('should open a new menu if a menu is already open', () => {
          bar.openActiveMenu();
          let menu = bar.activeMenu!;
          let node = bar.node.getElementsByClassName(
            'lm-MenuBar-item'
          )[1] as HTMLElement;
          let rect = node.getBoundingClientRect();
          bar.node.dispatchEvent(
            new MouseEvent('mousemove', {
              bubbles,
              clientX: rect.left + 1,
              clientY: rect.top + 1
            })
          );
          expect(bar.activeIndex).to.equal(1);
          expect(menu.isAttached).to.equal(false);
          expect(bar.activeMenu!.isAttached).to.equal(true);
        });

        it('should be a no-op if the active index will not change', () => {
          bar.openActiveMenu();
          let menu = bar.activeMenu!;
          let node = bar.node.getElementsByClassName(
            'lm-MenuBar-item'
          )[0] as HTMLElement;
          let rect = node.getBoundingClientRect();
          bar.node.dispatchEvent(
            new MouseEvent('mousemove', {
              bubbles,
              clientX: rect.left,
              clientY: rect.top + 1
            })
          );
          expect(bar.activeIndex).to.equal(0);
          expect(menu.isAttached).to.equal(true);
        });

        it('should be a no-op if the mouse is not over an item and there is a menu open', () => {
          bar.openActiveMenu();
          let menu = bar.activeMenu!;
          bar.node.dispatchEvent(new MouseEvent('mousemove', { bubbles }));
          expect(bar.activeIndex).to.equal(0);
          expect(menu.isAttached).to.equal(true);
        });
      });

      context('focusout', () => {
        it('should reset the active index if there is no open menu', () => {
          bar.node.dispatchEvent(new FocusEvent('focusout', { bubbles }));
          expect(bar.activeIndex).to.equal(-1);
        });

        it('should be a no-op if there is an open menu', () => {
          bar.openActiveMenu();
          let menu = bar.activeMenu!;
          bar.node.dispatchEvent(new FocusEvent('focusous', { bubbles }));
          expect(bar.activeIndex).to.equal(0);
          expect(menu.isAttached).to.equal(true);
        });
      });

      context('contextmenu', () => {
        it('should prevent default', () => {
          let event = new MouseEvent('contextmenu', { bubbles, cancelable });
          let cancelled = !bar.node.dispatchEvent(event);
          expect(cancelled).to.equal(true);
        });
      });

      context('focus', () => {
        it('should lose focus on tab key', () => {
          let bar = createUnfocusedMenuBar();
          bar.activate();
          MessageLoop.flush();
          expect(bar.contentNode.contains(document.activeElement)).to.equal(
            true
          );
          let event = new KeyboardEvent('keydown', { keyCode: 9, bubbles });
          bar.contentNode.dispatchEvent(event);
          expect(bar.activeIndex).to.equal(-1);
          bar.dispose();
        });

        it('should lose focus on shift-tab key', () => {
          let bar = createUnfocusedMenuBar();
          bar.activate();
          MessageLoop.flush();
          expect(bar.contentNode.contains(document.activeElement)).to.equal(
            true
          );
          let event = new KeyboardEvent('keydown', {
            keyCode: 9,
            shiftKey: true,
            bubbles
          });
          bar.contentNode.dispatchEvent(event);
          expect(bar.activeIndex).to.equal(-1);
          bar.dispose();
        });
      });
    });

    describe('#onBeforeAttach()', () => {
      it('should add event listeners', () => {
        let bar = new LogMenuBar();
        let node = bar.node;
        Widget.attach(bar, document.body);
        expect(bar.methods.indexOf('onBeforeAttach')).to.not.equal(-1);
        node.dispatchEvent(new KeyboardEvent('keydown', { bubbles }));
        expect(bar.events.indexOf('keydown')).to.not.equal(-1);
        node.dispatchEvent(new MouseEvent('mousedown', { bubbles }));
        expect(bar.events.indexOf('mousedown')).to.not.equal(-1);
        node.dispatchEvent(new MouseEvent('mousemove', { bubbles }));
        expect(bar.events.indexOf('mousemove')).to.not.equal(-1);
        node.dispatchEvent(new FocusEvent('focusout', { bubbles }));
        expect(bar.events.indexOf('focusout')).to.not.equal(-1);
        node.dispatchEvent(new MouseEvent('contextmenu', { bubbles }));
        expect(bar.events.indexOf('contextmenu')).to.not.equal(-1);
        bar.dispose();
      });
    });

    describe('#onAfterDetach()', () => {
      it('should remove event listeners', () => {
        let bar = new LogMenuBar();
        let node = bar.node;
        Widget.attach(bar, document.body);
        Widget.detach(bar);
        expect(bar.methods.indexOf('onBeforeAttach')).to.not.equal(-1);
        node.dispatchEvent(new KeyboardEvent('keydown', { bubbles }));
        expect(bar.events.indexOf('keydown')).to.equal(-1);
        node.dispatchEvent(new MouseEvent('mousedown', { bubbles }));
        expect(bar.events.indexOf('mousedown')).to.equal(-1);
        node.dispatchEvent(new MouseEvent('mousemove', { bubbles }));
        expect(bar.events.indexOf('mousemove')).to.equal(-1);
        node.dispatchEvent(new FocusEvent('focusout', { bubbles }));
        expect(bar.events.indexOf('focusout')).to.equal(-1);
        node.dispatchEvent(new MouseEvent('contextmenu', { bubbles }));
        expect(bar.events.indexOf('contextmenu')).to.equal(-1);
        bar.dispose();
      });
    });

    describe('#onActivateRequest()', () => {
      it('should be a no-op if not attached', () => {
        let bar = createMenuBar();
        Widget.detach(bar);
        MessageLoop.sendMessage(bar, Widget.Msg.ActivateRequest);
        expect(bar.contentNode.contains(document.activeElement)).to.equal(
          false
        );
        bar.dispose();
      });

      it('should focus the node if attached', () => {
        let bar = createUnfocusedMenuBar();
        MessageLoop.sendMessage(bar, Widget.Msg.ActivateRequest);
        expect(
          bar.contentNode.contains(document.activeElement) &&
            bar.contentNode !== document.activeElement
        ).to.equal(true);
        bar.dispose();
      });
    });

    describe('#onUpdateRequest()', () => {
      it('should be called when the title of a menu changes', () => {
        let bar = new LogMenuBar();
        let menu = new Menu({ commands });
        bar.addMenu(menu);
        bar.activeIndex = 0;
        expect(bar.methods).to.not.include('onUpdateRequest');
        menu.title.label = 'foo';
        MessageLoop.flush();
        expect(bar.methods).to.include('onUpdateRequest');
        bar.dispose();
      });

      it('should render the content', () => {
        let bar = new LogMenuBar();
        let menu = new Menu({ commands });
        bar.addMenu(menu);
        expect(bar.contentNode.children.length).to.equal(0);
        MessageLoop.sendMessage(bar, Widget.Msg.UpdateRequest);
        let child = bar.contentNode.firstChild as HTMLElement;
        expect(child.className).to.contain('lm-MenuBar-item');
        bar.dispose();
      });

      it('should render the overflow menu', () => {
        let bar = createMenuBar();
        expect(bar.overflowIndex).to.equal(-1);
        expect(bar.overflowMenu).to.equal(null);
        bar.node.style.maxWidth = '70px';
        MessageLoop.sendMessage(bar, Widget.Msg.UpdateRequest);
        MessageLoop.flush();
        expect(bar.overflowMenu).to.not.equal(null);
        expect(bar.overflowIndex).to.not.equal(-1);
        bar.dispose();
      });

      it('should hide the overflow menu', () => {
        let bar = createMenuBar();
        expect(bar.overflowIndex).to.equal(-1);
        expect(bar.overflowMenu).to.equal(null);
        bar.node.style.maxWidth = '70px';
        MessageLoop.sendMessage(bar, Widget.Msg.UpdateRequest);
        bar.node.style.maxWidth = '400px';
        MessageLoop.sendMessage(bar, Widget.Msg.UpdateRequest);
        MessageLoop.flush();
        expect(bar.overflowMenu).to.equal(null);
        expect(bar.overflowIndex).to.equal(-1);
        bar.dispose();
      });

      it('should not use the overflow menu', () => {
        let bar = createMenuBar({
          overflowMenuOptions: { isVisible: false }
        });
        expect(bar.overflowIndex).to.equal(-1);
        expect(bar.overflowMenu).to.equal(null);
        bar.node.style.maxWidth = '70px';
        MessageLoop.sendMessage(bar, Widget.Msg.UpdateRequest);
        MessageLoop.flush();
        expect(bar.overflowIndex).to.equal(-1);
        expect(bar.overflowMenu).to.equal(null);
        bar.dispose();
      });
    });

    context('`menuRequested` signal', () => {
      it('should activate the next menu', () => {
        let bar = createMenuBar();
        bar.openActiveMenu();
        (bar.activeMenu!.menuRequested as any).emit('next');
        expect(bar.activeIndex).to.equal(1);
        bar.dispose();
      });

      it('should activate the previous menu', () => {
        let bar = createMenuBar();
        bar.openActiveMenu();
        (bar.activeMenu!.menuRequested as any).emit('previous');
        expect(bar.activeIndex).to.equal(2);
        bar.dispose();
      });

      it('should be a no-op if the sender is not the open menu', () => {
        let bar = createMenuBar();
        (bar.activeMenu!.menuRequested as any).emit('next');
        expect(bar.activeIndex).to.equal(0);
        bar.dispose();
      });
    });

    describe('.Renderer', () => {
      const renderer = new MenuBar.Renderer();
      let data: MenuBar.IRenderData;

      before(() => {
        let widget = new Widget();
        widget.title.label = 'foo';
        widget.title.iconClass = 'bar';
        widget.title.className = 'baz';
        widget.title.closable = true;
        data = {
          title: widget.title,
          active: true,
          tabbable: true,
          disabled: false
        };
      });

      describe('#renderItem()', () => {
        it('should render the virtual element for a menu bar item', () => {
          let node = VirtualDOM.realize(renderer.renderItem(data));
          expect(node.classList.contains('lm-MenuBar-item')).to.equal(true);
          expect(
            node.getElementsByClassName('lm-MenuBar-itemIcon').length
          ).to.equal(1);
          expect(
            node.getElementsByClassName('lm-MenuBar-itemLabel').length
          ).to.equal(1);
        });
      });

      describe('#renderIcon()', () => {
        it('should render the icon element for a menu bar item', () => {
          let node = VirtualDOM.realize(renderer.renderIcon(data));
          expect(node.className).to.contain('lm-MenuBar-itemIcon');
          expect(node.className).to.contain('bar');
        });
      });

      describe('#renderLabel()', () => {
        it('should render the label element for a menu item', () => {
          let node = VirtualDOM.realize(renderer.renderLabel(data));
          expect(node.className).to.contain('lm-MenuBar-itemLabel');
          expect(node.textContent).to.equal('foo');
        });
      });

      describe('#createItemClass()', () => {
        it('should create the class name for the menu bar item', () => {
          let itemClass = renderer.createItemClass(data);
          expect(itemClass).to.contain('baz');
          expect(itemClass).to.contain('lm-mod-active');
        });
      });

      describe('#createIconClass()', () => {
        it('should create the class name for the menu bar item icon', () => {
          let iconClass = renderer.createIconClass(data);
          expect(iconClass).to.contain('lm-MenuBar-itemIcon');
          expect(iconClass).to.contain('bar');
        });
      });

      describe('#formatLabel()', () => {
        it('should format a label into HTML for display', () => {
          data.title.mnemonic = 1;
          let label = renderer.formatLabel(data);
          expect((label as any)[0]).to.equal('f');
          let node = VirtualDOM.realize((label as any)[1] as VirtualElement);
          expect(node.className).to.contain('lm-MenuBar-itemMnemonic');
          expect(node.textContent).to.equal('o');
          expect((label as any)[2]).to.equal('o');
        });

        it('should not add a mnemonic if the index is out of range', () => {
          data.title.mnemonic = -1;
          let label = renderer.formatLabel(data);
          expect(label).to.equal('foo');
        });
      });
    });

    describe('.defaultRenderer', () => {
      it('should be an instance of `Renderer`', () => {
        expect(MenuBar.defaultRenderer).to.be.an.instanceof(MenuBar.Renderer);
      });
    });
  });
});
