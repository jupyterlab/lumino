import nodeResolve from '@rollup/plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';
import postcss from 'rollup-plugin-postcss';

const pkg = require('./package.json');

const globals = id =>
  id.indexOf('@lumino/') === 0 ? id.replace('@lumino/', 'lumino_') : id;

const external = id =>
  (pkg.dependencies && !!pkg.dependencies[id]) ||
  (pkg.peerDependencies && !!pkg.peerDependencies[id]);

const plugins = [
  nodeResolve({
    preferBuiltins: true
  }),
  sourcemaps(),
  postcss({
    extensions: ['.css'],
    minimize: true
  })
];

export default [
  {
    input: 'lib/index',
    external,
    output: [
      {
        file: pkg.browser,
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
    plugins
  },
  {
    input: 'lib/index.node',
    external,
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
        globals: globals,
        name: pkg.name
      },
      {
        file: pkg['module-node'] + '.js',
        format: 'es',
        sourcemap: true,
        globals: globals
      }
    ],
    plugins
  }
];
