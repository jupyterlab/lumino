/*
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */

import nodeResolve from '@rollup/plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';
import postcss from 'rollup-plugin-postcss';

const pkg = require('./package.json');

const globals = id =>
  id.indexOf('@lumino/') === 0 ? id.replace('@lumino/', 'lumino_') : id;

export default [
  {
    input: 'lib/index',
    external: id => pkg.dependencies && !!pkg.dependencies[id],
    output: [
      {
        file: pkg.main,
        globals,
        format: 'umd',
        sourcemap: true,
        name: pkg.name
      },
      {
        file: pkg.module + '.js',
        format: 'es',
        sourcemap: true,
        name: pkg.name
      }
    ],
    plugins: [
      nodeResolve({
        preferBuiltins: true
      }),
      sourcemaps(),
      postcss({
        extensions: ['.css'],
        minimize: true
      })
    ]
  }
];
