// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
import { Application } from '@lumino/application';
import { CommandRegistry } from '@lumino/commands';
import { Token } from '@lumino/coreutils';
import { ContextMenu, Widget } from '@lumino/widgets';
import { expect } from 'chai';

describe('@lumino/application', () => {
  describe('Application', () => {
    describe('#constructor', () => {
      it('should instantiate an application', () => {
        const shell = new Widget();
        const app = new Application({
          shell
        });

        expect(app).to.be.instanceOf(Application);
        expect(app.commands).to.be.instanceOf(CommandRegistry);
        expect(app.contextMenu).to.be.instanceOf(ContextMenu);
        expect(app.shell).to.equal(shell);
      });
    });

    describe('#getPluginDescription', () => {
      it('should return the plugin description', () => {
        const app = new Application({ shell: new Widget() });
        const id = 'plugin1';
        const description = 'Plugin 1 description';
        app.registerPlugin({
          id,
          description,
          activate: () => {
            // no-op
          }
        });

        expect(app.getPluginDescription(id)).to.equal(description);
      });

      it('should return an empty string if plugin has no description', () => {
        const app = new Application({ shell: new Widget() });
        const id = 'plugin1';
        app.registerPlugin({
          id,
          activate: () => {
            // no-op
          }
        });

        expect(app.getPluginDescription(id)).to.equal('');
      });

      it('should return an empty string if plugin does not exist', () => {
        const app = new Application({ shell: new Widget() });
        const id = 'plugin1';

        expect(app.getPluginDescription(id)).to.equal('');
      });
    });

    describe('#hasPlugin', () => {
      it('should be true for registered plugin', () => {
        const app = new Application({ shell: new Widget() });
        const id = 'plugin1';
        app.registerPlugin({
          id,
          activate: () => {
            // no-op
          }
        });

        expect(app.hasPlugin(id)).to.be.true;
      });

      it('should be false for unregistered plugin', () => {
        const app = new Application({ shell: new Widget() });
        const id = 'plugin1';
        app.registerPlugin({
          id,
          activate: () => {
            // no-op
          }
        });

        expect(app.hasPlugin('plugin2')).to.be.false;
      });
    });

    describe('#listPlugins', () => {
      it('should list the registered plugin', () => {
        const app = new Application({ shell: new Widget() });
        const ids = ['plugin1', 'plugin2'];
        ids.forEach(id => {
          app.registerPlugin({
            id,
            activate: () => {
              // no-op
            }
          });
        });

        expect(app.listPlugins()).to.deep.equal(ids);
      });
    });

    describe('#registerPlugin', () => {
      it('should register a plugin', () => {
        const app = new Application({ shell: new Widget() });
        const id = 'plugin1';
        app.registerPlugin({
          id,
          activate: () => {
            // no-op
          }
        });

        expect(app.hasPlugin(id)).to.be.true;
      });

      it('should not register an already registered plugin', () => {
        const app = new Application({ shell: new Widget() });
        const id = 'plugin1';
        app.registerPlugin({
          id,
          activate: () => {
            // no-op
          }
        });

        expect(function () {
          app.registerPlugin({
            id,
            activate: () => {
              // no-op
            }
          });
        }).to.throw();
      });

      it('should not register a plugin introducing a cycle', () => {
        const app = new Application({ shell: new Widget() });
        const id1 = 'plugin1';
        const token1 = new Token<any>(id1);
        const id2 = 'plugin2';
        const token2 = new Token<any>(id2);
        const id3 = 'plugin3';
        const token3 = new Token<any>(id3);
        app.registerPlugin({
          id: id1,
          activate: () => {
            // no-op
          },
          requires: [token3],
          provides: token1
        });
        app.registerPlugin({
          id: id2,
          activate: () => {
            // no-op
          },
          requires: [token1],
          provides: token2
        });

        expect(function () {
          app.registerPlugin({
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
        const app = new Application({ shell: new Widget() });
        const id = 'plugin1';
        const plugin = new (class {
          readonly id = id;
          activate = () => {
            // Check this.id is accessible as expected
            // as we are tearing a part the plugin object.
            expect(this.id).to.equal(id);
          };
        })();
        app.registerPlugin(plugin);

        expect(app.hasPlugin(id)).to.be.true;
      });
    });
  });
});
