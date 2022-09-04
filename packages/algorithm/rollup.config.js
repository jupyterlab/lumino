/*
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */

import { createRollupConfig } from '../../rollup.src.config';

const pkg = require('./package.json');
const config = createRollupConfig({ pkg });

export default config;
