
import * as Y from 'yjs'
import { setBenchmarkResult, gen, N, benchmarkTime, disableAutomergeBenchmarks } from './utils.js'
import * as prng from 'lib0/prng.js'
import * as math from 'lib0/math.js'
import * as t from 'lib0/testing.js'
import Automerge from 'automerge'

import InMemoryServerAdapter from './inmemoryserveradapter'
import transactionSize from './transactionsize'

import {
  Datastore,
  Fields
} from '@lumino/datastore';


const benchmarkYjs = (id, inputData, changeFunction, check) => {
  const doc1 = new Y.Doc()
  const doc2 = new Y.Doc()
  let updateSize = 0
  doc1.on('update', update => {
    updateSize += update.byteLength
    Y.applyUpdate(doc2, update, benchmarkYjs)
  })
  benchmarkTime('yjs', `${id} (time)`, () => {
    for (let i = 0; i < inputData.length; i++) {
      changeFunction(doc1, inputData[i], i)
    }
  })
  check(doc1, doc2)
  setBenchmarkResult('yjs', `${id} (avgUpdateSize)`, `${math.round(updateSize / inputData.length)} bytes`)
  const encodedState = Y.encodeStateAsUpdate(doc1)
  const documentSize = encodedState.byteLength
  setBenchmarkResult('yjs', `${id} (docSize)`, `${documentSize} bytes`)
  benchmarkTime('yjs', `${id} (parseTime)`, () => {
    const doc = new Y.Doc()
    Y.applyUpdate(doc, encodedState)
  })
}

const benchmarkAutomerge = (id, init, inputData, changeFunction, check) => {
  if (N > 5000 || disableAutomergeBenchmarks) {
    setBenchmarkResult('automerge', id, 'skipping')
    return
  }
  const emptyDoc = Automerge.init()
  let doc1 = Automerge.change(emptyDoc, init)
  let doc2 = Automerge.applyChanges(Automerge.init(), Automerge.getChanges(emptyDoc, doc1))
  let updateSize = 0
  benchmarkTime('automerge', `${id} (time)`, () => {
    for (let i = 0; i < inputData.length; i++) {
      const updatedDoc = Automerge.change(doc1, doc => {
        changeFunction(doc, inputData[i], i)
      })
      const update = JSON.stringify(Automerge.getChanges(doc1, updatedDoc))
      updateSize += update.length
      doc2 = Automerge.applyChanges(doc2, JSON.parse(update))
      doc1 = updatedDoc
    }
  })
  check(doc1, doc2)
  setBenchmarkResult('automerge', `${id} (avgUpdateSize)`, `${math.round(updateSize / inputData.length)} bytes`)
  const encodedState = Automerge.save(doc1)
  const documentSize = encodedState.length
  setBenchmarkResult('automerge', `${id} (docSize)`, `${documentSize} bytes`)
  benchmarkTime('automerge', `${id} (parseTime)`, () => {
    Automerge.load(encodedState)
  })
}

const benchmarkLumino = (id, inputData, changeFunction, check) => {
  let updateSize = 0
  let schema = {
    id: 'test-schema',
    fields: {
      text: Fields.Text(),
      numbers: Fields.List()
    }
  }
  let adapter1 = new InMemoryServerAdapter();
  let store1 = Datastore.create({
    id: 1234,
    schemas: [schema],
    adapter: adapter1
  });
  let adapter2 = new InMemoryServerAdapter();
  let store2 = Datastore.create({
    id: 5678,
    schemas: [schema],
    adapter: adapter2
  });
  store1.changed.connect((_, change) => {
    let t = adapter1.transactions[change.transactionId]
    if (adapter2.onRemoteTransaction) {
      adapter2.onRemoteTransaction(t)
    }
    updateSize += transactionSize(t)
  });
  let table1 = store1.get('test-schema');
  let table2 = store2.get('test-schema');

  benchmarkTime('lumino', `${id} (time)`, () => {
    for (let i = 0; i < inputData.length; i++) {
      store1.beginTransaction()
      changeFunction(table1, inputData[i], i)
      store1.endTransaction()
    }
  })
  check(table1, table2)
  setBenchmarkResult('lumino', `${id} (avgUpdateSize)`, `${math.round(updateSize / inputData.length)} bytes`)
  let adapter3 = new InMemoryServerAdapter()
  let store3 = Datastore.create({
    id: 9012,
    schemas: [schema],
    adapter: adapter3
  });
  let documentSize = 0
  for (let id in adapter1.transactions) {
    documentSize += transactionSize(adapter1.transactions[id])
  }
  setBenchmarkResult('lumino', `${id} (docSize)`, `${documentSize} bytes`)
  benchmarkTime('lumino', `${id} (parseTime)`, () => {
    for (let id in adapter1.transactions) {
      if (adapter3.onRemoteTransaction) {
        adapter3.onRemoteTransaction(adapter1.transactions[id])
      }
    }
  })
  store1.dispose()
  store2.dispose()
  store3.dispose()
  adapter1.dispose()
  adapter2.dispose()
  adapter3.dispose()
}

