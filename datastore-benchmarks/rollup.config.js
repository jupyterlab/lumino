import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

const terserPlugin = terser({
  module: true,
  compress: {
    hoist_vars: true,
    module: true,
    passes: 1,
    pure_getters: true,
    unsafe_comps: true,
    unsafe_undefined: true
  },
  mangle: {
    toplevel: true
  }
})

export default [{
  input: './benchmarks/run.js',
  output: {
    file: './dist/benchmark.js',
    format: 'iife',
    sourcemap: true
  },
  plugins: [
    nodeResolve({
      sourcemap: true,
      mainFields: ['module', 'main']
    }),
    commonjs()
  ]
}, {
  input: './benchmarks/bundleYjs.js',
  output: {
    file: './dist/bundleYjs.js',
    format: 'es',
    sourcemap: true
  },
  plugins: [
    nodeResolve({
      sourcemap: true,
      mainFields: ['module', 'main']
    }),
    commonjs(),
    terserPlugin
  ]
}, {
  input: './benchmarks/bundleAutomerge.js',
  output: {
    file: './dist/bundleAutomerge.js',
    format: 'es',
    sourcemap: true
  },
  plugins: [
    nodeResolve({
      sourcemap: true,
      mainFields: ['module', 'main']
    }),
    commonjs(),
    terserPlugin
  ]
}]
