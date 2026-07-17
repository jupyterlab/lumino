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

import { CommandRegistry } from '@lumino/commands';

import { Platform } from '@lumino/domutils';

import { MessageLoop } from '@lumino/messaging';

import { h, VirtualDOM } from '@lumino/virtualdom';

import { CommandPalette, Widget } from '@lumino/widgets';

class LogPalette extends CommandPalette {
  events: string[] = [];

  handleEvent(event: Event): void {
    super.handleEvent(event);
    this.events.push(event.type);
  }
}

const bubbles = true;
const defaultOptions: CommandPalette.IItemOptions = {
  command: 'test',
  category: 'Test Category',
  args: { foo: 'bar' },
  rank: 42
};

describe('@lumino/widgets', () => {
  let commands: CommandRegistry;
  let palette: CommandPalette;

  beforeEach(() => {
    commands = new CommandRegistry();
    palette = new CommandPalette({ commands });
    Widget.attach(palette, document.body);
  });

  afterEach(() => {
    palette.dispose();
  });

  describe('CommandPalette', () => {
    describe('#constructor()', () => {
      it('should accept command palette instantiation options', () => {
        expect(palette).to.be.an.instanceof(CommandPalette);
        expect(palette.node.classList.contains('lm-CommandPalette')).to.equal(
          true
        );
      });
    });

    describe('#dispose()', () => {
      it('should dispose of the resources held by the command palette', () => {
        palette.addItem(defaultOptions);
        palette.dispose();
        expect(palette.items.length).to.equal(0);
        expect(palette.isDisposed).to.equal(true);
      });
    });

    describe('#commands', () => {
      it('should get the command registry for the command palette', () => {
        expect(palette.commands).to.equal(commands);
      });
    });

    describe('#renderer', () => {
      it('should default to the default renderer', () => {
        expect(palette.renderer).to.equal(CommandPalette.defaultRenderer);
      });
    });

    describe('#searchNode', () => {
      it('should return the search node of a command palette', () => {
        expect(
          palette.searchNode.classList.contains('lm-CommandPalette-search')
        ).to.equal(true);
      });
    });

    describe('#inputNode', () => {
      it('should return the input node of a command palette', () => {
        expect(
          palette.inputNode.classList.contains('lm-CommandPalette-input')
        ).to.equal(true);
      });
    });

    describe('#contentNode', () => {
      it('should return the content node of a command palette', () => {
        expect(
          palette.contentNode.classList.contains('lm-CommandPalette-content')
        ).to.equal(true);
      });
    });

    describe('#items', () => {
      it('should be a read-only array of the palette items', () => {
        expect(palette.items.length).to.equal(0);
        palette.addItem(defaultOptions);
        expect(palette.items.length).to.equal(1);
        expect(palette.items[0].command).to.equal('test');
      });
    });

    describe('#maxRecentCommands', () => {
      it('should default to `0`', () => {
        expect(palette.maxRecentCommands).to.equal(0);
      });

      it('should be initialized from the palette options', () => {
        let palette = new CommandPalette({ commands, maxRecentCommands: 5 });
        expect(palette.maxRecentCommands).to.equal(5);
        palette.dispose();
      });

      it('should normalize invalid values', () => {
        palette.maxRecentCommands = 2.7;
        expect(palette.maxRecentCommands).to.equal(2);
        palette.maxRecentCommands = -1;
        expect(palette.maxRecentCommands).to.equal(0);
        palette.maxRecentCommands = NaN;
        expect(palette.maxRecentCommands).to.equal(0);
      });

      context('recent commands', () => {
        let visibleFlag = true;

        const executeItem = (label: string): void => {
          MessageLoop.flush();
          let labels = Array.from(
            palette.contentNode.querySelectorAll('.lm-CommandPalette-itemLabel')
          );
          let labelNode = labels.find(node => node.textContent === label)!;
          let itemNode = labelNode.closest('.lm-CommandPalette-item')!;
          itemNode.dispatchEvent(new MouseEvent('click', { bubbles }));
          MessageLoop.flush();
        };

        const headerLabels = (): (string | null)[] => {
          MessageLoop.flush();
          return Array.from(
            palette.contentNode.querySelectorAll('.lm-CommandPalette-header')
          ).map(node => node.textContent);
        };

        const itemLabels = (): (string | null)[] => {
          MessageLoop.flush();
          return Array.from(
            palette.contentNode.querySelectorAll('.lm-CommandPalette-itemLabel')
          ).map(node => node.textContent);
        };

        const recentLabels = (): (string | null)[] => {
          MessageLoop.flush();
          return Array.from(
            palette.contentNode.querySelectorAll(
              '.lm-CommandPalette-item.lm-mod-recent .lm-CommandPalette-itemLabel'
            )
          ).map(node => node.textContent);
        };

        beforeEach(() => {
          visibleFlag = true;
          palette.maxRecentCommands = 3;
          ['One', 'Two', 'Three', 'Four'].forEach(label => {
            let command = `test:${label.toLowerCase()}`;
            commands.addCommand(command, { execute: () => {}, label });
            palette.addItem({ command, category: 'Numbers' });
          });
          commands.addCommand('test:hidden', {
            execute: () => {},
            isVisible: () => visibleFlag,
            label: 'Hidden'
          });
          palette.addItem({ command: 'test:hidden', category: 'Numbers' });
        });

        it('should display the recently executed commands at the top', () => {
          expect(recentLabels()).to.deep.equal([]);
          executeItem('Two');
          expect(recentLabels()).to.deep.equal(['Two']);
          expect(itemLabels()).to.deep.equal([
            'Two',
            'Four',
            'Hidden',
            'One',
            'Three'
          ]);
          // The recent items are displayed before the category headers.
          expect(headerLabels()).to.deep.equal(['Numbers']);
          let first = palette.contentNode.firstElementChild!;
          expect(first.classList.contains('lm-CommandPalette-item')).to.equal(
            true
          );
          expect(first.classList.contains('lm-mod-recent')).to.equal(true);
        });

        it('should navigate and execute the recent commands with the keyboard', () => {
          executeItem('Three');
          executeItem('One');
          palette.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              bubbles,
              keyCode: 40 // Down Arrow
            })
          );
          palette.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              bubbles,
              keyCode: 40 // Down Arrow
            })
          );
          MessageLoop.flush();
          let active = palette.contentNode.querySelector(
            '.lm-CommandPalette-item.lm-mod-active'
          )!;
          expect(
            active.querySelector('.lm-CommandPalette-itemLabel')!.textContent
          ).to.equal('Three');
          palette.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              bubbles,
              keyCode: 13 // Enter
            })
          );
          expect(recentLabels()).to.deep.equal(['Three', 'One']);
        });

        it('should order the recently executed commands by recency', () => {
          executeItem('Three');
          executeItem('One');
          expect(recentLabels()).to.deep.equal(['One', 'Three']);
          expect(itemLabels()).to.deep.equal([
            'One',
            'Three',
            'Four',
            'Hidden',
            'Two'
          ]);
          executeItem('Three');
          expect(recentLabels()).to.deep.equal(['Three', 'One']);
          expect(itemLabels()).to.deep.equal([
            'Three',
            'One',
            'Four',
            'Hidden',
            'Two'
          ]);
        });

        it('should drop the oldest command when the history is full', () => {
          executeItem('One');
          executeItem('Two');
          executeItem('Three');
          executeItem('Four');
          expect(recentLabels()).to.deep.equal(['Four', 'Three', 'Two']);
          expect(itemLabels()).to.deep.equal([
            'Four',
            'Three',
            'Two',
            'Hidden',
            'One'
          ]);
        });

        it('should track items with distinct arguments separately', () => {
          commands.addCommand('test:args', {
            execute: () => {},
            label: args => `Arg ${args.n}`
          });
          palette.addItem({
            command: 'test:args',
            args: { n: 1 },
            category: 'Numbers'
          });
          palette.addItem({
            command: 'test:args',
            args: { n: 2 },
            category: 'Numbers'
          });
          executeItem('Arg 1');
          executeItem('Arg 2');
          expect(recentLabels()).to.deep.equal(['Arg 2', 'Arg 1']);
        });

        it('should mark the recently executed commands when searching', () => {
          executeItem('Four');
          expect(recentLabels()).to.deep.equal(['Four']);
          palette.inputNode.value = 'four';
          palette.refresh();
          expect(headerLabels()).to.deep.equal(['Numbers']);
          expect(itemLabels()).to.deep.equal(['Four']);
          expect(recentLabels()).to.deep.equal(['Four']);
          palette.inputNode.value = 'three';
          palette.refresh();
          expect(itemLabels()).to.deep.equal(['Three']);
          expect(recentLabels()).to.deep.equal([]);
        });

        it('should not change the order of the search results', () => {
          executeItem('Two');
          palette.inputNode.value = 't';
          palette.refresh();
          expect(itemLabels()).to.deep.equal(['Three', 'Two']);
          expect(recentLabels()).to.deep.equal(['Two']);
        });

        it('should drop the oldest commands when the limit is lowered', () => {
          executeItem('One');
          executeItem('Two');
          palette.maxRecentCommands = 1;
          expect(recentLabels()).to.deep.equal(['Two']);
          expect(itemLabels()).to.deep.equal([
            'Two',
            'Four',
            'Hidden',
            'One',
            'Three'
          ]);
        });

        it('should clear and disable the history when set to `0`', () => {
          executeItem('One');
          expect(recentLabels()).to.deep.equal(['One']);
          palette.maxRecentCommands = 0;
          expect(recentLabels()).to.deep.equal([]);
          palette.maxRecentCommands = 3;
          expect(recentLabels()).to.deep.equal([]);
        });

        it('should not display commands which were removed', () => {
          executeItem('One');
          palette.removeItemAt(0);
          expect(recentLabels()).to.deep.equal([]);
          expect(itemLabels()).to.deep.equal([
            'Four',
            'Hidden',
            'Three',
            'Two'
          ]);
        });

        it('should not display commands which are not visible', () => {
          executeItem('Hidden');
          expect(recentLabels()).to.deep.equal(['Hidden']);
          visibleFlag = false;
          palette.refresh();
          expect(recentLabels()).to.deep.equal([]);
          expect(itemLabels()).to.deep.equal(['Four', 'One', 'Three', 'Two']);
        });

        it('should not display commands which are disabled', () => {
          let enabled = true;
          commands.addCommand('test:enabled', {
            execute: () => {},
            isEnabled: () => enabled,
            label: 'Enabled'
          });
          palette.addItem({ command: 'test:enabled', category: 'Numbers' });
          executeItem('Enabled');
          expect(recentLabels()).to.deep.equal(['Enabled']);
          enabled = false;
          palette.refresh();
          expect(recentLabels()).to.deep.equal([]);
          expect(itemLabels()).to.deep.equal([
            'Enabled',
            'Four',
            'Hidden',
            'One',
            'Three',
            'Two'
          ]);
        });
      });
    });

    describe('#addItems()', () => {
      it('should add items to a command palette using options', () => {
        const item = {
          command: 'test2',
          category: 'Test Category',
          args: { foo: 'bar' },
          rank: 100
        };

        expect(palette.items.length).to.equal(0);
        palette.addItems([defaultOptions, item]);
        expect(palette.items.length).to.equal(2);
        expect(palette.items[0].command).to.equal('test');
        expect(palette.items[1].command).to.equal('test2');
      });
    });

    describe('#addItem()', () => {
      it('should add an item to a command palette using options', () => {
        expect(palette.items.length).to.equal(0);
        palette.addItem(defaultOptions);
        expect(palette.items.length).to.equal(1);
        expect(palette.items[0].command).to.equal('test');
      });

      context('CommandPalette.IItem', () => {
        describe('#command', () => {
          it('should return the command name of a command item', () => {
            let item = palette.addItem(defaultOptions);
            expect(item.command).to.equal('test');
          });
        });

        describe('#args', () => {
          it('should return the args of a command item', () => {
            let item = palette.addItem(defaultOptions);
            expect(item.args).to.deep.equal(defaultOptions.args);
          });

          it('should default to an empty object', () => {
            let item = palette.addItem({ command: 'test', category: 'test' });
            expect(item.args).to.deep.equal({});
          });
        });

        describe('#category', () => {
          it('should return the category of a command item', () => {
            let item = palette.addItem(defaultOptions);
            expect(item.category).to.equal(defaultOptions.category);
          });
        });

        describe('#rank', () => {
          it('should return the rank of a command item', () => {
            let item = palette.addItem(defaultOptions);
            expect(item.rank).to.deep.equal(defaultOptions.rank);
          });

          it('should default to `Infinity`', () => {
            let item = palette.addItem({ command: 'test', category: 'test' });
            expect(item.rank).to.equal(Infinity);
          });
        });

        describe('#label', () => {
          it('should return the label of a command item', () => {
            let label = 'test label';
            commands.addCommand('test', { execute: () => {}, label });
            let item = palette.addItem(defaultOptions);
            expect(item.label).to.equal(label);
          });
        });

        describe('#caption', () => {
          it('should return the caption of a command item', () => {
            let caption = 'test caption';
            commands.addCommand('test', { execute: () => {}, caption });
            let item = palette.addItem(defaultOptions);
            expect(item.caption).to.equal(caption);
          });
        });

        describe('#className', () => {
          it('should return the class name of a command item', () => {
            let className = 'testClass';
            commands.addCommand('test', { execute: () => {}, className });
            let item = palette.addItem(defaultOptions);
            expect(item.className).to.equal(className);
          });
        });

        describe('#isEnabled', () => {
          it('should return whether a command item is enabled', () => {
            let called = false;
            commands.addCommand('test', {
              execute: () => {},
              isEnabled: () => {
                called = true;
                return false;
              }
            });
            let item = palette.addItem(defaultOptions);
            expect(called).to.equal(false);
            expect(item.isEnabled).to.equal(false);
            expect(called).to.equal(true);
          });
        });

        describe('#isToggled', () => {
          it('should return whether a command item is toggled', () => {
            let called = false;
            commands.addCommand('test', {
              execute: () => {},
              isToggled: () => {
                called = true;
                return true;
              }
            });
            let item = palette.addItem(defaultOptions);
            expect(called).to.equal(false);
            expect(item.isToggled).to.equal(true);
            expect(called).to.equal(true);
          });
        });

        describe('#isVisible', () => {
          it('should return whether a command item is visible', () => {
            let called = false;
            commands.addCommand('test', {
              execute: () => {},
              isVisible: () => {
                called = true;
                return false;
              }
            });
            let item = palette.addItem(defaultOptions);
            expect(called).to.equal(false);
            expect(item.isVisible).to.equal(false);
            expect(called).to.equal(true);
          });
        });

        describe('#keyBinding', () => {
          it('should return the key binding of a command item', () => {
            commands.addKeyBinding({
              keys: ['Ctrl A'],
              selector: 'body',
              command: 'test',
              args: defaultOptions.args
            });
            let item = palette.addItem(defaultOptions);
            expect(item.keyBinding!.keys).to.deep.equal(['Ctrl A']);
          });
        });
      });
    });

    describe('#removeItem()', () => {
      it('should remove an item from a command palette by item', () => {
        expect(palette.items.length).to.equal(0);
        let item = palette.addItem(defaultOptions);
        expect(palette.items.length).to.equal(1);
        palette.removeItem(item);
        expect(palette.items.length).to.equal(0);
      });
    });

    describe('#removeItemAt()', () => {
      it('should remove an item from a command palette by index', () => {
        expect(palette.items.length).to.equal(0);
        palette.addItem(defaultOptions);
        expect(palette.items.length).to.equal(1);
        palette.removeItemAt(0);
        expect(palette.items.length).to.equal(0);
      });
    });

    describe('#clearItems()', () => {
      it('should remove all items from a command palette', () => {
        expect(palette.items.length).to.equal(0);
        palette.addItem({ command: 'test', category: 'one' });
        palette.addItem({ command: 'test', category: 'two' });
        expect(palette.items.length).to.equal(2);
        palette.clearItems();
        expect(palette.items.length).to.equal(0);
      });
    });

    describe('#clearRecentCommands()', () => {
      it('should clear the recently executed commands', () => {
        palette.maxRecentCommands = 3;
        commands.addCommand('test', { execute: () => {}, label: 'test' });
        palette.addItem(defaultOptions);
        MessageLoop.flush();

        let recents = () =>
          palette.contentNode.querySelectorAll(
            '.lm-CommandPalette-item.lm-mod-recent'
          );
        let item = palette.contentNode.querySelector(
          '.lm-CommandPalette-item'
        )!;

        item.dispatchEvent(new MouseEvent('click', { bubbles }));
        MessageLoop.flush();
        expect(recents()).to.have.length(1);

        palette.clearRecentCommands();
        MessageLoop.flush();
        expect(recents()).to.have.length(0);
      });
    });

    describe('#refresh()', () => {
      it('should schedule a refresh of the search items', () => {
        commands.addCommand('test', { execute: () => {}, label: 'test' });
        palette.addItem(defaultOptions);

        MessageLoop.flush();

        let content = palette.contentNode;
        let itemClass = '.lm-CommandPalette-item';
        let items = () => content.querySelectorAll(itemClass);

        expect(items()).to.have.length(1);
        palette.inputNode.value = 'x';
        palette.refresh();
        MessageLoop.flush();
        expect(items()).to.have.length(0);
      });

      it('should search a list of commands', () => {
        // Add several commands to the command registry and the palette
        commands.addCommand('example:cut', {
          label: 'Cut',
          mnemonic: 1,
          iconClass: 'fa fa-cut',
          execute: () => {
            console.log('Cut');
          }
        });

        commands.addCommand('example:copy', {
          label: 'Copy File',
          mnemonic: 0,
          iconClass: 'fa fa-copy',
          execute: () => {
            console.log('Copy');
          }
        });

        commands.addCommand('example:paste', {
          label: 'Paste',
          mnemonic: 0,
          iconClass: 'fa fa-paste',
          execute: () => {
            console.log('Paste');
          }
        });

        commands.addCommand('example:new-tab', {
          label: 'New Tab',
          mnemonic: 0,
          caption: 'Open a new tab',
          execute: () => {
            console.log('New Tab');
          }
        });

        commands.addCommand('example:close-tab', {
          label: 'Close Tab',
          mnemonic: 2,
          caption: 'Close the current tab',
          execute: () => {
            console.log('Close Tab');
          }
        });

        commands.addCommand('example:save-on-exit', {
          label: 'Save on Exit',
          mnemonic: 0,
          caption: 'Toggle the save on exit flag',
          execute: () => {
            console.log('Save on Exit');
          }
        });

        commands.addCommand('example:open-task-manager', {
          label: 'Task Manager',
          mnemonic: 5,
          isEnabled: () => false,
          execute: () => {}
        });

        commands.addCommand('example:close', {
          label: 'Close',
          mnemonic: 0,
          iconClass: 'fa fa-close',
          execute: () => {
            console.log('Close');
          }
        });

        commands.addCommand('example:one', {
          label: 'One',
          execute: () => {
            console.log('One');
          }
        });

        commands.addCommand('example:two', {
          label: 'Two',
          execute: () => {
            console.log('Two');
          }
        });

        commands.addCommand('example:three', {
          label: 'Three',
          execute: () => {
            console.log('Three');
          }
        });

        commands.addCommand('example:four', {
          label: 'Four',
          execute: () => {
            console.log('Four');
          }
        });

        commands.addCommand('example:black', {
          label: 'Black',
          execute: () => {
            console.log('Black');
          }
        });

        commands.addCommand('example:clear-cell', {
          label: 'Clear Cell',
          execute: () => {
            console.log('Clear Cell');
          }
        });

        commands.addCommand('example:cut-cells', {
          label: 'Cut Cell(s)',
          execute: () => {
            console.log('Cut Cell(s)');
          }
        });

        commands.addCommand('example:run-cell', {
          label: 'Run Cell',
          execute: () => {
            console.log('Run Cell');
          }
        });

        commands.addCommand('example:cell-test', {
          label: 'Cell Test',
          execute: () => {
            console.log('Cell Test');
          }
        });

        commands.addCommand('notebook:new', {
          label: 'New Notebook',
          execute: () => {
            console.log('New Notebook');
          }
        });

        commands.addKeyBinding({
          keys: ['Accel X'],
          selector: 'body',
          command: 'example:cut'
        });

        commands.addKeyBinding({
          keys: ['Accel C'],
          selector: 'body',
          command: 'example:copy'
        });

        commands.addKeyBinding({
          keys: ['Accel V'],
          selector: 'body',
          command: 'example:paste'
        });

        commands.addKeyBinding({
          keys: ['Accel J', 'Accel J'],
          selector: 'body',
          command: 'example:new-tab'
        });

        commands.addKeyBinding({
          keys: ['Accel M'],
          selector: 'body',
          command: 'example:open-task-manager'
        });

        let palette = new CommandPalette({ commands });
        Widget.attach(palette, document.body);
        try {
          palette.addItem({ command: 'example:cut', category: 'Edit' });
          palette.addItem({ command: 'example:copy', category: 'Edit' });
          palette.addItem({ command: 'example:paste', category: 'Edit' });
          palette.addItem({ command: 'example:one', category: 'Number' });
          palette.addItem({ command: 'example:two', category: 'Number' });
          palette.addItem({ command: 'example:three', category: 'Number' });
          palette.addItem({ command: 'example:four', category: 'Number' });
          palette.addItem({ command: 'example:black', category: 'Number' });
          palette.addItem({ command: 'example:new-tab', category: 'File' });
          palette.addItem({ command: 'example:close-tab', category: 'File' });
          palette.addItem({
            command: 'example:save-on-exit',
            category: 'File'
          });
          palette.addItem({
            command: 'example:open-task-manager',
            category: 'File'
          });
          palette.addItem({ command: 'example:close', category: 'File' });
          palette.addItem({
            command: 'example:clear-cell',
            category: 'Notebook Cell Operations'
          });
          palette.addItem({
            command: 'example:cut-cells',
            category: 'Notebook Cell Operations'
          });
          palette.addItem({
            command: 'example:run-cell',
            category: 'Notebook Cell Operations'
          });
          palette.addItem({
            command: 'example:cell-test',
            category: 'Console'
          });
          palette.addItem({ command: 'notebook:new', category: 'Notebook' });
          palette.id = 'palette';

          // Search the command palette: update the inputNode, then force a refresh
          palette.inputNode.value = 'clea';
          palette.refresh();
          MessageLoop.flush();

          // Expect that headers and items appear in descending score order,
          // even if the same header occurs multiple times.
          const children = palette.contentNode.children;
          expect(children.length).to.equal(7);
          expect(children[0].textContent).to.equal('Notebook Cell Operations');
          expect(children[1].getAttribute('data-command')).to.equal(
            'example:clear-cell'
          );
          // The next match should be from a different category
          expect(children[2].textContent).to.equal('File');
          expect(children[3].getAttribute('data-command')).to.equal(
            'example:close-tab'
          );
          // The next match should be the same as in a previous category
          expect(children[4].textContent).to.equal('Notebook Cell Operations');
          expect(children[5].getAttribute('data-command')).to.equal(
            'example:cut-cells'
          );
          // The next match has the same category as the previous one did, so the header is not repeated
          expect(children[6].getAttribute('data-command')).to.equal(
            'example:run-cell'
          );
        } finally {
          palette.dispose();
        }
      });

      it('should clear the widget content if hidden', () => {
        commands.addCommand('test', { execute: () => {}, label: 'test' });
        palette.addItem({ command: 'test', category: 'test' });
        const content = palette.contentNode;
        const itemClass = '.lm-CommandPalette-item';
        const items = () => content.querySelectorAll(itemClass);

        palette.refresh();
        MessageLoop.flush();

        expect(items()).to.have.length(1);

        palette.hide();
        palette.refresh();
        MessageLoop.flush();
        expect(items()).to.have.length(0);
      });

      it('should clear the widget content if container is hidden', () => {
        const parent = new Widget();
        Widget.attach(parent, document.body);
        try {
          palette.parent = parent;
          commands.addCommand('test', { execute: () => {}, label: 'test' });
          palette.addItem({ command: 'test', category: 'test' });
          const content = palette.contentNode;
          const itemClass = '.lm-CommandPalette-item';
          const items = () => content.querySelectorAll(itemClass);

          palette.refresh();
          MessageLoop.flush();

          expect(items()).to.have.length(1);

          parent.hide();
          palette.refresh();
          MessageLoop.flush();
          expect(items()).to.have.length(0);
        } finally {
          parent.dispose();
        }
      });
    });

    describe('#handleEvent()', () => {
      it('should handle click, keydown, and input events', () => {
        let palette = new LogPalette({ commands });
        Widget.attach(palette, document.body);
        try {
          ['click', 'keydown', 'input'].forEach(type => {
            palette.node.dispatchEvent(new Event(type, { bubbles }));
            expect(palette.events).to.contain(type);
          });
        } finally {
          palette.dispose();
        }
      });

      context('click', () => {
        it('should trigger a command when its item is clicked', () => {
          let called = false;
          commands.addCommand('test', { execute: () => (called = true) });

          palette.addItem(defaultOptions);
          MessageLoop.flush();

          let node = palette.contentNode.querySelector(
            '.lm-CommandPalette-item'
          )!;
          node.dispatchEvent(new MouseEvent('click', { bubbles }));
          expect(called).to.equal(true);
        });

        it('should ignore the event if it is not a left click', () => {
          let called = false;
          commands.addCommand('test', { execute: () => (called = true) });

          palette.addItem(defaultOptions);
          MessageLoop.flush();

          let node = palette.contentNode.querySelector(
            '.lm-CommandPalette-item'
          )!;
          node.dispatchEvent(new MouseEvent('click', { bubbles, button: 1 }));
          expect(called).to.equal(false);
        });
      });

      context('keydown', () => {
        it('should navigate down if down arrow is pressed', () => {
          commands.addCommand('test', { execute: () => {} });
          let content = palette.contentNode;

          palette.addItem(defaultOptions);
          MessageLoop.flush();

          let node = content.querySelector('.lm-mod-active');
          expect(node).to.equal(null);
          palette.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              bubbles,
              keyCode: 40 // Down arrow
            })
          );
          MessageLoop.flush();
          node = content.querySelector('.lm-CommandPalette-item.lm-mod-active');
          expect(node).to.not.equal(null);
        });

        it('should navigate up if up arrow is pressed', () => {
          commands.addCommand('test', { execute: () => {} });
          let content = palette.contentNode;

          palette.addItem(defaultOptions);
          MessageLoop.flush();

          let node = content.querySelector('.lm-mod-active');
          expect(node).to.equal(null);
          palette.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              bubbles,
              keyCode: 38 // Up arrow
            })
          );
          MessageLoop.flush();
          node = content.querySelector('.lm-CommandPalette-item.lm-mod-active');
          expect(node).to.not.equal(null);
        });

        it('should ignore if modifier keys are pressed', () => {
          let called = false;
          commands.addCommand('test', { execute: () => (called = true) });
          let content = palette.contentNode;

          palette.addItem(defaultOptions);
          MessageLoop.flush();

          let node = content.querySelector('.lm-mod-active');

          expect(node).to.equal(null);
          ['altKey', 'ctrlKey', 'shiftKey', 'metaKey'].forEach(key => {
            palette.node.dispatchEvent(
              new KeyboardEvent('keydown', {
                bubbles,
                [key]: true,
                keyCode: 38 // Up arrow
              })
            );
            node = content.querySelector(
              '.lm-CommandPalette-item.lm-mod-active'
            );
            expect(node).to.equal(null);
          });
          expect(called).to.be.false;
        });

        it('should trigger active item if enter is pressed', () => {
          let called = false;
          commands.addCommand('test', {
            execute: () => (called = true)
          });
          let content = palette.contentNode;

          palette.addItem(defaultOptions);
          MessageLoop.flush();

          expect(content.querySelector('.lm-mod-active')).to.equal(null);
          palette.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              bubbles,
              keyCode: 40 // Down arrow
            })
          );
          palette.node.dispatchEvent(
            new KeyboardEvent('keydown', {
              bubbles,
              keyCode: 13 // Enter
            })
          );
          expect(called).to.equal(true);
        });
      });

      context('input', () => {
        it('should filter the list of visible items', () => {
          ['A', 'B', 'C', 'D', 'E'].forEach(name => {
            commands.addCommand(name, { execute: () => {}, label: name });
            palette.addItem({ command: name, category: 'test' });
          });

          MessageLoop.flush();

          let content = palette.contentNode;
          let itemClass = '.lm-CommandPalette-item';
          let items = () => content.querySelectorAll(itemClass);

          expect(items()).to.have.length(5);
          palette.inputNode.value = 'A';
          palette.refresh();
          MessageLoop.flush();
          expect(items()).to.have.length(1);
        });

        it('should filter by both text and category', () => {
          let categories = ['Z', 'Y'];
          let names = [
            ['A1', 'B2', 'C3', 'D4', 'E5'],
            ['F1', 'G2', 'H3', 'I4', 'J5']
          ];
          names.forEach((values, index) => {
            values.forEach(command => {
              palette.addItem({ command, category: categories[index] });
              commands.addCommand(command, {
                execute: () => {},
                label: command
              });
            });
          });

          MessageLoop.flush();

          let headers = () =>
            palette.node.querySelectorAll('.lm-CommandPalette-header');
          let items = () =>
            palette.node.querySelectorAll('.lm-CommandPalette-item');
          let input = (value: string) => {
            palette.inputNode.value = value;
            palette.refresh();
            MessageLoop.flush();
          };

          expect(items()).to.have.length(10);
          input(`${categories[1]}`); // Category match
          expect(items()).to.have.length(5);
          input(`${names[1][0]}`); // Label match
          expect(items()).to.have.length(1);
          input(`${categories[1]} B`); // No match
          expect(items()).to.have.length(0);
          input(`${categories[1]} I`); // Category and text match
          expect(items()).to.have.length(1);

          input('1'); // Multi-category match
          expect(headers()).to.have.length(2);
          expect(items()).to.have.length(2);
        });
      });
    });

    describe('.Renderer', () => {
      let renderer = new CommandPalette.Renderer();
      let item: CommandPalette.IItem = null!;
      let enabledFlag = true;
      let toggledFlag = false;

      beforeEach(() => {
        enabledFlag = true;
        toggledFlag = false;
        commands.addCommand('test', {
          label: 'Test Command',
          caption: 'A simple test command',
          className: 'testClass',
          isEnabled: () => enabledFlag,
          isToggled: () => toggledFlag,
          execute: () => {}
        });
        commands.addKeyBinding({
          command: 'test',
          keys: ['Ctrl A'],
          selector: 'body'
        });
        item = palette.addItem({
          command: 'test',
          category: 'Test Category'
        });
      });

      describe('#renderHeader()', () => {
        it('should render a header node for the palette', () => {
          let vNode = renderer.renderHeader({
            category: 'Test Category',
            indices: null
          });
          let node = VirtualDOM.realize(vNode);
          expect(node.classList.contains('lm-CommandPalette-header')).to.equal(
            true
          );
          expect(node.innerHTML).to.equal('Test Category');
        });

        it('should mark the matching indices', () => {
          let vNode = renderer.renderHeader({
            category: 'Test Category',
            indices: [1, 2, 6, 7, 8]
          });
          let node = VirtualDOM.realize(vNode);
          expect(node.classList.contains('lm-CommandPalette-header')).to.equal(
            true
          );
          expect(node.innerHTML).to.equal(
            'T<mark>es</mark>t C<mark>ate</mark>gory'
          );
        });
      });

      describe('#renderItem()', () => {
        it('should render an item node for the palette', () => {
          let vNode = renderer.renderItem({
            item,
            indices: null,
            active: false
          });
          let node = VirtualDOM.realize(vNode);
          expect(node.classList.contains('lm-CommandPalette-item')).to.equal(
            true
          );
          expect(node.classList.contains('lm-mod-disabled')).to.equal(false);
          expect(node.classList.contains('lm-mod-toggled')).to.equal(false);
          expect(node.classList.contains('lm-mod-active')).to.equal(false);
          expect(node.classList.contains('testClass')).to.equal(true);
          expect(node.getAttribute('data-command')).to.equal('test');
          expect(
            node.querySelector('.lm-CommandPalette-itemShortcut')
          ).to.not.equal(null);
          expect(
            node.querySelector('.lm-CommandPalette-itemLabel')
          ).to.not.equal(null);
          expect(
            node.querySelector('.lm-CommandPalette-itemCaption')
          ).to.not.equal(null);
        });

        it('should handle the disabled item state', () => {
          enabledFlag = false;
          let vNode = renderer.renderItem({
            item,
            indices: null,
            active: false
          });
          let node = VirtualDOM.realize(vNode);
          expect(node.classList.contains('lm-mod-disabled')).to.equal(true);
        });

        it('should handle the toggled item state', () => {
          toggledFlag = true;
          let vNode = renderer.renderItem({
            item,
            indices: null,
            active: false
          });
          let node = VirtualDOM.realize(vNode);
          expect(node.classList.contains('lm-mod-toggled')).to.equal(true);
        });

        it('should handle the active state', () => {
          let vNode = renderer.renderItem({
            item,
            indices: null,
            active: true
          });
          let node = VirtualDOM.realize(vNode);
          expect(node.classList.contains('lm-mod-active')).to.equal(true);
        });

        it('should handle the recent state', () => {
          let vNode = renderer.renderItem({
            item,
            indices: null,
            active: false,
            recent: true
          });
          let node = VirtualDOM.realize(vNode);
          expect(node.classList.contains('lm-mod-recent')).to.equal(true);
        });
      });

      describe('#renderEmptyMessage()', () => {
        it('should render an empty message node for the palette', () => {
          let vNode = renderer.renderEmptyMessage({ query: 'foo' });
          let node = VirtualDOM.realize(vNode);
          expect(
            node.classList.contains('lm-CommandPalette-emptyMessage')
          ).to.equal(true);
          expect(node.innerHTML).to.equal("No commands found that match 'foo'");
        });
      });

      describe('#renderItemShortcut()', () => {
        it('should render an item shortcut node', () => {
          let vNode = renderer.renderItemShortcut({
            item,
            indices: null,
            active: false
          });
          let node = VirtualDOM.realize(vNode);
          expect(
            node.classList.contains('lm-CommandPalette-itemShortcut')
          ).to.equal(true);
          if (Platform.IS_MAC) {
            expect(node.innerHTML).to.equal('\u2303 A');
          } else {
            expect(node.innerHTML).to.equal('Ctrl+A');
          }
        });
      });

      describe('#renderItemLabel()', () => {
        it('should render an item label node', () => {
          let vNode = renderer.renderItemLabel({
            item,
            indices: [1, 2, 3],
            active: false
          });
          let node = VirtualDOM.realize(vNode);
          expect(
            node.classList.contains('lm-CommandPalette-itemLabel')
          ).to.equal(true);
          expect(node.innerHTML).to.equal('T<mark>est</mark> Command');
        });
      });

      describe('#renderItemCaption()', () => {
        it('should render an item caption node', () => {
          let vNode = renderer.renderItemCaption({
            item,
            indices: null,
            active: false
          });
          let node = VirtualDOM.realize(vNode);
          expect(
            node.classList.contains('lm-CommandPalette-itemCaption')
          ).to.equal(true);
          expect(node.innerHTML).to.equal('A simple test command');
        });
      });

      describe('#createItemClass()', () => {
        it('should create the full class name for the item node', () => {
          let name = renderer.createItemClass({
            item,
            indices: null,
            active: false
          });
          let expected = 'lm-CommandPalette-item testClass';
          expect(name).to.equal(expected);
        });

        it('should handle the boolean states', () => {
          enabledFlag = false;
          toggledFlag = true;
          let name = renderer.createItemClass({
            item,
            indices: null,
            active: true,
            recent: true
          });
          let expected =
            'lm-CommandPalette-item lm-mod-disabled lm-mod-toggled lm-mod-active lm-mod-recent testClass';
          expect(name).to.equal(expected);
        });
      });

      describe('#createItemDataset()', () => {
        it('should create the item dataset', () => {
          let dataset = renderer.createItemDataset({
            item,
            indices: null,
            active: false
          });
          expect(dataset).to.deep.equal({ command: 'test' });
        });
      });

      describe('#formatHeader()', () => {
        it('should format unmatched header content', () => {
          let child1 = renderer.formatHeader({
            category: 'Test Category',
            indices: null
          });
          let child2 = renderer.formatHeader({
            category: 'Test Category',
            indices: []
          });
          expect(child1).to.equal('Test Category');
          expect(child2).to.equal('Test Category');
        });

        it('should format matched header content', () => {
          let child = renderer.formatHeader({
            category: 'Test Category',
            indices: [1, 2, 6, 7, 8]
          });
          let node = VirtualDOM.realize(h.div(child));
          expect(node.innerHTML).to.equal(
            'T<mark>es</mark>t C<mark>ate</mark>gory'
          );
        });
      });

      describe('#formatEmptyMessage()', () => {
        it('should format the empty message text', () => {
          let child = renderer.formatEmptyMessage({ query: 'foo' });
          expect(child).to.equal("No commands found that match 'foo'");
        });
      });

      describe('#formatItemShortcut()', () => {
        it('should format the item shortcut text', () => {
          let child = renderer.formatItemShortcut({
            item,
            indices: null,
            active: false
          });
          if (Platform.IS_MAC) {
            expect(child).to.equal('\u2303 A');
          } else {
            expect(child).to.equal('Ctrl+A');
          }
        });
      });

      describe('#formatItemLabel()', () => {
        it('should format unmatched label content', () => {
          let child1 = renderer.formatItemLabel({
            item,
            indices: null,
            active: false
          });
          let child2 = renderer.formatItemLabel({
            item,
            indices: [],
            active: false
          });
          expect(child1).to.equal('Test Command');
          expect(child2).to.equal('Test Command');
        });

        it('should format matched label content', () => {
          let child = renderer.formatItemLabel({
            item,
            indices: [1, 2, 3],
            active: false
          });
          let node = VirtualDOM.realize(h.div(child));
          expect(node.innerHTML).to.equal('T<mark>est</mark> Command');
        });
      });

      describe('#formatItemCaption()', () => {
        it('should format the item caption text', () => {
          let child = renderer.formatItemCaption({
            item,
            indices: null,
            active: false
          });
          expect(child).to.equal('A simple test command');
        });
      });
    });
  });
});