{
  const benchmarkName = '[B1.1] Append N characters'
  const string = prng.word(gen, N, N)
  benchmarkYjs(
    benchmarkName,
    string,
    (doc, s, i) => { doc.getText('text').insert(i, s) },
    (doc1, doc2) => {
      t.assert(doc1.getText('text').toString() === doc2.getText('text').toString())
      t.assert(doc1.getText('text').toString() === string)
    }
  )
  benchmarkAutomerge(
    benchmarkName,
    doc => { doc.text = new Automerge.Text() },
    string,
    (doc, s, i) => { doc.text.insertAt(i, s) },
    (doc1, doc2) => {
      t.assert(doc1.text.join('') === doc2.text.join(''))
      t.assert(doc1.text.join('') === string)
    }
  )
  benchmarkLumino(
    benchmarkName,
    string,
    (table1, s, i) => {
      table1.update({
        'my-record': {
          text: { index: i, remove: 0, text: s }
        }
      })
    },
    (table1, table2) => {
      t.assert(table1.get('my-record').text === table2.get('my-record').text)
      t.assert(table1.get('my-record').text === string)
    }
  )
}

{
  const benchmarkName = '[B1.2] Insert string of length N'
  const string = prng.word(gen, N, N)
  // B1.1: Insert text from left to right
  benchmarkYjs(
    benchmarkName,
    [string],
    (doc, s, i) => { doc.getText('text').insert(i, s) },
    (doc1, doc2) => {
      t.assert(doc1.getText('text').toString() === doc2.getText('text').toString())
      t.assert(doc1.getText('text').toString() === string)
    }
  )
  benchmarkAutomerge(
    benchmarkName,
    doc => { doc.text = new Automerge.Text() },
    [string],
    (doc, s, i) => { doc.text.insertAt(i, ...s) },
    (doc1, doc2) => {
      t.assert(doc1.text.join('') === doc2.text.join(''))
      t.assert(doc1.text.join('') === string)
    }
  )
  benchmarkLumino(
    benchmarkName,
    [string],
    (table1, s, i) => {
      table1.update({
        'my-record': {
          text: { index: i, remove: 0, text: s }
        }
      })
    },
    (table1, table2) => {
      t.assert(table1.get('my-record').text === table2.get('my-record').text)
      t.assert(table1.get('my-record').text === string)
    }
  )
}

{
  const benchmarkName = '[B1.3] Prepend N characters'
  const string = prng.word(gen, N, N)
  const reversedString = string.split('').reverse().join('')
  benchmarkYjs(
    benchmarkName,
    reversedString,
    (doc, s, i) => { doc.getText('text').insert(0, s) },
    (doc1, doc2) => {
      t.assert(doc1.getText('text').toString() === doc2.getText('text').toString())
      t.assert(doc1.getText('text').toString() === string)
    }
  )
  benchmarkAutomerge(
    benchmarkName,
    doc => { doc.text = new Automerge.Text() },
    reversedString,
    (doc, s, i) => { doc.text.insertAt(0, s) },
    (doc1, doc2) => {
      t.assert(doc1.text.join('') === doc2.text.join(''))
      t.assert(doc1.text.join('') === string)
    }
  )
  benchmarkLumino(
    benchmarkName,
    reversedString,
    (table1, s, i) => {
      table1.update({
        'my-record': {
          text: { index: 0, remove: 0, text: s }
        }
      })
    },
    (table1, table2) => {
      t.assert(table1.get('my-record').text === table2.get('my-record').text)
      t.assert(table1.get('my-record').text === string)
    }
  )
}

