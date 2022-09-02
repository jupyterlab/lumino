import nodeResolve from '@rollup/plugin-node-resolve';
import styles from 'rollup-plugin-styles';
import { globals } from './rollup.src.config';

export function createRollupConfig(options) {
  return {
    input: './build/index.js',
    output: {
      file: './build/bundle.example.js',
      format: 'iife',
      globals,
      sourcemap: true
    },
    plugins: [styles(), nodeResolve()]
  };
}
