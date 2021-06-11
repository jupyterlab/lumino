import './bundle.js'
import './b1.js'
import './b2.js'
import './b3.js'
import { benchmarkResults, N } from './utils.js'

// print markdown table with the results
let mdTable = `| N = ${N} | Yjs | lumino | automerge |\n`
mdTable += '| :- | -: | -: | -: |\n'
for (const id in benchmarkResults) {
  mdTable += `|${id.padEnd(73, ' ')} | ${(benchmarkResults[id]['yjs'] || '').padStart(15, ' ')} | ${(benchmarkResults[id]['lumino'] || '').padStart(15, ' ')} | ${(benchmarkResults[id]['automerge'] || '').padStart(15, ' ')} |\n`
}
console.log(mdTable)
