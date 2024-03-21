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

import { JSONObject, ReadonlyJSONObject } from '@lumino/coreutils';

import { Platform } from '@lumino/domutils';

const NULL_COMMAND = {
  execute: (args: JSONObject) => {
    return args;
  }
};

describe('@lumino/commands', () => {
  describe('CommandRegistry', () => {
    let registry: CommandRegistry = null!;

    beforeEach(() => {
      registry = new CommandRegistry();
    });

    describe('#constructor()', () => {
      it('should take no arguments', () => {
        expect(registry).to.be.an.instanceof(CommandRegistry);
      });
    });

    describe('#commandChanged', () => {
      it('should be emitted when a command is added', () => {
        let called = false;
        registry.commandChanged.connect((reg, args) => {
          expect(reg).to.equal(registry);
          expect(args.id).to.equal('test');
          expect(args.type).to.equal('added');
          called = true;
        });
        registry.addCommand('test', NULL_COMMAND);
        expect(called).to.equal(true);
      });

      it('should be emitted when a command is changed', () => {
        let called = false;
        registry.addCommand('test', NULL_COMMAND);
        registry.commandChanged.connect((reg, args) => {
          expect(reg).to.equal(registry);
          expect(args.id).to.equal('test');
          expect(args.type).to.equal('changed');
          called = true;
        });
        registry.notifyCommandChanged('test');
        expect(called).to.equal(true);
      });

      it('should be emitted when a command is removed', () => {
        let called = false;
        let disposable = registry.addCommand('test', NULL_COMMAND);
        registry.commandChanged.connect((reg, args) => {
          expect(reg).to.equal(registry);
          expect(args.id).to.equal('test');
          expect(args.type).to.equal('removed');
          called = true;
        });
        disposable.dispose();
        expect(called).to.equal(true);
      });
    });

    describe('#commandExecuted', () => {
      it('should be emitted when a command is executed', () => {
        let called = false;
        registry.addCommand('test', NULL_COMMAND);
        registry.commandExecuted.connect((reg, args) => {
          expect(reg).to.equal(registry);
          expect(args.id).to.equal('test');
          expect(args.args).to.deep.equal({});
          expect(args.result).to.be.an.instanceof(Promise);
          called = true;
        });
        registry.execute('test');
        expect(called).to.equal(true);
      });
    });

    describe('#keyBindings', () => {
      it('should be the keybindings in the palette', () => {
        registry.addCommand('test', { execute: () => {} });
        registry.addKeyBinding({
          keys: ['Ctrl ;'],
          selector: `body`,
          command: 'test'
        });
        expect(registry.keyBindings.length).to.equal(1);
        expect(registry.keyBindings[0].command).to.equal('test');
      });
    });

    describe('#listCommands()', () => {
      it('should list the ids of the registered commands', () => {
        registry.addCommand('test0', NULL_COMMAND);
        registry.addCommand('test1', NULL_COMMAND);
        expect(registry.listCommands()).to.deep.equal(['test0', 'test1']);
      });

      it('should be a new array', () => {
        registry.addCommand('test0', NULL_COMMAND);
        registry.addCommand('test1', NULL_COMMAND);
        let cmds = registry.listCommands();
        cmds.push('test2');
        expect(registry.listCommands()).to.deep.equal(['test0', 'test1']);
      });
    });

    describe('#hasCommand()', () => {
      it('should test whether a specific command is registerd', () => {
        registry.addCommand('test', NULL_COMMAND);
        expect(registry.hasCommand('test')).to.equal(true);
        expect(registry.hasCommand('foo')).to.equal(false);
      });
    });

    describe('#addCommand()', () => {
      it('should add a command to the registry', () => {
        registry.addCommand('test', NULL_COMMAND);
        expect(registry.hasCommand('test')).to.equal(true);
      });

      it('should return a disposable which will unregister the command', () => {
        let disposable = registry.addCommand('test', NULL_COMMAND);
        disposable.dispose();
        expect(registry.hasCommand('test')).to.equal(false);
      });

      it('should throw an error if the given `id` is already registered', () => {
        registry.addCommand('test', NULL_COMMAND);
        expect(() => {
          registry.addCommand('test', NULL_COMMAND);
        }).to.throw(Error);
      });

      it('should clone the `cmd` before adding it to the registry', () => {
        let cmd = {
          execute: (args: JSONObject) => {
            return args;
          },
          label: 'foo'
        };
        registry.addCommand('test', cmd);
        cmd.label = 'bar';
        expect(registry.label('test')).to.equal('foo');
      });
    });

    describe('#notifyCommandChanged()', () => {
      it('should emit the `commandChanged` signal for the command', () => {
        let called = false;
        registry.addCommand('test', NULL_COMMAND);
        registry.commandChanged.connect((reg, args) => {
          expect(reg).to.equal(registry);
          expect(args.id).to.equal('test');
          expect(args.type).to.equal('changed');
          called = true;
        });
        registry.notifyCommandChanged('test');
        expect(called).to.equal(true);
      });

      it('should throw an error if the command is not registered', () => {
        expect(() => {
          registry.notifyCommandChanged('foo');
        }).to.throw(Error);
      });
    });

    describe('#label()', () => {
      it('should get the display label for a specific command', () => {
        let cmd = {
          execute: (args: JSONObject) => {
            return args;
          },
          label: 'foo'
        };
        registry.addCommand('test', cmd);
        expect(registry.label('test')).to.equal('foo');
      });

      it('should give the appropriate label given arguments', () => {
        let cmd = {
          execute: (args: JSONObject) => {
            return args;
          },
          label: (args: JSONObject) => {
            return JSON.stringify(args);
          }
        };
        registry.addCommand('test', cmd);
        expect(registry.label('test', {})).to.equal('{}');
      });

      it('should return an empty string if the command is not registered', () => {
        expect(registry.label('foo')).to.equal('');
      });

      it('should default to an empty string for a command', () => {
        registry.addCommand('test', NULL_COMMAND);
        expect(registry.label('test')).to.equal('');
      });
    });

    describe('#mnemonic()', () => {
      it('should get the mnemonic index for a specific command', () => {
        let cmd = {
          execute: (args: JSONObject) => {
            return args;
          },
          mnemonic: 1
        };
        registry.addCommand('test', cmd);
        expect(registry.mnemonic('test')).to.equal(1);
      });

      it('should give the appropriate mnemonic given arguments', () => {
        let cmd = {
          execute: (args: JSONObject) => {
            return args;
          },
          mnemonic: (args: JSONObject) => {
            return JSON.stringify(args).length;
          }
        };
        registry.addCommand('test', cmd);
        expect(registry.mnemonic('test', {})).to.equal(2);
      });

      it('should return a `-1` if the command is not registered', () => {
        expect(registry.mnemonic('foo')).to.equal(-1);
      });

      it('should default to `-1` for a command', () => {
        registry.addCommand('test', NULL_COMMAND);
        expect(registry.mnemonic('test')).to.equal(-1);
      });
    });

    describe('#icon()', () => {
      const iconRenderer = {
        render: (host: HTMLElement, options?: any) => {
          const renderNode = document.createElement('div');
          renderNode.className = 'lm-render';
          host.appendChild(renderNode);
        }
      };

      it('should get the icon for a specific command', () => {
        let cmd = {
          execute: (args: JSONObject) => {
            return args;
          },
          icon: iconRenderer
        };
        registry.addCommand('test', cmd);
        expect(registry.icon('test')).to.equal(iconRenderer);
      });

      it('should give the appropriate icon given arguments', () => {
        let cmd = {
          execute: (args: JSONObject) => {
            return args;
          },
          icon: iconRenderer
        };
        registry.addCommand('test', cmd);
        expect(registry.icon('test', {})).to.equal(iconRenderer);
      });

      it('should return undefined if the command is not registered', () => {
        expect(registry.icon('foo')).to.equal(undefined);
      });

      it('should default to undefined for a command', () => {
        registry.addCommand('test', NULL_COMMAND);
        expect(registry.icon('test')).to.equal(undefined);
      });
    });

    describe('#caption()', () => {
      it('should get the caption for a specific command', () => {
        let cmd = {
          execute: (args: JSONObject) => {
            return args;
          },
          caption: 'foo'
        };
        registry.addCommand('test', cmd);
        expect(registry.caption('test')).to.equal('foo');
      });

      it('should give the appropriate caption given arguments', () => {
        let cmd = {
          execute: (args: JSONObject) => {
            return args;
          },
          caption: (args: JSONObject) => {
            return JSON.stringify(args);
          }
        };
        registry.addCommand('test', cmd);
        expect(registry.caption('test', {})).to.equal('{}');
      });

      it('should return an empty string if the command is not registered', () => {
        expect(registry.caption('foo')).to.equal('');
      });

      it('should default to an empty string for a command', () => {
        registry.addCommand('test', NULL_COMMAND);
        expect(registry.caption('test')).to.equal('');
      });
    });

    describe('#describedBy()', () => {
      it('should get the description for a specific command', async () => {
        const description = {
          args: {
            properties: {},
            additionalProperties: false,
            type: 'object'
          }
        };
        let cmd = {
          execute: (args: JSONObject) => {
            return args;
          },
          describedBy: description
        };
        registry.addCommand('test', cmd);
        expect(await registry.describedBy('test')).to.deep.equal(description);
      });

      it('should accept a function', async () => {
        const description = {
          args: {
            properties: {},
            additionalProperties: false,
            type: 'object'
          }
        };

        let cmd = {
          execute: (args: JSONObject) => {
            return args;
          },
          describedBy: () => description
        };
        registry.addCommand('test', cmd);
        expect(await registry.describedBy('test')).to.deep.equal(description);
      });

      it('should accept an asynchronous function', async () => {
        const description = {
          args: {
            properties: {},
            additionalProperties: false,
            type: 'object'
          }
        };

        let cmd = {
          execute: (args: JSONObject) => {
            return args;
          },
          describedBy: () => Promise.resolve(description)
        };
        registry.addCommand('test', cmd);
        expect(await registry.describedBy('test')).to.deep.equal(description);
      });

      it('should accept args', async () => {
        const description = {
          properties: {},
          additionalProperties: false,
          type: 'object'
        };

        let cmd = {
          execute: (args: JSONObject) => {
            return args;
          },
          describedBy: (args: ReadonlyJSONObject) => {
            return {
              args
            };
          }
        };
        registry.addCommand('test', cmd);
        expect(
          await registry.describedBy('test', description as any)
        ).to.deep.equal({ args: description });
      });

      it('should return an empty description if the command is not registered', async () => {
        expect(await registry.describedBy('foo')).to.deep.equal({ args: null });
      });

      it('should default to an empty description for a command', async () => {
        registry.addCommand('test', NULL_COMMAND);
        expect(await registry.describedBy('test')).to.deep.equal({
          args: null
        });
      });
    });

    describe('#usage()', () => {
      it('should get the usage text for a specific command', () => {
        let cmd = {
          execute: (args: JSONObject) => {
            return args;
          },
          usage: 'foo'
        };
        registry.addCommand('test', cmd);
        expect(registry.usage('test')).to.equal('foo');
      });

      it('should give the appropriate usage text given arguments', () => {
        let cmd = {
          execute: (args: JSONObject) => {
            return args;
          },
          usage: (args: JSONObject) => {
            return JSON.stringify(args);
          }
        };
        registry.addCommand('test', cmd);
        expect(registry.usage('test', {})).to.equal('{}');
      });

      it('should return an empty string if the command is not registered', () => {
        expect(registry.usage('foo')).to.equal('');
      });

      it('should default to an empty string for a command', () => {
        registry.addCommand('test', NULL_COMMAND);
        expect(registry.usage('test')).to.equal('');
      });
    });

    describe('#className()', () => {
      it('should get the extra class name for a specific command', () => {
        let cmd = {
          execute: (args: JSONObject) => {
            return args;
          },
          className: 'foo'
        };
        registry.addCommand('test', cmd);
        expect(registry.className('test')).to.equal('foo');
      });

      it('should give the appropriate class name given arguments', () => {
        let cmd = {
          execute: (args: JSONObject) => {
            return args;
          },
          className: (args: JSONObject) => {
            return JSON.stringify(args);
          }
        };
        registry.addCommand('test', cmd);
        expect(registry.className('test', {})).to.equal('{}');
      });

      it('should return an empty string if the command is not registered', () => {
        expect(registry.className('foo')).to.equal('');
      });

      it('should default to an empty string for a command', () => {
        registry.addCommand('test', NULL_COMMAND);
        expect(registry.className('test')).to.equal('');
      });
    });

    describe('#isEnabled()', () => {
      it('should test whether a specific command is enabled', () => {
        let cmd = {
          execute: (args: JSONObject) => {
            return args;
          },
          isEnabled: (args: JSONObject) => {
            return args.enabled as boolean;
          }
        };
        registry.addCommand('test', cmd);
        expect(registry.isEnabled('test', { enabled: true })).to.equal(true);
        expect(registry.isEnabled('test', { enabled: false })).to.equal(false);
      });

      it('should return `false` if the command is not registered', () => {
        expect(registry.isEnabled('foo')).to.equal(false);
      });

      it('should default to `true` for a command', () => {
        registry.addCommand('test', NULL_COMMAND);
        expect(registry.isEnabled('test')).to.equal(true);
      });
    });

    describe('#isToggled()', () => {
      it('should test whether a specific command is toggled', () => {
        let cmd = {
          execute: (args: JSONObject) => {
            return args;
          },
          isToggled: (args: JSONObject) => {
            return args.toggled as boolean;
          }
        };
        registry.addCommand('test', cmd);
        expect(registry.isToggled('test', { toggled: true })).to.equal(true);
        expect(registry.isToggled('test', { toggled: false })).to.equal(false);
      });

      it('should return `false` if the command is not registered', () => {
        expect(registry.isToggled('foo')).to.equal(false);
      });

      it('should default to `false` for a command', () => {
        registry.addCommand('test', NULL_COMMAND);
        expect(registry.isToggled('test')).to.equal(false);
      });
    });

    describe('#isVisible()', () => {
      it('should test whether a specific command is visible', () => {
        let cmd = {
          execute: (args: JSONObject) => {
            return args;
          },
          isVisible: (args: JSONObject) => {
            return args.visible as boolean;
          }
        };
        registry.addCommand('test', cmd);
        expect(registry.isVisible('test', { visible: true })).to.equal(true);
        expect(registry.isVisible('test', { visible: false })).to.equal(false);
      });

      it('should return `false` if the command is not registered', () => {
        expect(registry.isVisible('foo')).to.equal(false);
      });

      it('should default to `true` for a command', () => {
        registry.addCommand('test', NULL_COMMAND);
        expect(registry.isVisible('test')).to.equal(true);
      });
    });

    describe('#execute()', () => {
      it('should execute a specific command', () => {
        let called = false;
        let cmd = {
          execute: (args: JSONObject) => {
            called = true;
          }
        };
        registry.addCommand('test', cmd);
        registry.execute('test');
        expect(called).to.equal(true);
      });

      it('should resolve with the result of the command', done => {
        let cmd = {
          execute: (args: JSONObject) => {
            return args;
          }
        };
        registry.addCommand('test', cmd);
        registry.execute('test', { foo: 12 }).then(result => {
          expect(result).to.deep.equal({ foo: 12 });
          done();
        });
      });

      it('should reject if the command throws an error', done => {
        let cmd = {
          execute: (args: JSONObject) => {
            throw new Error('');
          }
        };
        registry.addCommand('test', cmd);
        registry.execute('test').catch(() => {
          done();
        });
      });

      it('should reject if the command is not registered', done => {
        registry.execute('foo').catch(() => {
          done();
        });
      });
    });

    let elemID = 0;
    let elem: HTMLElement = null!;
    let parent: HTMLElement = null!;

    beforeEach(() => {
      parent = document.createElement('div') as HTMLElement;
      elem = document.createElement('div') as HTMLElement;
      parent.classList.add('lm-test-parent');
      elem.id = `test${elemID++}`;
      elem.addEventListener('keydown', event => {
        registry.processKeydownEvent(event);
      });
      parent.appendChild(elem);
      document.body.appendChild(parent);
    });

    afterEach(() => {
      document.body.removeChild(parent);
    });

    describe('#addKeyBinding()', () => {
      it('should add key bindings to the registry', () => {
        let called = false;
        registry.addCommand('test', {
          execute: () => {
            called = true;
          }
        });
        registry.addKeyBinding({
          keys: ['Ctrl ;'],
          selector: `#${elem.id}`,
          command: 'test'
        });
        elem.dispatchEvent(
          new KeyboardEvent('keydown', {
            keyCode: 59,
            ctrlKey: true
          })
        );
        expect(called).to.equal(true);
      });

      it('should remove a binding when disposed', () => {
        let called = false;
        registry.addCommand('test', {
          execute: () => {
            called = true;
          }
        });
        let binding = registry.addKeyBinding({
          keys: ['Ctrl ;'],
          selector: `#${elem.id}`,
          command: 'test'
        });
        binding.dispose();
        elem.dispatchEvent(
          new KeyboardEvent('keydown', {
            keyCode: 59,
            ctrlKey: true
          })
        );
        expect(called).to.equal(false);
      });

      it('should emit a key binding changed signal when added and removed', () => {
        let added = false;
        registry.addCommand('test', { execute: () => {} });
        registry.keyBindingChanged.connect((sender, args) => {
          added = args.type === 'added';
        });
        let binding = registry.addKeyBinding({
          keys: ['Ctrl ;'],
          selector: `#${elem.id}`,
          command: 'test'
        });
        expect(added).to.equal(true);
        binding.dispose();
        expect(added).to.equal(false);
      });

      it('should throw an error if binding has an invalid selector', () => {
        let options = { keys: ['Ctrl ;'], selector: '..', command: 'test' };
        expect(() => {
          registry.addKeyBinding(options);
        }).to.throw(Error);
      });
    });

    describe('#processKeydownEvent()', () => {
      it('should dispatch on a correct keyboard event', () => {
        let called = false;
        let _luminoEventType;
        let _luminoEventKeys;
        registry.addCommand('test', {
          execute: args => {
            called = true;
            _luminoEventType = (args._luminoEvent as ReadonlyJSONObject).type;
            _luminoEventKeys = (args._luminoEvent as ReadonlyJSONObject).keys;
          }
        });
        registry.addKeyBinding({
          keys: ['Ctrl ;'],
          selector: `#${elem.id}`,
          command: 'test'
        });
        elem.dispatchEvent(
          new KeyboardEvent('keydown', {
            keyCode: 59,
            ctrlKey: true
          })
        );
        expect(called).to.equal(true);
        expect(_luminoEventType).to.equal('keybinding');
        expect(_luminoEventKeys).to.contain('Ctrl ;');
      });

      it('should not dispatch on a suppressed node', () => {
        let called = false;
        registry.addCommand('test', {
          execute: () => {
            called = true;
          }
        });
        registry.addKeyBinding({
          keys: ['Ctrl ;'],
          selector: `.lm-test-parent`,
          command: 'test'
        });
        parent.setAttribute('data-lm-suppress-shortcuts', 'true');
        elem.dispatchEvent(
          new KeyboardEvent('keydown', {
            keyCode: 59,
            ctrlKey: true
          })
        );
        expect(called).to.equal(false);
      });

      it('should not dispatch on a non-matching keyboard event', () => {
        let called = false;
        registry.addCommand('test', {
          execute: () => {
            called = true;
          }
        });
        registry.addKeyBinding({
          keys: ['Ctrl ;'],
          selector: `#${elem.id}`,
          command: 'test'
        });
        elem.dispatchEvent(
          new KeyboardEvent('keydown', {
            keyCode: 45,
            ctrlKey: true
          })
        );
        expect(called).to.equal(false);
      });

      it('should not dispatch with non-matching modifiers', () => {
        let count = 0;
        registry.addCommand('test', {
          execute: () => {
            count++;
          }
        });
        registry.addKeyBinding({
          keys: ['Ctrl S'],
          selector: `#${elem.id}`,
          command: 'test'
        });
        elem.dispatchEvent(
          new KeyboardEvent('keydown', {
            keyCode: 83,
            altKey: true
          })
        );
        expect(count).to.equal(0);
        elem.dispatchEvent(
          new KeyboardEvent('keydown', {
            keyCode: 83,
            shiftKey: true
          })
        );
        expect(count).to.equal(0);
      });

      it('should not dispatch on a prevented keydown event', () => {
        let called = false;
        registry.addCommand('test', {
          execute: args => {
            called = true;
          }
        });
        registry.addKeyBinding({
          keys: ['Ctrl ;'],
          selector: `#${elem.id}`,
          command: 'test'
        });
        const event = new KeyboardEvent('keydown', {
          keyCode: 59,
          ctrlKey: true,
          cancelable: true
        });

        event.preventDefault();

        elem.dispatchEvent(event);
        expect(called).to.equal(false);
      });

      it('should prevent default on dispatch', () => {
        registry.addCommand('test', {
          execute: () => void 0
        });
        registry.addKeyBinding({
          keys: ['Ctrl ;'],
          selector: `#${elem.id}`,
          command: 'test'
        });
        const event = new KeyboardEvent('keydown', {
          keyCode: 59,
          ctrlKey: true
        });
        let defaultPrevented = false;
        event.preventDefault = () => {
          defaultPrevented = true;
        };
        elem.dispatchEvent(event);
        expect(defaultPrevented).to.equal(true);
      });

      it('should not prevent default when sequence does not match', () => {
        registry.addCommand('test', {
          execute: () => void 0
        });
        registry.addKeyBinding({
          keys: ['Ctrl ;'],
          selector: `#${elem.id}`,
          command: 'test'
        });
        const event = new KeyboardEvent('keydown', {
          keyCode: 59,
          ctrlKey: false
        });
        let defaultPrevented = false;
        event.preventDefault = () => {
          defaultPrevented = true;
        };
        elem.dispatchEvent(event);
        expect(defaultPrevented).to.equal(false);
      });

      it('should not prevent default if keybinding opts out', () => {
        registry.addCommand('test', {
          execute: () => void 0
        });
        registry.addKeyBinding({
          keys: ['Ctrl ;'],
          selector: `#${elem.id}`,
          command: 'test',
          preventDefault: false
        });
        const event = new KeyboardEvent('keydown', {
          keyCode: 59,
          ctrlKey: true
        });
        let defaultPrevented = false;
        event.preventDefault = () => {
          defaultPrevented = true;
        };
        elem.dispatchEvent(event);
        expect(defaultPrevented).to.equal(false);
      });

      it('should dispatch with multiple chords in a key sequence', () => {
        let count = 0;
        registry.addCommand('test', {
          execute: () => {
            count++;
          }
        });
        registry.addKeyBinding({
          keys: ['Ctrl K', 'Ctrl L'],
          selector: `#${elem.id}`,
          command: 'test'
        });
        elem.dispatchEvent(
          new KeyboardEvent('keydown', {
            keyCode: 75, // `K` key
            ctrlKey: true
          })
        );
        expect(count).to.equal(0);
        elem.dispatchEvent(
          new KeyboardEvent('keydown', {
            keyCode: 76, // `L` key
            ctrlKey: true
          })
        );
        expect(count).to.equal(1);
        elem.dispatchEvent(
          new KeyboardEvent('keydown', {
            keyCode: 76, // `L` key
            ctrlKey: true
          })
        );
        expect(count).to.equal(1);
        elem.dispatchEvent(
          new KeyboardEvent('keydown', {
            keyCode: 75, // `K` key
            ctrlKey: true
          })
        );
        expect(count).to.equal(1);
        elem.dispatchEvent(
          new KeyboardEvent('keydown', {
            keyCode: 76, // `L` key
            ctrlKey: true
          })
        );
        expect(count).to.equal(2);
      });

      it('should not execute handler without matching selector', () => {
        let count = 0;
        registry.addCommand('test', {
          execute: () => {
            count++;
          }
        });
        registry.addKeyBinding({
          keys: ['Shift P'],
          selector: '.inaccessible-scope',
          command: 'test'
        });
        expect(count).to.equal(0);
        elem.dispatchEvent(
          new KeyboardEvent('keydown', {
            keyCode: 80, // `P` key
            ctrlKey: true
          })
        );
        expect(count).to.equal(0);
      });

      it('should not execute a handler when missing a modifier', () => {
        let count = 0;
        registry.addCommand('test', {
          execute: () => {
            count++;
          }
        });
        registry.addKeyBinding({
          keys: ['Ctrl P'],
          selector: `#${elem.id}`,
          command: 'test'
        });
        expect(count).to.equal(0);
        // Dispatch `P` without ctrl
        elem.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 80 }));
        expect(count).to.equal(0);
      });

      it('should register partial and exact matches', () => {
        let count1 = 0;
        let count2 = 0;
        registry.addCommand('test1', {
          execute: () => {
            count1++;
          }
        });
        registry.addCommand('test2', {
          execute: () => {
            count2++;
          }
        });
        registry.addKeyBinding({
          keys: ['Ctrl S'],
          selector: `#${elem.id}`,
          command: 'test1'
        });
        registry.addKeyBinding({
          keys: ['Ctrl S', 'Ctrl D'],
          selector: `#${elem.id}`,
          command: 'test2'
        });
        expect(count1).to.equal(0);
        expect(count2).to.equal(0);
        elem.dispatchEvent(
          new KeyboardEvent('keydown', {
            keyCode: 83,
            ctrlKey: true
          })
        );
        expect(count1).to.equal(0);
        expect(count2).to.equal(0);
        elem.dispatchEvent(
          new KeyboardEvent('keydown', {
            keyCode: 68,
            ctrlKey: true
          })
        );
        expect(count1).to.equal(0);
        expect(count2).to.equal(1);
      });

      it('should recognize permutations of modifiers', () => {
        let count1 = 0;
        let count2 = 0;
        registry.addCommand('test1', {
          execute: () => {
            count1++;
          }
        });
        registry.addCommand('test2', {
          execute: () => {
            count2++;
          }
        });
        registry.addKeyBinding({
          keys: ['Shift Alt Ctrl T'],
          selector: `#${elem.id}`,
          command: 'test1'
        });
        registry.addKeyBinding({
          keys: ['Alt Shift Ctrl Q'],
          selector: `#${elem.id}`,
          command: 'test2'
        });
        expect(count1).to.equal(0);
        elem.dispatchEvent(
          new KeyboardEvent('keydown', {
            keyCode: 84,
            ctrlKey: true,
            altKey: true,
            shiftKey: true
          })
        );
        expect(count1).to.equal(1);
        expect(count2).to.equal(0);
        elem.dispatchEvent(
          new KeyboardEvent('keydown', {
            keyCode: 81,
            ctrlKey: true,
            altKey: true,
            shiftKey: true
          })
        );
        expect(count2).to.equal(1);
      });

      it('should play back a partial match that was not completed', () => {
        let codes: number[] = [];
        let keydown = (event: KeyboardEvent) => {
          codes.push(event.keyCode);
        };
        document.body.addEventListener('keydown', keydown);
        let called = false;
        registry.addCommand('test', {
          execute: () => {
            called = true;
          }
        });
        registry.addKeyBinding({
          keys: ['D', 'D'],
          selector: `#${elem.id}`,
          command: 'test'
        });
        elem.dispatchEvent(
          new KeyboardEvent('keydown', {
            keyCode: 68,
            bubbles: true
          })
        );
        expect(codes.length).to.equal(0);
        elem.dispatchEvent(
          new KeyboardEvent('keydown', {
            keyCode: 69,
            bubbles: true
          })
        );
        expect(called).to.equal(false);
        expect(codes).to.deep.equal([68, 69]);
        document.body.removeEventListener('keydown', keydown);
      });

      it('should play back a partial match that times out', done => {
        let codes: number[] = [];
        let keydown = (event: KeyboardEvent) => {
          codes.push(event.keyCode);
        };
        document.body.addEventListener('keydown', keydown);
        let called = false;
        registry.addCommand('test', {
          execute: () => {
            called = true;
          }
        });
        registry.addKeyBinding({
          keys: ['D', 'D'],
          selector: `#${elem.id}`,
          command: 'test'
        });
        elem.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 68 }));
        expect(codes.length).to.equal(0);
        setTimeout(() => {
          expect(codes).to.deep.equal([68]);
          expect(called).to.equal(false);
          document.body.removeEventListener('keydown', keydown);
          done();
        }, 1300);
      });

      it('should resolve an exact match of partial match time out', done => {
        let called1 = false;
        let called2 = false;
        registry.addCommand('test1', {
          execute: () => {
            called1 = true;
          }
        });
        registry.addCommand('test2', {
          execute: () => {
            called2 = true;
          }
        });
        registry.addKeyBinding({
          keys: ['D', 'D'],
          selector: `#${elem.id}`,
          command: 'test1'
        });
        registry.addKeyBinding({
          keys: ['D'],
          selector: `#${elem.id}`,
          command: 'test2'
        });
        elem.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 68 }));
        expect(called1).to.equal(false);
        expect(called2).to.equal(false);
        setTimeout(() => {
          expect(called1).to.equal(false);
          expect(called2).to.equal(true);
          done();
        }, 1300);
      });

      it('should pick the selector with greater specificity', () => {
        elem.classList.add('test');
        let called1 = false;
        let called2 = false;
        registry.addCommand('test1', {
          execute: () => {
            called1 = true;
          }
        });
        registry.addCommand('test2', {
          execute: () => {
            called2 = true;
          }
        });
        registry.addKeyBinding({
          keys: ['Ctrl ;'],
          selector: '.test',
          command: 'test1'
        });
        registry.addKeyBinding({
          keys: ['Ctrl ;'],
          selector: `#${elem.id}`,
          command: 'test2'
        });
        elem.dispatchEvent(
          new KeyboardEvent('keydown', {
            keyCode: 59,
            ctrlKey: true
          })
        );
        expect(called1).to.equal(false);
        expect(called2).to.equal(true);
      });

      it('should propagate if partial binding selector does not match', () => {
        let codes: number[] = [];
        let keydown = (event: KeyboardEvent) => {
          codes.push(event.keyCode);
        };
        document.body.addEventListener('keydown', keydown);
        let called = false;
        registry.addCommand('test', {
          execute: () => {
            called = true;
          }
        });
        registry.addKeyBinding({
          keys: ['D', 'D'],
          selector: '#baz',
          command: 'test'
        });
        elem.dispatchEvent(
          new KeyboardEvent('keydown', {
            keyCode: 68,
            bubbles: true
          })
        );
        expect(codes).to.deep.equal([68]);
        expect(called).to.equal(false);
        document.body.removeEventListener('keydown', keydown);
      });

      it('should propagate if exact binding selector does not match', () => {
        let codes: number[] = [];
        let keydown = (event: KeyboardEvent) => {
          codes.push(event.keyCode);
        };
        document.body.addEventListener('keydown', keydown);
        let called = false;
        registry.addCommand('test', {
          execute: () => {
            called = true;
          }
        });
        registry.addKeyBinding({
          keys: ['D'],
          selector: '#baz',
          command: 'test'
        });
        elem.dispatchEvent(
          new KeyboardEvent('keydown', {
            keyCode: 68,
            bubbles: true
          })
        );
        expect(codes).to.deep.equal([68]);
        expect(called).to.equal(false);
        document.body.removeEventListener('keydown', keydown);
      });

      it('should ignore modifier keys pressed in the middle of key sequence', () => {
        let count = 0;
        registry.addCommand('test', {
          execute: () => {
            count++;
          }
        });
        registry.addKeyBinding({
          keys: ['Ctrl K', 'Ctrl L'],
          selector: `#${elem.id}`,
          command: 'test'
        });
        elem.dispatchEvent(
          new KeyboardEvent('keydown', {
            keyCode: 75, // `K` key
            ctrlKey: true
          })
        );
        expect(count).to.equal(0);
        // User presses `ctrl` again - this should not break the sequence.
        elem.dispatchEvent(
          new KeyboardEvent('keydown', {
            keyCode: 17,
            ctrlKey: true
          })
        );
        expect(count).to.equal(0);
        elem.dispatchEvent(
          new KeyboardEvent('keydown', {
            keyCode: 76, // `L` key
            ctrlKey: true
          })
        );
        expect(count).to.equal(1);
      });

      it('should process key sequences that use different modifier keys', () => {
        let count = 0;
        registry.addCommand('test', {
          execute: () => {
            count++;
          }
        });
        registry.addKeyBinding({
          keys: ['Shift K', 'Ctrl L'],
          selector: `#${elem.id}`,
          command: 'test'
        });
        let eventShift = new KeyboardEvent('keydown', {
          keyCode: 16,
          shiftKey: true
        });
        let eventK = new KeyboardEvent('keydown', {
          keyCode: 75,
          shiftKey: true
        });
        let eventCtrl = new KeyboardEvent('keydown', {
          keyCode: 17,
          ctrlKey: true
        });
        let eventL = new KeyboardEvent('keydown', {
          keyCode: 76,
          ctrlKey: true
        });
        elem.dispatchEvent(eventShift);
        expect(count).to.equal(0);
        elem.dispatchEvent(eventK);
        expect(count).to.equal(0);
        elem.dispatchEvent(eventCtrl);
        expect(count).to.equal(0);
        elem.dispatchEvent(eventL);
        expect(count).to.equal(1);
      });
    });

    describe('.holdKeyBindingExecution()', () => {
      let calledPromise: Promise<boolean>;
      let execute: () => void;

      beforeEach(() => {
        calledPromise = Promise.race([
          new Promise<boolean>(_resolve => {
            execute = () => _resolve(true);
          }),
          new Promise<boolean>(resolve =>
            setTimeout(() => resolve(false), 1000)
          )
        ]);
      });

      it('should proceed with command execution if permission of the event resolves to true', async () => {
        registry.addCommand('test', {
          execute
        });
        registry.addKeyBinding({
          keys: ['Ctrl ;'],
          selector: `#${elem.id}`,
          command: 'test'
        });
        const event = new KeyboardEvent('keydown', {
          keyCode: 59,
          ctrlKey: true
        });
        registry.holdKeyBindingExecution(event, Promise.resolve(true));
        elem.dispatchEvent(event);
        const called = await calledPromise;
        expect(called).to.equal(true);
      });

      it('should prevent command execution if permission of the event resolves to false', async () => {
        registry.addCommand('test', {
          execute
        });
        registry.addKeyBinding({
          keys: ['Ctrl ;'],
          selector: `#${elem.id}`,
          command: 'test'
        });
        const event = new KeyboardEvent('keydown', {
          keyCode: 59,
          ctrlKey: true
        });
        registry.holdKeyBindingExecution(event, Promise.resolve(false));
        elem.dispatchEvent(event);
        const called = await calledPromise;
        expect(called).to.equal(false);
      });

      it('should prevent command execution if permission for any of the events resolves to false', async () => {
        registry.addCommand('test', {
          execute
        });
        registry.addKeyBinding({
          keys: ['Shift ['],
          selector: `#${elem.id}`,
          command: 'test'
        });
        const shiftEvent = new KeyboardEvent('keydown', {
          keyCode: 16,
          shiftKey: true
        });
        const bracketEvent = new KeyboardEvent('keydown', {
          keyCode: 219,
          shiftKey: true
        });
        registry.holdKeyBindingExecution(shiftEvent, Promise.resolve(true));
        registry.holdKeyBindingExecution(bracketEvent, Promise.resolve(false));
        elem.dispatchEvent(shiftEvent);
        elem.dispatchEvent(bracketEvent);
        const called = await calledPromise;
        expect(called).to.equal(false);
      });
    });

    describe('.parseKeystroke()', () => {
      it('should parse a keystroke into its parts', () => {
        let parts = CommandRegistry.parseKeystroke('Ctrl Shift Alt S');
        expect(parts.cmd).to.equal(false);
        expect(parts.ctrl).to.equal(true);
        expect(parts.alt).to.equal(true);
        expect(parts.shift).to.equal(true);
        expect(parts.key).to.equal('S');
      });

      it('should preserve arrow names in key without formatting', () => {
        let parts = CommandRegistry.parseKeystroke('ArrowRight');
        expect(parts.key).to.equal('ArrowRight');
      });

      it('should be a tolerant parse', () => {
        let parts = CommandRegistry.parseKeystroke('G Ctrl Shift S Shift K');
        expect(parts.cmd).to.equal(false);
        expect(parts.ctrl).to.equal(true);
        expect(parts.alt).to.equal(false);
        expect(parts.shift).to.equal(true);
        expect(parts.key).to.equal('K');
      });
    });

    describe('.formatKeystroke()', () => {
      it('should prepend modifiers', () => {
        let label = CommandRegistry.formatKeystroke('Ctrl Alt Shift S');
        if (Platform.IS_MAC) {
          expect(label).to.equal('\u2303 \u2325 \u21E7 S');
        } else {
          expect(label).to.equal('Ctrl+Alt+Shift+S');
        }
      });

      it('should format arrow', () => {
        let label = CommandRegistry.formatKeystroke('Alt ArrowDown');
        if (Platform.IS_MAC) {
          expect(label).to.equal('\u2325 \u2193');
        } else {
          expect(label).to.equal('Alt+Down');
        }
      });

      it('should format a list of keys', () => {
        let label = CommandRegistry.formatKeystroke(['D', 'D']);
        expect(label).to.equal('D, D');
      });
    });

    describe('.normalizeKeystroke()', () => {
      it('should normalize and validate a keystroke', () => {
        let stroke = CommandRegistry.normalizeKeystroke('Ctrl S');
        expect(stroke).to.equal('Ctrl S');
      });

      it('should handle multiple modifiers', () => {
        let stroke = CommandRegistry.normalizeKeystroke('Ctrl Shift Alt S');
        expect(stroke).to.equal('Ctrl Alt Shift S');
      });

      it('should handle platform specific modifiers', () => {
        let stroke = '';
        if (Platform.IS_MAC) {
          stroke = CommandRegistry.normalizeKeystroke('Cmd S');
          expect(stroke).to.equal('Cmd S');
          stroke = CommandRegistry.normalizeKeystroke('Accel S');
          expect(stroke).to.equal('Cmd S');
        } else {
          stroke = CommandRegistry.normalizeKeystroke('Cmd S');
          expect(stroke).to.equal('S');
          stroke = CommandRegistry.normalizeKeystroke('Accel S');
          expect(stroke).to.equal('Ctrl S');
        }
      });
    });

    describe('.keystrokeForKeydownEvent()', () => {
      it('should create a normalized keystroke', () => {
        let keystroke = CommandRegistry.keystrokeForKeydownEvent(
          new KeyboardEvent('keydown', {
            ctrlKey: true,
            keyCode: 83
          })
        );
        expect(keystroke).to.equal('Ctrl S');
      });

      it('should handle multiple modifiers', () => {
        let keystroke = CommandRegistry.keystrokeForKeydownEvent(
          new KeyboardEvent('keydown', {
            ctrlKey: true,
            altKey: true,
            shiftKey: true,
            keyCode: 83
          })
        );
        expect(keystroke).to.equal('Ctrl Alt Shift S');
      });

      it('should fail on an invalid shortcut', () => {
        let keystroke = CommandRegistry.keystrokeForKeydownEvent(
          new KeyboardEvent('keydown', { keyCode: -1 })
        );
        expect(keystroke).to.equal('');
      });

      it('should return keys that are marked as modifier in keyboard layout', () => {
        let keystroke = CommandRegistry.keystrokeForKeydownEvent(
          new KeyboardEvent('keydown', { keyCode: 17, ctrlKey: true })
        );
        expect(keystroke).to.equal('Ctrl');
      });
    });
  });
});