{
  const benchmarkName = '[B1.4] Insert N characters at random positions'
  // calculate random input
  let string = ''
  const input = []
  for (let i = 0; i < N; i++) {
    const index = prng.int31(gen, 0, string.length)
    const insert = prng.word(gen, 1, 1)
    string = string.slice(0, index) + insert + string.slice(index)
    input.push({ index, insert })
  }
  benchmarkYjs(
    benchmarkName,
    input,
    (doc, op, i) => { doc.getText('text').insert(op.index, op.insert) },
    (doc1, doc2) => {
      t.assert(doc1.getText('text').toString() === doc2.getText('text').toString())
      t.assert(doc1.getText('text').toString() === string)
    }
  )
  benchmarkAutomerge(
    benchmarkName,
    doc => { doc.text = new Automerge.Text() },
    input,
    (doc, op, i) => { doc.text.insertAt(op.index, op.insert) },
    (doc1, doc2) => {
      t.assert(doc1.text.join('') === doc2.text.join(''))
      t.assert(doc1.text.join('') === string)
    }
  )
  benchmarkLumino(
    benchmarkName,
    input,
    (table1, op, i) => {
      table1.update({
        'my-record': {
          text: { index: op.index, remove: 0, text: op.insert }
        }
      })
    },
    (table1, table2) => {
      t.assert(table1.get('my-record').text === table2.get('my-record').text)
      t.assert(table1.get('my-record').text === string)
    }
  )
}

{
  // This test simulates a real-word editing scenario.
  // Users often write a word, and then switch to a different next position.
  const benchmarkName = '[B1.5] Insert N words at random positions'
  // calculate random input
  let string = ''
  const input = []
  for (let i = 0; i < N; i++) {
    const index = prng.int31(gen, 0, string.length)
    const insert = prng.word(gen, 2, 10)
    string = string.slice(0, index) + insert + string.slice(index)
    input.push({ index, insert })
  }
  benchmarkYjs(
    benchmarkName,
    input,
    (doc, op, i) => { doc.getText('text').insert(op.index, op.insert) },
    (doc1, doc2) => {
      t.assert(doc1.getText('text').toString() === doc2.getText('text').toString())
      t.assert(doc1.getText('text').toString() === string)
    }
  )
  benchmarkAutomerge(
    benchmarkName,
    doc => { doc.text = new Automerge.Text() },
    input,
    (doc, op, i) => { doc.text.insertAt(op.index, ...op.insert) },
    (doc1, doc2) => {
      t.assert(doc1.text.join('') === doc2.text.join(''))
      t.assert(doc1.text.join('') === string)
    }
  )
  benchmarkLumino(
    benchmarkName,
    input,
    (table1, op, i) => {
      table1.update({
        'my-record': {
          text: { index: op.index, remove: 0, text: op.insert }
        }
      })
    },
    (table1, table2) => {
      t.assert(table1.get('my-record').text === table2.get('my-record').text)
      t.assert(table1.get('my-record').text === string)
    }
  )
}

{
  const benchmarkName = '[B1.6] Insert string, then delete it'
  const string = prng.word(gen, N, N)
  // B1.1: Insert text from left to right
  benchmarkYjs(
    benchmarkName,
    [string],
    (doc, s, i) => {
      doc.getText('text').insert(i, s)
      doc.getText('text').delete(i, s.length)
    },
    (doc1, doc2) => {
      t.assert(doc1.getText('text').toString() === doc2.getText('text').toString())
      t.assert(doc1.getText('text').toString() === '')
    }
  )
  benchmarkAutomerge(
    benchmarkName,
    doc => { doc.text = new Automerge.Text() },
    [string],
    (doc, s, i) => {
      doc.text.insertAt(i, ...s)
      doc.text.splice(i, s.length)
    },
    (doc1, doc2) => {
      t.assert(doc1.text.join('') === doc2.text.join(''))
      t.assert(doc1.text.join('') === '')
    }
  )
  benchmarkLumino(
    benchmarkName,
    [string],
    (table1, s, i) => {
      table1.update({
        'my-record': {
          text: { index: i, remove: 0, text: s }
        }
      })
      table1.update({
        'my-record': {
          text: { index: i, remove: s.length, text: '' }
        }
      })
    },
    (table1, table2) => {
      t.assert(table1.get('my-record').text === table2.get('my-record').text)
      t.assert(table1.get('my-record').text === '')
    }
  )
}

