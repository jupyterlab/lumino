/*
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */
import styles from 'rollup-plugin-styles';
import { createRollupConfig } from '../../../rollup.tests.config';

const rollupConfig = createRollupConfig();
rollupConfig.plugins.unshift(styles());

export default rollupConfig;
