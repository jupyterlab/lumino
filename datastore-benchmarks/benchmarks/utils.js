
import * as prng from 'lib0/prng.js'

export const N = 6000
export const disableAutomergeBenchmarks = false

export const benchmarkResults = {}

export const setBenchmarkResult = (libname, benchmarkid, result) => {
  const libResults = benchmarkResults[benchmarkid] || (benchmarkResults[benchmarkid] = {})
  libResults[libname] = result
}

const perf = typeof performance === 'undefined' ? require('perf_hooks').performance : performance // eslint-disable-line no-undef

export const benchmarkTime = (libname, id, f) => {
  const start = perf.now()
  f()
  const time = perf.now() - start
  console.log(libname, id, `${time.toFixed(2)} ms`)
  setBenchmarkResult(libname, id, `${time.toFixed(0)} ms`)
}

export const gen = prng.create(42)

export const cpy = o => JSON.parse(JSON.stringify(o))
