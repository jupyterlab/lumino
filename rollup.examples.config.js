import nodeResolve from '@rollup/plugin-node-resolve';
import styles from 'rollup-plugin-styles';

const globals = id =>
  id.indexOf('@lumino/') === 0 ? id.replace('@lumino/', 'lumino_') : id;

export default {
  input: './build/index.js',
  output: {
    file: './build/bundle.example.js',
    format: 'iife',
    globals,
    sourcemap: true
  },
  plugins: [styles(), nodeResolve()]
};
