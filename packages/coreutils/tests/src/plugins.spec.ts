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

import { type IPlugin, PluginRegistry, Token } from '@lumino/coreutils';

describe('@lumino/coreutils', () => {
  describe('PluginRegistry', () => {
    describe('#constructor', () => {
      it('should instantiate an plugin registry without options', () => {
        const plugins = new PluginRegistry();

        expect(plugins).to.be.instanceOf(PluginRegistry);
      });

      it('should accept validation function', () => {
        const plugins = new PluginRegistry({
          validatePlugin: (plugin: IPlugin<any, any>) =>
            !['plugin1', 'plugin2'].includes(plugin.id)
        });

        expect(plugins).to.be.instanceOf(PluginRegistry);
      });
    });

    describe('#application', () => {
      it('should be null by default', () => {
        const plugins = new PluginRegistry();

        expect(plugins.application).to.be.null;
      });

      it('should accept any object', () => {
        const plugins = new PluginRegistry();

        const app = Object.freeze({});
        plugins.application = app;

        expect(plugins.application).to.be.equal(app);
      });

      it('cannot be overridden', () => {
        const plugins = new PluginRegistry();

        const app = Object.freeze({});
        plugins.application = app;

        expect(plugins.application).to.be.equal(app);

        expect(function () {
          plugins.application = Object.freeze({});
        }).to.throw();
      });
    });

    describe('#getPluginDescription', () => {
      it('should return the plugin description', () => {
        const plugins = new PluginRegistry();
        const id = 'plugin1';
        const description = 'Plugin 1 description';
        plugins.registerPlugin({
          id,
          description,
          activate: () => {
            // no-op
          }
        });

        expect(plugins.getPluginDescription(id)).to.equal(description);
      });

      it('should return an empty string if plugin has no description', () => {
        const plugins = new PluginRegistry();
        const id = 'plugin1';
        plugins.registerPlugin({
          id,
          activate: () => {
            // no-op
          }
        });

        expect(plugins.getPluginDescription(id)).to.equal('');
      });

      it('should return an empty string if plugin does not exist', () => {
        const plugins = new PluginRegistry();
        const id = 'plugin1';

        expect(plugins.getPluginDescription(id)).to.equal('');
      });
    });

    describe('#hasPlugin', () => {
      it('should be true for registered plugin', () => {
        const pluginRegistry = new PluginRegistry();
        const id = 'plugin1';
        pluginRegistry.registerPlugin({
          id,
          activate: () => {
            // no-op
          }
        });

        expect(pluginRegistry.hasPlugin(id)).to.be.true;
      });

      it('should be false for unregistered plugin', () => {
        const plugins = new PluginRegistry();
        const id = 'plugin1';
        plugins.registerPlugin({
          id,
          activate: () => {
            // no-op
          }
        });

        expect(plugins.hasPlugin('plugin2')).to.be.false;
      });
    });

    describe('#isPluginActivated', () => {
      it('should be true for activated plugin', async () => {
        const plugins = new PluginRegistry();
        const id = 'plugin1';
        plugins.registerPlugin({
          id,
          activate: () => {
            // no-op
          }
        });
        await plugins.activatePlugin(id);
        expect(plugins.isPluginActivated(id)).to.be.true;
      });

      it('should be true for an autoStart plugin', async () => {
        const plugins = new PluginRegistry();
        const id = 'plugin1';
        plugins.registerPlugin({
          id,
          activate: () => {
            // no-op
          },
          autoStart: true
        });
        await plugins.activatePlugins('startUp');
        expect(plugins.isPluginActivated(id)).to.be.true;
      });

      it('should be false for not activated plugin', async () => {
        const plugins = new PluginRegistry();
        const id = 'plugin1';
        plugins.registerPlugin({
          id,
          activate: () => {
            // no-op
          }
        });
        expect(plugins.isPluginActivated(id)).to.be.false;
      });

      it('should be false for deferred plugin when application start', async () => {
        const plugins = new PluginRegistry();
        const id = 'plugin1';
        plugins.registerPlugin({
          id,
          activate: () => {
            // no-op
          },
          autoStart: 'defer'
        });
        await plugins.activatePlugins('startUp');
        expect(plugins.isPluginActivated(id)).to.be.false;
        await plugins.activatePlugins('defer');
        expect(plugins.isPluginActivated(id)).to.be.true;
      });

      it('should be false for unregistered plugin', async () => {
        const plugins = new PluginRegistry();
        const id = 'plugin1';
        plugins.registerPlugin({
          id,
          activate: () => {
            // no-op
          }
        });
        await plugins.activatePlugin(id);
        expect(plugins.isPluginActivated('no-registered')).to.be.false;
      });
    });

    describe('#listPlugins', () => {
      it('should list the registered plugin', () => {
        const plugins = new PluginRegistry();
        const ids = ['plugin1', 'plugin2'];
        ids.forEach(id => {
          plugins.registerPlugin({
            id,
            activate: () => {
              // no-op
            }
          });
        });

        expect(plugins.listPlugins()).to.deep.equal(ids);
      });
    });

    describe('#registerPlugin', () => {
      it('should register a plugin', () => {
        const plugins = new PluginRegistry();
        const id = 'plugin1';
        plugins.registerPlugin({
          id,
          activate: () => {
            // no-op
          }
        });

        expect(plugins.hasPlugin(id)).to.be.true;
      });

      it('should not register an already registered plugin', () => {
        const plugins = new PluginRegistry();
        const id = 'plugin1';
        plugins.registerPlugin({
          id,
          activate: () => {
            // no-op
          }
        });

        expect(function () {
          plugins.registerPlugin({
            id,
            activate: () => {
              // no-op
            }
          });
        }).to.throw();
      });

      it('should not register a plugin introducing a cycle', () => {
        const plugins = new PluginRegistry();
        const id1 = 'plugin1';
        const token1 = new Token<any>(id1);
        const id2 = 'plugin2';
        const token2 = new Token<any>(id2);
        const id3 = 'plugin3';
        const token3 = new Token<any>(id3);
        plugins.registerPlugin({
          id: id1,
          activate: () => {
            // no-op
          },
          requires: [token3],
          provides: token1
        });
        plugins.registerPlugin({
          id: id2,
          activate: () => {
            // no-op
          },
          requires: [token1],
          provides: token2
        });

        expect(function () {
          plugins.registerPlugin({
            id: id3,
            activate: () => {
              // no-op
            },
            requires: [token2],
            provides: token3
          });
        }).to.throw();
      });

      it('should register a plugin defined by a class', () => {
        const plugins = new PluginRegistry();
        const id = 'plugin1';
        const plugin = new (class {
          readonly id = id;
          activate = () => {
            // Check this.id is accessible as expected
            // as we are tearing a part the plugin object.
            expect(this.id).to.equal(id);
          };
        })();
        plugins.registerPlugin(plugin);

        expect(plugins.hasPlugin(id)).to.be.true;
      });

      it('should refuse to register invalid plugins', async () => {
        const plugins = new PluginRegistry({
          validatePlugin: (plugin: IPlugin<any, any>) =>
            ['id1'].includes(plugin.id)
        });
        expect(function () {
          plugins.registerPlugin({
            id: 'id',
            activate: () => {
              /* no-op */
            }
          });
        }).to.throw();
        plugins.registerPlugin({
          id: 'id1',
          activate: () => {
            /* no-op */
          }
        });
      });
    });

    describe('#deregisterPlugin', () => {
      it('should deregister a deactivated registered plugin', () => {
        const plugins = new PluginRegistry();
        const id = 'plugin1';
        plugins.registerPlugin({
          id,
          activate: () => {
            // no-op
          }
        });

        plugins.deregisterPlugin(id);

        expect(plugins.hasPlugin(id)).to.be.false;
      });

      it('should not deregister an activated registered plugin', async () => {
        const plugins = new PluginRegistry();
        const id = 'plugin1';
        plugins.registerPlugin({
          id,
          activate: () => {
            // no-op
          }
        });

        await plugins.activatePlugin(id);

        expect(() => {
          plugins.deregisterPlugin(id);
        }).to.throw();
        expect(plugins.hasPlugin(id)).to.be.true;
      });

      it('should force deregister an activated registered plugin', async () => {
        const plugins = new PluginRegistry();
        const id = 'plugin1';
        plugins.registerPlugin({
          id,
          activate: () => {
            // no-op
          }
        });

        await plugins.activatePlugin(id);

        plugins.deregisterPlugin(id, true);
        expect(plugins.hasPlugin(id)).to.be.false;
      });
    });

    describe('#activatePlugin', () => {
      it('should activate a registered plugin', async () => {
        const plugins = new PluginRegistry();
        const id = 'plugin1';
        plugins.registerPlugin({
          id,
          activate: () => {
            // no-op
          }
        });
        await plugins.activatePlugin(id);
        expect(plugins.isPluginActivated(id)).to.be.true;
      });

      it('should throw an error when activating a unregistered plugin', async () => {
        const plugins = new PluginRegistry();
        const id = 'plugin1';
        plugins.registerPlugin({
          id,
          activate: () => {
            // no-op
          }
        });

        try {
          await plugins.activatePlugin('other-id');
        } catch (reason) {
          return;
        }

        expect(false, 'app.activatePlugin did not throw').to.be.true;
      });

      it('should tolerate activating an activated plugin', async () => {
        const plugins = new PluginRegistry();
        const id = 'plugin1';
        plugins.registerPlugin({
          id,
          activate: () => {
            // no-op
          }
        });
        await plugins.activatePlugin(id);

        await plugins.activatePlugin(id);

        expect(plugins.isPluginActivated(id)).to.be.true;
      });

      it('should activate all required services', async () => {
        const plugins = new PluginRegistry();
        const id1 = 'plugin1';
        const token1 = new Token<any>(id1);
        const id2 = 'plugin2';
        const token2 = new Token<any>(id2);
        const id3 = 'plugin3';
        const token3 = new Token<any>(id3);
        plugins.registerPlugin({
          id: id1,
          activate: () => {
            // no-op
          },
          provides: token1
        });
        plugins.registerPlugin({
          id: id2,
          activate: () => {
            // no-op
          },
          requires: [token1],
          provides: token2
        });
        plugins.registerPlugin({
          id: id3,
          activate: () => {
            // no-op
          },
          requires: [token2],
          provides: token3
        });

        await plugins.activatePlugin(id3);

        expect(plugins.isPluginActivated(id3)).to.be.true;
        expect(plugins.isPluginActivated(id1)).to.be.true;
        expect(plugins.isPluginActivated(id2)).to.be.true;
      });

      it('should try activating all optional services', async () => {
        const plugins = new PluginRegistry();
        const id1 = 'plugin1';
        const token1 = new Token<any>(id1);
        const id2 = 'plugin2';
        const token2 = new Token<any>(id2);
        const id3 = 'plugin3';
        const token3 = new Token<any>(id3);
        plugins.registerPlugin({
          id: id1,
          activate: () => {
            // no-op
          },
          provides: token1
        });
        plugins.registerPlugin({
          id: id2,
          activate: () => {
            throw new Error(`Force failure during '${id2}' activation`);
          },
          provides: token2
        });
        plugins.registerPlugin({
          id: id3,
          activate: () => {
            // no-op
          },
          optional: [token1, token2],
          provides: token3
        });

        await plugins.activatePlugin(id3);

        expect(plugins.isPluginActivated(id3)).to.be.true;
        expect(plugins.isPluginActivated(id1)).to.be.true;
        expect(plugins.isPluginActivated(id2)).to.be.false;
      });
    });

    describe('#deactivatePlugin', () => {
      it('should call deactivate on the plugin', async () => {
        const plugins = new PluginRegistry();
        const id = 'plugin1';
        let deactivated: boolean | null = null;
        plugins.registerPlugin({
          id,
          activate: () => {
            deactivated = false;
          },
          deactivate: () => {
            deactivated = true;
          }
        });

        await plugins.activatePlugin(id);

        expect(deactivated).to.be.false;

        const others = await plugins.deactivatePlugin(id);

        expect(deactivated).to.be.true;
        expect(others.length).to.equal(0);
      });

      it('should throw an error if the plugin does not support deactivation', async () => {
        const plugins = new PluginRegistry();
        const id = 'plugin1';
        plugins.registerPlugin({
          id,
          activate: () => {
            // no-op
          }
        });

        await plugins.activatePlugin(id);

        try {
          await plugins.deactivatePlugin(id);
        } catch (r) {
          return;
        }

        expect(true, 'app.deactivatePlugin did not throw').to.be.false;
      });

      it('should throw an error if the plugin has dependants not support deactivation', async () => {
        const plugins = new PluginRegistry();
        const id1 = 'plugin1';
        const token1 = new Token<any>(id1);
        const id2 = 'plugin2';
        const token2 = new Token<any>(id2);
        const id3 = 'plugin3';
        const token3 = new Token<any>(id3);
        plugins.registerPlugin({
          id: id1,
          activate: () => {
            // no-op
          },
          deactivate: () => {
            // no-op
          },
          provides: token1
        });
        plugins.registerPlugin({
          id: id2,
          activate: () => {
            // no-op
          },
          deactivate: () => {
            // no-op
          },
          requires: [token1],
          provides: token2
        });
        plugins.registerPlugin({
          id: id3,
          activate: () => {
            // no-op
          },
          requires: [token2],
          provides: token3
        });

        await plugins.activatePlugin(id3);

        try {
          await plugins.deactivatePlugin(id1);
        } catch (r) {
          return;
        }

        expect(true, 'app.deactivatePlugin did not throw').to.be.false;
      });

      it('should deactivate all dependents (optional or not)', async () => {
        const plugins = new PluginRegistry();
        let deactivated: boolean | null = null;
        const id1 = 'plugin1';
        const token1 = new Token<any>(id1);
        const id2 = 'plugin2';
        const token2 = new Token<any>(id2);
        const id3 = 'plugin3';
        const token3 = new Token<any>(id3);
        plugins.registerPlugin({
          id: id1,
          activate: () => {
            deactivated = false;
          },
          deactivate: () => {
            deactivated = true;
          },
          provides: token1
        });
        plugins.registerPlugin({
          id: id2,
          activate: () => {
            // no-op
          },
          deactivate: () => {
            // no-op
          },
          requires: [token1],
          provides: token2
        });
        plugins.registerPlugin({
          id: id3,
          activate: () => {
            // no-op
          },
          deactivate: () => {
            // no-op
          },
          optional: [token2],
          provides: token3
        });

        await plugins.activatePlugin(id3);

        const others = await plugins.deactivatePlugin(id1);

        expect(deactivated).to.be.true;
        expect(others).to.deep.equal([id3, id2]);
        expect(plugins.isPluginActivated(id2)).to.be.false;
        expect(plugins.isPluginActivated(id3)).to.be.false;
      });
    });
  });
});
