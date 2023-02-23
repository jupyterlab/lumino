/*
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */

module.exports = {
  entryPoints: [
    'packages/algorithm',
    'packages/application',
    'packages/collections',
    'packages/commands',
    'packages/coreutils',
    'packages/datagrid',
    'packages/disposable',
    'packages/domutils',
    'packages/dragdrop',
    'packages/keyboard',
    'packages/messaging',
    'packages/polling',
    'packages/properties',
    'packages/signaling',
    'packages/virtualdom',
    'packages/widgets'
  ],
  entryPointStrategy: 'packages',
  exclude: [
    'buildutils',
    'examples/**',
    '**/tests/**',
    'packages/default-theme'
  ],
  includeVersion: true,
  name: '@lumino',
  out: 'docs/source/api',
  readme: 'none',
  navigationLinks: {
    GitHub: 'https://github.com/jupyterlab/lumino',
    Jupyter: 'https://jupyter.org'
  },
  titleLink: 'https://lumino.readthedocs.io/en/latest/',
  plugin: ['typedoc-plugin-resolve-crossmodule-references']
};