{
  const benchmarkName = '[B1.7] Insert/Delete strings at random positions'
  // calculate random input
  let string = ''
  const input = []
  for (let i = 0; i < N; i++) {
    const index = prng.int31(gen, 0, string.length)
    if (string.length === index || prng.bool(gen)) {
      const insert = prng.word(gen, 2, 10)
      string = string.slice(0, index) + insert + string.slice(index)
      input.push({ index, insert })
    } else {
      const deleteCount = prng.int31(gen, 1, math.min(9, string.length - index))
      string = string.slice(0, index) + string.slice(index + deleteCount)
      input.push({ index, deleteCount })
    }
  }
  benchmarkYjs(
    benchmarkName,
    input,
    (doc, op, i) => {
      if (op.insert !== undefined) {
        doc.getText('text').insert(op.index, op.insert)
      } else {
        doc.getText('text').delete(op.index, op.deleteCount)
      }
    },
    (doc1, doc2) => {
      t.assert(doc1.getText('text').toString() === doc2.getText('text').toString())
      t.assert(doc1.getText('text').toString() === string)
    }
  )
  benchmarkAutomerge(
    benchmarkName,
    doc => { doc.text = new Automerge.Text() },
    input,
    (doc, op, i) => {
      if (op.insert !== undefined) {
        doc.text.insertAt(op.index, ...op.insert)
      } else {
        doc.text.splice(op.index, op.deleteCount)
      }
    },
    (doc1, doc2) => {
      t.assert(doc1.text.join('') === doc2.text.join(''))
      t.assert(doc1.text.join('') === string)
    }
  )
  benchmarkLumino(
    benchmarkName,
    input,
    (table1, op, i) => {
      if (op.insert !== undefined) {
        table1.update({
          'my-record': {
            text: { index: op.index, remove: 0, text: op.insert }
          }
        })
      } else {
        table1.update({
          'my-record': {
            text: { index: op.index, remove: op.deleteCount, text: '' }
          }
        })
      }
    },
    (table1, table2) => {
      t.assert(table1.get('my-record').text === table2.get('my-record').text)
      t.assert(table1.get('my-record').text === string)
    }
  )
}

// // benchmarks with numbers begin here

{
  const benchmarkName = '[B1.8] Append N numbers'
  const numbers = Array.from({ length: N }).map(() => prng.uint32(gen, 0, 0x7fffffff))
  benchmarkYjs(
    benchmarkName,
    numbers,
    (doc, s, i) => { doc.getArray('numbers').insert(i, [s]) },
    (doc1, doc2) => {
      t.compare(doc1.getArray('numbers').toArray(), doc2.getArray('numbers').toArray())
      t.compare(doc1.getArray('numbers').toArray(), numbers)
    }
  )
  benchmarkAutomerge(
    benchmarkName,
    doc => { doc.array = [] },
    numbers,
    (doc, s, i) => { doc.array.insertAt(i, s) },
    (doc1, doc2) => {
      t.compare(Array.from(doc1.array), Array.from(doc2.array))
      t.compare(Array.from(doc1.array), numbers)
    }
  )
  benchmarkLumino(
    benchmarkName,
    numbers,
    (table1, s, i) => {
      table1.update({
        'my-record': {
          numbers: { index: i, remove: 0, values: Array.from([s]) }
        }
      })
    },
    (table1, table2) => {
      t.compare(table1.get('my-record').numbers, table2.get('my-record').numbers)
      t.compare(table1.get('my-record').numbers, numbers)
    }
  )
}

