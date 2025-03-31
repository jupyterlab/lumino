/*
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */

import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import sourcemaps from 'rollup-plugin-sourcemaps';

export function createRollupTestConfig(options) {
  return {
    input: './lib/index.spec.js',
    output: {
      file: './lib/bundle.test.js',
      sourcemap: true
    },
    plugins: [commonjs(), nodeResolve(), sourcemaps()]
  };
}
