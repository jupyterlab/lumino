/*
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */

import { createRollupConfig } from '@lumino/buildutils';
import * as fs from 'fs';

const config = createRollupConfig({
  pkg: JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
});

export default config;
