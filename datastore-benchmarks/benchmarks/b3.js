
import * as Y from 'yjs'
import { setBenchmarkResult, benchmarkTime, N, disableAutomergeBenchmarks } from './utils.js'
import * as t from 'lib0/testing.js'
import * as math from 'lib0/math.js'
import Automerge from 'automerge'

import InMemoryServerAdapter from './inmemoryserveradapter'
import transactionSize from './transactionsize'

import {
  Datastore,
  Fields
} from '@lumino/datastore';

const sqrtN = math.floor(Math.sqrt(N))

const benchmarkYjs = (id, changeDoc, check) => {
  const docs = []
  const updates = []
  for (let i = 0; i < sqrtN; i++) {
    const doc = new Y.Doc()
    doc.on('update', (update, origin) => {
      if (origin !== 'remote') {
        updates.push(update)
      }
    })
    docs.push(doc)
  }
  for (let i = 0; i < docs.length; i++) {
    changeDoc(docs[i], i)
  }
  // sync client 0 for reference
  for (let i = 0; i < updates.length; i++) {
    Y.applyUpdate(docs[0], updates[i], 'remote')
  }
  benchmarkTime('yjs', `${id} (time)`, () => {
    for (let i = 0; i < updates.length; i++) {
      Y.applyUpdate(docs[1], updates[i], 'remote')
    }
  })
  t.assert(updates.length === sqrtN)
  check(docs.slice(0, 2))
  setBenchmarkResult('yjs', `${id} (updateSize)`, `${updates.reduce((len, update) => len + update.byteLength, 0)} bytes`)
  const encodedState = Y.encodeStateAsUpdate(docs[0])
  const documentSize = encodedState.byteLength
  setBenchmarkResult('yjs', `${id} (docSize)`, `${documentSize} bytes`)
  benchmarkTime('yjs', `${id} (parseTime)`, () => {
    const doc = new Y.Doc()
    Y.applyUpdate(doc, encodedState)
  })
}

const benchmarkAutomerge = (id, init, changeDoc, check) => {
  if (N > 5000 || disableAutomergeBenchmarks) {
    setBenchmarkResult('automerge', id, 'skipping')
    return
  }
  const docs = []
  for (let i = 0; i < sqrtN; i++) {
    docs.push(Automerge.init())
  }
  const initDoc = Automerge.change(docs[0], init)
  const initUpdate = JSON.stringify(Automerge.getChanges(docs[0], initDoc))
  for (let i = 0; i < docs.length; i++) {
    docs[i] = Automerge.applyChanges(docs[i], JSON.parse(initUpdate))
  }
  const updates = []
  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i]
    const updatedDoc = Automerge.change(doc, d => { changeDoc(d, i) })
    const update = JSON.stringify(Automerge.getChanges(doc, updatedDoc))
    updates.push(update)
    docs[i] = updatedDoc
  }
  for (let i = 0; i < updates.length; i++) {
    docs[0] = Automerge.applyChanges(docs[0], JSON.parse(updates[i]))
  }
  benchmarkTime('automerge', `${id} (time)`, () => {
    for (let i = 0; i < updates.length; i++) {
      docs[1] = Automerge.applyChanges(docs[1], JSON.parse(updates[i]))
    }
  })
  check(docs.slice(0, 2))
  setBenchmarkResult('automerge', `${id} (updateSize)`, `${updates.reduce((len, update) => len + update.length, 0)} bytes`)
  const encodedState = Automerge.save(docs[0])
  const documentSize = encodedState.length
  setBenchmarkResult('automerge', `${id} (docSize)`, `${documentSize} bytes`)
  benchmarkTime('automerge', `${id} (parseTime)`, () => {
    Automerge.load(encodedState)
  })
}

const benchmarkLumino = (id, changeDoc, check) => {
  const stores = []
  const adapters = []
  const tables = []
  const updates = []
  let schema = {
    id: 'test-schema',
    fields: {
      map: Fields.Map(),
      array: Fields.List()
    }
  }
  for (let i = 0; i < sqrtN; i++) {
    const adapter = new InMemoryServerAdapter()
    const store = Datastore.create({
      id: i,
      schemas: [schema],
      adapter: adapter
    });
    store.changed.connect((_, change) => {
      if (store.id === change.storeId) {
        updates.push(adapter.transactions[change.transactionId])
      }
    })
    adapters.push(adapter)
    stores.push(store)
    tables.push(store.get('test-schema'))
  }
  for (let i = 0; i < tables.length; i++) {
    stores[i].beginTransaction()
    changeDoc(tables[i], i)
    stores[i].endTransaction()
  }
  // sync client 0 for reference
  for (let i = 0; i < updates.length; i++) {
    if (adapters[0].onRemoteTransaction) {
      adapters[0].onRemoteTransaction(updates[i])
    }
  }
  benchmarkTime('lumino', `${id} (time)`, () => {
    for (let i = 0; i < updates.length; i++) {
      for (let i = 0; i < updates.length; i++) {
        if (adapters[1].onRemoteTransaction) {
          adapters[1].onRemoteTransaction(updates[i])
        }
      }
    }
  })
  t.assert(updates.length === sqrtN)
  check(tables.slice(0, 2))
  setBenchmarkResult('lumino', `${id} (updateSize)`, `${updates.reduce((len, update) => len + transactionSize(update), 0)} bytes`)
  let adapter3 = new InMemoryServerAdapter()
  let store3 = Datastore.create({
    id: 10000000,
    schemas: [schema],
    adapter: adapter3
  });
  let documentSize = 0
  for (let id in adapters[0].transactions) {
    documentSize += transactionSize(adapters[0].transactions[id])
  }
  setBenchmarkResult('lumino', `${id} (docSize)`, `${documentSize} bytes`)
  benchmarkTime('lumino', `${id} (parseTime)`, () => {
    for (let i = 0; i < updates.length; i++) {
      if (adapter3.onRemoteTransaction) {
        adapter3.onRemoteTransaction(updates[i])
      }
    }
  })
  for (let i = 0; i < sqrtN; i++) {
    stores[i].dispose()
    adapters[i].dispose()
  }
}

