import {
    Signal
  } from '@lumino/signaling';


/**
 * An in-memory implementation of a patch store.
 */
class InMemoryServerAdapter {
    constructor() {
      this.onRemoteTransaction = null;
      this.onUndo = null;
      this.onRedo = null;
      this.transactions = {};
      this.isDisposed = false;
    }
  
    broadcast(transaction) {
      this.transactions[transaction.id] = transaction;
    }
  
    undo(id) {
      if (this.onUndo) {
        this.onUndo(this.transactions[id]);
      }
      return Promise.resolve(undefined);
    }
  
    redo(id) {
      if (this.onRedo) {
        this.onRedo(this.transactions[id]);
      }
      return Promise.resolve(undefined);
    }
  
    dispose() {
      if (this.isDisposed) {
        return;
      }
      this.isDisposed = true;
      Signal.clearData(this);
    }
  
  }

  export default InMemoryServerAdapter;