import nodeResolve from '@rollup/plugin-node-resolve';
import styles from 'rollup-plugin-styles';

export default {
  input: './build/index.js',
  output: {
    file: './build/bundle.example.js',
    format: 'iife',
    sourcemap: true
  },
  plugins: [styles(), nodeResolve()]
};
