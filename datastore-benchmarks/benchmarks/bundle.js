
import { setBenchmarkResult } from './utils.js'

if (typeof global !== 'undefined') {
  const fs = require('fs')
  const yjsBundleSize = fs.statSync(__dirname + '/../dist/bundleYjs.js').size
  const automergeBundleSize = fs.statSync(__dirname + '/../dist/bundleAutomerge.js').size
  const yjsGzBundleSize = fs.statSync(__dirname + '/../dist/bundleYjs.js.gz').size
  const automergeGzBundleSize = fs.statSync(__dirname + '/../dist/bundleAutomerge.js.gz').size
  setBenchmarkResult('yjs', 'Bundle size', `${yjsBundleSize} bytes`)
  setBenchmarkResult('automerge', 'Bundle size', `${automergeBundleSize} bytes`)
  setBenchmarkResult('yjs', 'Bundle size (gzipped)', `${yjsGzBundleSize} bytes`)
  setBenchmarkResult('automerge', 'Bundle size (gzipped)', `${automergeGzBundleSize} bytes`)
}