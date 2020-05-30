
import * as Y from 'yjs'
import { setBenchmarkResult, gen, N, benchmarkTime, cpy, disableAutomergeBenchmarks } from './utils.js'
import * as prng from 'lib0/prng.js'
import * as math from 'lib0/math.js'
import * as t from 'lib0/testing.js'
import Automerge from 'automerge'

const initText = prng.word(gen, 100, 100)

const benchmarkYjs = (id, changeDoc1, changeDoc2, check) => {
  const doc1 = new Y.Doc()
  const doc2 = new Y.Doc()
  /**
   * @type {any}
   */
  let update1To2
  /**
   * @type {any}
   */
  let update2To1
  doc1.on('update', (update, origin) => {
    if (origin !== doc2) { // ignore if this message was received from doc2
      update1To2 = update
    }
  })
  doc2.on('update', (update, origin) => {
    if (origin !== doc1) {
      update2To1 = update
    }
  })
  doc1.getText('text').insert(0, initText)
  Y.applyUpdate(doc2, update1To2)
  benchmarkTime('yjs', `${id} (time)`, () => {
    doc1.transact(() => {
      changeDoc1(doc1)
    })
    doc2.transact(() => {
      changeDoc2(doc2)
    })
    Y.applyUpdate(doc1, update2To1, doc2)
    Y.applyUpdate(doc2, update1To2, doc1)
  })
  check(doc1, doc2)
  setBenchmarkResult('yjs', `${id} (updateSize)`, `${math.round(update1To2.byteLength + update2To1.byteLength)} bytes`)
  const encodedState = Y.encodeStateAsUpdate(doc1)
  const documentSize = encodedState.byteLength
  setBenchmarkResult('yjs', `${id} (docSize)`, `${documentSize} bytes`)
  benchmarkTime('yjs', `${id} (parseTime)`, () => {
    const doc = new Y.Doc()
    Y.applyUpdate(doc, encodedState)
  })
}

const benchmarkAutomerge = (id, changeDoc1, changeDoc2, check) => {
  if (N > 10000 || disableAutomergeBenchmarks) {
    setBenchmarkResult('automerge', id, 'skipping')
    return
  }
  const emptyDoc = Automerge.init()
  let doc1 = Automerge.change(emptyDoc, doc => {
    doc.text = new Automerge.Text()
    doc.text.insertAt(0, ...initText)
  })
  let doc2 = Automerge.applyChanges(Automerge.init(), cpy(Automerge.getChanges(emptyDoc, doc1)))
  let updateSize = 0
  benchmarkTime('automerge', `${id} (time)`, () => {
    const updatedDoc1 = Automerge.change(doc1, changeDoc1)
    const updatedDoc2 = Automerge.change(doc2, changeDoc2)
    const update2 = JSON.stringify(Automerge.getChanges(doc1, updatedDoc1))
    const update1 = JSON.stringify(Automerge.getChanges(doc2, updatedDoc2))
    updateSize += update1.length + update2.length
    doc2 = Automerge.applyChanges(updatedDoc2, JSON.parse(update2))
    doc1 = Automerge.applyChanges(updatedDoc1, JSON.parse(update1))
  })
  check(doc1, doc2)
  setBenchmarkResult('automerge', `${id} (updateSize)`, `${math.round(updateSize)} bytes`)
  const encodedState = Automerge.save(doc1)
  const documentSize = encodedState.length
  setBenchmarkResult('automerge', `${id} (docSize)`, `${documentSize} bytes`)
  benchmarkTime('automerge', `${id} (parseTime)`, () => {
    Automerge.load(encodedState)
  })
}

{
  const benchmarkName = '[B2.1] Cuncurrently insert string of length N at index 0'
  const string1 = prng.word(gen, N, N)
  const string2 = prng.word(gen, N, N)
  benchmarkYjs(
    benchmarkName,
    doc1 => { doc1.getText('text').insert(0, string1) },
    doc2 => { doc2.getText('text').insert(0, string2) },
    (doc1, doc2) => {
      t.assert(doc1.getText('text').toString() === doc2.getText('text').toString())
      t.assert(doc1.getText('text').toString().length === N * 2 + 100)
    }
  )
  benchmarkAutomerge(
    benchmarkName,
    doc1 => { doc1.text.insertAt(0, ...string1) },
    doc2 => { doc2.text.insertAt(0, ...string2) },
    (doc1, doc2) => {
      t.assert(doc1.text.join('') === doc2.text.join(''))
      t.assert(doc1.text.join('').length === N * 2 + 100)
    }
  )
}

