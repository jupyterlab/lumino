import nodeResolve from '@rollup/plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';
import postcss from 'rollup-plugin-postcss';

export const globals = id =>
  id.indexOf('@lumino/') === 0 ? id.replace('@lumino/', 'lumino_') : id;

export function createRollupConfig(options) {
  const { pkg } = options;
  return {
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
  };
}