{
  const benchmarkName = '[B3.1] √N clients concurrently set number in Map'
  benchmarkYjs(
    benchmarkName,
    (doc, i) => doc.getMap('map').set('v', i),
    docs => {
      const v = docs[0].getMap('map').get('v')
      docs.forEach(doc => {
        t.assert(doc.getMap('map').get('v') === v)
      })
    }
  )
  benchmarkAutomerge(
    benchmarkName,
    doc => {},
    (doc, i) => { doc.v = i },
    docs => {
      const v = docs[0].v
      docs.forEach(doc => {
        t.assert(doc.v === v)
      })
    }
  )
  benchmarkLumino(
    benchmarkName,
    (table, i) => {
      table.update({
        'my-record': {
          map: {v: i}
        }
      })
    },
    tables => {
      const v = tables[0].get('my-record').map.v
      tables.forEach(table => {
        t.assert(table.get('my-record').map.v === v)
      })
    }
  )
}

{
  const benchmarkName = '[B3.2] √N clients concurrently set Object in Map'
  // each client sets a user data object { name: id, address: 'here' }
  benchmarkYjs(
    benchmarkName,
    (doc, i) => {
      const v = new Y.Map()
      v.set('name', i.toString())
      v.set('address', 'here')
      doc.getMap('map').set('v', v)
    },
    docs => {
      const v = docs[0].getMap('map').get('v').get('name')
      docs.forEach(doc => {
        t.assert(doc.getMap('map').get('v').get('name') === v)
      })
    }
  )
  benchmarkAutomerge(
    benchmarkName,
    doc => {},
    (doc, i) => { doc.v = { name: i.toString(), address: 'here' } },
    docs => {
      const v = docs[0].v.name
      docs.forEach(doc => {
        t.assert(doc.v.name === v)
      })
    }
  )
  benchmarkLumino(
    benchmarkName,
    (table, i) => {
      table.update({
        'my-record': {
          map: {v: {name: i.toString(), address: 'here'}}
        }
      })
    },
    tables => {
      const v = tables[0].get('my-record').map.v.name
      tables.forEach(table => {
        t.assert(table.get('my-record').map.v.name === v)
      })
    }
  )
}

{
  const benchmarkName = '[B3.3] √N clients concurrently set String in Map'
  benchmarkYjs(
    benchmarkName,
    (doc, i) => {
      doc.getMap('map').set('v', i.toString().repeat(sqrtN))
    },
    docs => {
      const v = docs[0].getMap('map').get('v')
      docs.forEach(doc => {
        t.assert(doc.getMap('map').get('v') === v)
      })
    }
  )
  benchmarkAutomerge(
    benchmarkName,
    doc => {},
    (doc, i) => { doc.v = i.toString().repeat(sqrtN) },
    docs => {
      const v = docs[0].v
      docs.forEach(doc => {
        t.assert(doc.v === v)
      })
    }
  )
  benchmarkLumino(
    benchmarkName,
    (table, i) => {
      table.update({
        'my-record': {
          map: {v: i.toString().repeat(sqrtN)}
        }
      })
    },
    tables => {
      const v = tables[0].get('my-record').map.v
      tables.forEach(table => {
        t.assert(table.get('my-record').map.v === v)
      })
    }
  )
}

{
  const benchmarkName = '[B3.4] √N clients concurrently insert text in Array'
  benchmarkYjs(
    benchmarkName,
    (doc, i) => {
      doc.getArray('array').insert(0, [i.toString()])
    },
    docs => {
      const len = docs[0].getArray('array').length
      docs.forEach(doc => {
        t.assert(doc.getArray('array').length === len)
      })
    }
  )
  benchmarkAutomerge(
    benchmarkName,
    doc => { doc.array = [] },
    (doc, i) => { doc.array.insertAt(0, i.toString()) },
    docs => {
      const len = docs[0].array.length
      docs.forEach(doc => {
        t.assert(doc.array.length === len)
      })
    }
  )
  benchmarkLumino(
    benchmarkName,
    (table, i) => {
      table.update({
        'my-record': {
          array: { index: 0, remove: 0, values: [i.toString()]}
        }
      })
    },
    tables => {
      const len = tables[0].get('my-record').array.length
      tables.forEach(table => {
        t.assert(table.get('my-record').array.length === len)
      })
    }
  )
}
