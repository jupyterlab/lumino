/* eslint-disable @typescript-eslint/no-empty-function */
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

// import { simulate } from 'simulate-event';

import { CommandRegistry } from '@lumino/commands';

import { JSONObject } from '@lumino/coreutils';

import { ContextMenu } from '@lumino/widgets';

describe('@lumino/widgets', () => {
  let commands = new CommandRegistry();

  before(() => {
    commands.addCommand('test-1', {
      execute: (args: JSONObject) => {},
      label: 'Test 1 Label'
    });
    commands.addCommand('test-2', {
      execute: (args: JSONObject) => {},
      label: 'Test 2 Label'
    });
    commands.addCommand('test-3', {
      execute: (args: JSONObject) => {},
      label: 'Test 3 Label'
    });
    commands.addCommand('test-4', {
      execute: (args: JSONObject) => {},
      label: 'Test 4 Label'
    });
  });

  describe('ContextMenu', () => {
    describe('#open', () => {
      let menu: ContextMenu;
      const CLASSNAME = 'menu-1';

      function addItems(menu: ContextMenu) {
        menu.addItem({
          command: 'test-1',
          selector: `.${CLASSNAME}`,
          rank: 20
        });
        menu.addItem({
          command: 'test-2',
          selector: `.${CLASSNAME}`,
          rank: 10
        });
        menu.addItem({
          command: 'test-3',
          selector: `div.${CLASSNAME}`,
          rank: 30
        });
        menu.addItem({
          command: 'test-4',
          selector: '.menu-2',
          rank: 1
        });
        menu.addItem({
          command: 'test-5',
          selector: 'body',
          rank: 15
        });
      }

      afterEach(() => {
        menu && menu.menu.dispose();
      });

      it('should show items matching selector, grouped and ordered by selector and rank', () => {
        const target = document.createElement('div');
        target.className = CLASSNAME;
        document.body.appendChild(target);

        menu = new ContextMenu({ commands });
        addItems(menu);

        const bb = target.getBoundingClientRect() as DOMRect;

        menu.open({
          target,
          currentTarget: document.body,
          clientX: bb.x,
          clientY: bb.y
        } as any);

        expect(menu.menu.items).to.have.length(4);
        expect(menu.menu.items[0].command).to.equal('test-3');
        expect(menu.menu.items[1].command).to.equal('test-2');
        expect(menu.menu.items[2].command).to.equal('test-1');
        expect(menu.menu.items[3].command).to.equal('test-5');
      });

      it('should show items matching selector, grouped and ordered only by rank', () => {
        const target = document.createElement('div');
        target.className = CLASSNAME;
        document.body.appendChild(target);

        menu = new ContextMenu({ commands, sortBySelector: false });
        addItems(menu);

        const bb = target.getBoundingClientRect() as DOMRect;

        menu.open({
          target,
          currentTarget: document.body,
          clientX: bb.x,
          clientY: bb.y
        } as any);

        expect(menu.menu.items).to.have.length(4);
        expect(menu.menu.items[0].command).to.equal('test-2');
        expect(menu.menu.items[1].command).to.equal('test-1');
        expect(menu.menu.items[2].command).to.equal('test-3');
        expect(menu.menu.items[3].command).to.equal('test-5');
      });

      it('should show items matching selector, ungrouped and ordered by selector and rank', () => {
        const target = document.createElement('div');
        target.className = CLASSNAME;
        document.body.appendChild(target);

        menu = new ContextMenu({
          commands,
          groupByTarget: false,
          sortBySelector: false
        });
        addItems(menu);

        const bb = target.getBoundingClientRect() as DOMRect;

        menu.open({
          target,
          currentTarget: document.body,
          clientX: bb.x,
          clientY: bb.y
        } as any);

        expect(menu.menu.items).to.have.length(4);
        expect(menu.menu.items[1].command).to.equal('test-5');
        expect(menu.menu.items[0].command).to.equal('test-2');
        expect(menu.menu.items[2].command).to.equal('test-1');
        expect(menu.menu.items[3].command).to.equal('test-3');
      });

      it('should show items matching selector, ungrouped and ordered only by rank', () => {
        const target = document.createElement('div');
        target.className = CLASSNAME;
        document.body.appendChild(target);

        menu = new ContextMenu({
          commands,
          groupByTarget: false,
          sortBySelector: false
        });
        addItems(menu);

        const bb = target.getBoundingClientRect() as DOMRect;

        menu.open({
          target,
          currentTarget: document.body,
          clientX: bb.x,
          clientY: bb.y
        } as any);

        expect(menu.menu.items).to.have.length(4);
        expect(menu.menu.items[0].command).to.equal('test-2');
        expect(menu.menu.items[1].command).to.equal('test-5');
        expect(menu.menu.items[2].command).to.equal('test-1');
        expect(menu.menu.items[3].command).to.equal('test-3');
      });
    });
  });
});
