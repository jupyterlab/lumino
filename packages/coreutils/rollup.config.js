/*
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */

import { createRollupConfig } from '../../rollup.src.config';

const pkg = require('./package.json');
const external = id =>
  (pkg.dependencies && !!pkg.dependencies[id]) ||
  (pkg.peerDependencies && !!pkg.peerDependencies[id]);

const browserConfig = { ...createRollupConfig({ pkg }), external };
browserConfig.output[0].file = pkg.browser;

const nodeConfig = { ...createRollupConfig({ pkg }), external };
nodeConfig.input = 'lib/index.node';
nodeConfig.output[0].file = pkg.main;
nodeConfig.output[0].format = 'cjs';
nodeConfig.output[1].file = pkg['module-node'] + '.js';
nodeConfig.output[1].globals = nodeConfig.output[0].globals;
delete nodeConfig.output[1].name;

const config = [browserConfig, nodeConfig];

export default config;