{
  const benchmarkName = '[B2.2] Cuncurrently insert N characters at random positions'
  const genInput = () => {
    let str = initText
    const input = []
    for (let i = 0; i < N; i++) {
      const index = prng.int31(gen, 0, str.length)
      const insert = prng.word(gen, 1, 1)
      str = str.slice(0, index) + insert + str.slice(index)
      input.push({ index, insert })
    }
    return input
  }
  const input1 = genInput()
  const input2 = genInput()
  benchmarkYjs(
    benchmarkName,
    doc1 => {
      const ytext = doc1.getText('text')
      input1.forEach(({ index, insert }) => { ytext.insert(index, insert) })
    },
    doc2 => {
      const ytext = doc2.getText('text')
      input2.forEach(({ index, insert }) => { ytext.insert(index, insert) })
    },
    (doc1, doc2) => {
      t.assert(doc1.getText('text').toString() === doc2.getText('text').toString())
      t.assert(doc1.getText('text').toString().length === N * 2 + 100)
    }
  )
  benchmarkAutomerge(
    benchmarkName,
    doc1 => {
      input1.forEach(({ index, insert }) => { doc1.text.insertAt(index, ...insert) })
    },
    doc2 => {
      input2.forEach(({ index, insert }) => { doc2.text.insertAt(0, ...insert) })
    },
    (doc1, doc2) => {
      t.assert(doc1.text.join('') === doc2.text.join(''))
      t.assert(doc1.text.join('').length === N * 2 + 100)
    }
  )
}

{
  const benchmarkName = '[B2.3] Cuncurrently insert N words at random positions'
  const genInput = () => {
    let str = initText
    const input = []
    for (let i = 0; i < N; i++) {
      const index = prng.int31(gen, 0, str.length)
      const insert = prng.word(gen, 3, 9)
      str = str.slice(0, index) + insert + str.slice(index)
      input.push({ index, insert })
    }
    return input
  }
  const input1 = genInput()
  const input2 = genInput()
  benchmarkYjs(
    benchmarkName,
    doc1 => {
      const ytext = doc1.getText('text')
      input1.forEach(({ index, insert }) => { ytext.insert(index, insert) })
    },
    doc2 => {
      const ytext = doc2.getText('text')
      input2.forEach(({ index, insert }) => { ytext.insert(index, insert) })
    },
    (doc1, doc2) => {
      t.assert(doc1.getText('text').toString() === doc2.getText('text').toString())
    }
  )
  benchmarkAutomerge(
    benchmarkName,
    doc1 => {
      input1.forEach(({ index, insert }) => { doc1.text.insertAt(index, ...insert) })
    },
    doc2 => {
      input2.forEach(({ index, insert }) => { doc2.text.insertAt(0, ...insert) })
    },
    (doc1, doc2) => {
      t.assert(doc1.text.join('') === doc2.text.join(''))
    }
  )
}

{
  const benchmarkName = '[B2.4] Cuncurrently insert & delete'
  const genInput = () => {
    let str = initText
    const input = []
    for (let i = 0; i < N; i++) {
      const index = prng.int31(gen, 0, str.length)
      const insert = prng.word(gen, 3, 9)
      str = str.slice(0, index) + insert + str.slice(index)
      input.push({ index, insert })
      if (str.length === index || prng.bool(gen)) {
        const insert = prng.word(gen, 2, 10)
        str = str.slice(0, index) + insert + str.slice(index)
        input.push({ index, insert })
      } else {
        const deleteCount = prng.int31(gen, 1, math.min(9, str.length - index))
        str = str.slice(0, index) + str.slice(index + deleteCount)
        input.push({ index, deleteCount })
      }
    }
    return input
  }
  const input1 = genInput()
  const input2 = genInput()
  benchmarkYjs(
    benchmarkName,
    doc1 => {
      const ytext = doc1.getText('text')
      input1.forEach(({ index, insert, deleteCount }) => {
        if (insert !== undefined) {
          ytext.insert(index, insert)
        } else {
          ytext.delete(index, deleteCount)
        }
      })
    },
    doc2 => {
      const ytext = doc2.getText('text')
      input2.forEach(({ index, insert, deleteCount }) => {
        if (insert !== undefined) {
          ytext.insert(index, insert)
        } else {
          ytext.delete(index, deleteCount)
        }
      })
    },
    (doc1, doc2) => {
      t.assert(doc1.getText('text').toString() === doc2.getText('text').toString())
    }
  )
  benchmarkAutomerge(
    benchmarkName,
    doc1 => {
      input1.forEach(({ index, insert, deleteCount }) => {
        if (insert !== undefined) {
          doc1.text.insertAt(index, ...insert)
        } else {
          doc1.text.splice(index, deleteCount)
        }
      })
    },
    doc2 => {
      input2.forEach(({ index, insert, deleteCount }) => {
        if (insert !== undefined) {
          doc2.text.insertAt(index, ...insert)
        } else {
          doc2.text.splice(index, deleteCount)
        }
      })
    },
    (doc1, doc2) => {
      t.assert(doc1.text.join('') === doc2.text.join(''))
    }
  )
}