{
  const benchmarkName = '[B1.9] Insert Array of N numbers'
  const numbers = Array.from({ length: N }).map(() => prng.uint32(gen, 0, 0x7fffffff))
  benchmarkYjs(
    benchmarkName,
    [numbers],
    (doc, s, i) => { doc.getArray('numbers').insert(i, s) },
    (doc1, doc2) => {
      t.compare(doc1.getArray('numbers').toArray(), doc2.getArray('numbers').toArray())
      t.compare(doc1.getArray('numbers').toArray(), numbers)
    }
  )
  benchmarkAutomerge(
    benchmarkName,
    doc => { doc.array = [] },
    [numbers],
    (doc, s, i) => { doc.array.insertAt(i, ...s) },
    (doc1, doc2) => {
      t.compare(Array.from(doc1.array), Array.from(doc2.array))
      t.compare(Array.from(doc1.array), numbers)
    }
  )
  benchmarkLumino(
    benchmarkName,
    [numbers],
    (table1, s, i) => {
      table1.update({
        'my-record': {
          numbers: { index: i, remove: 0, values: s }
        }
      })
    },
    (table1, table2) => {
      t.compare(table1.get('my-record').numbers, table2.get('my-record').numbers)
      t.compare(table1.get('my-record').numbers, numbers)
    }
  )
}

{
  const benchmarkName = '[B1.10] Prepend N numbers'
  const numbers = Array.from({ length: N }).map(() => prng.uint32(gen, 0, 0x7fffffff))
  const numbersReversed = numbers.slice().reverse()

  benchmarkYjs(
    benchmarkName,
    numbers,
    (doc, s, i) => { doc.getArray('numbers').insert(0, [s]) },
    (doc1, doc2) => {
      t.compare(doc1.getArray('numbers').toArray(), doc2.getArray('numbers').toArray())
      t.compare(doc1.getArray('numbers').toArray(), numbersReversed)
    }
  )
  benchmarkAutomerge(
    benchmarkName,
    doc => { doc.array = [] },
    numbers,
    (doc, s, i) => { doc.array.insertAt(0, s) },
    (doc1, doc2) => {
      t.compare(Array.from(doc1.array), Array.from(doc2.array))
      t.compare(Array.from(doc1.array), numbersReversed)
    }
  )
  benchmarkLumino(
    benchmarkName,
    numbers,
    (table1, s, i) => {
      table1.update({
        'my-record': {
          numbers: { index: 0, remove: 0, values: [s] }
        }
      })
    },
    (table1, table2) => {
      t.compare(table1.get('my-record').numbers, table2.get('my-record').numbers)
      t.compare(table1.get('my-record').numbers, numbersReversed)
    }
  )
}

{
  const benchmarkName = '[B1.11] Insert N numbers at random positions'
  // calculate random input
  const numbers = []
  const input = []
  for (let i = 0; i < N; i++) {
    const index = prng.int31(gen, 0, numbers.length)
    const insert = prng.uint32(gen, 0, 0x7fffffff)
    numbers.splice(index, 0, insert)
    input.push({ index, insert })
  }

  benchmarkYjs(
    benchmarkName,
    input,
    (doc, op, i) => { doc.getArray('numbers').insert(op.index, [op.insert]) },
    (doc1, doc2) => {
      t.compare(doc1.getArray('numbers').toArray(), doc2.getArray('numbers').toArray())
      t.compare(doc1.getArray('numbers').toArray(), numbers)
    }
  )
  benchmarkAutomerge(
    benchmarkName,
    doc => { doc.array = [] },
    input,
    (doc, op, i) => { doc.array.insertAt(op.index, op.insert) },
    (doc1, doc2) => {
      t.compare(Array.from(doc1.array), Array.from(doc2.array))
      t.compare(Array.from(doc1.array), numbers)
    }
  )
  benchmarkLumino(
    benchmarkName,
    input,
    (table1, op, i) => {
      table1.update({
        'my-record': {
          numbers: { index: op.index, remove: 0, values: [op.insert] }
        }
      })
    },
    (table1, table2) => {
      t.compare(table1.get('my-record').numbers, table2.get('my-record').numbers)
      t.compare(table1.get('my-record').numbers, numbers)
    }
  )
}
