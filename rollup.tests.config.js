import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export function createRollupConfig(options) {
  return {
    input: './lib/index.spec.js',
    output: {
      file: './lib/bundle.test.js'
    },
    plugins: [commonjs(), nodeResolve()]
  };
}
