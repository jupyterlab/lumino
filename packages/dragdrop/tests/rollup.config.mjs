/*
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */
import styles from 'rollup-plugin-styles';
import { createRollupTestConfig } from '@lumino/buildutils';

const rollupConfig = createRollupTestConfig();
rollupConfig.plugins.unshift(styles());

export default rollupConfig;
