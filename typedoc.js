/*
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */

module.exports = {
  entryPoints: [
    'packages/algorithm/src/index.ts',
    'packages/application/src/index.ts',
    'packages/collections/src/index.ts',
    'packages/commands/src/index.ts',
    'packages/coreutils/src/index.ts',
    'packages/datagrid/src/index.ts',
    'packages/disposable/src/index.ts',
    'packages/domutils/src/index.ts',
    'packages/dragdrop/src/index.ts',
    'packages/keyboard/src/index.ts',
    'packages/messaging/src/index.ts',
    'packages/polling/src/index.ts',
    'packages/properties/src/index.ts',
    'packages/signaling/src/index.ts',
    'packages/virtualdom/src/index.ts',
    'packages/widgets/src/index.ts'
  ],
  exclude: [
    'buildutils',
    'examples/**',
    '**/tests/**',
    'packages/default-theme'
  ],
  includeVersion: true,
  name: '@lumino',
  out: 'docs/source/api',
  readme: 'README.md',
  navigationLinks: {
    GitHub: 'https://github.com/jupyterlab/lumino',
    Jupyter: 'https://jupyter.org'
  },
  titleLink: 'https://lumino.readthedocs.io/en/latest/',
  plugin: ['typedoc-plugin-mdn-links'],
  tsconfig: 'tsconfig.docs.json'
};
