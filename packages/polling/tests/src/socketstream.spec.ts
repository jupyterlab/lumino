// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { expect } from 'chai';

import { WebSocket } from 'mock-socket';

import { IPoll, SocketStream } from '@lumino/polling';

window.WebSocket = WebSocket;

/**
 * Return a promise that resolves in the given milliseconds with the given value.
 */
function sleep<T>(milliseconds: number = 0, value?: T): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(value);
    }, milliseconds);
  });
}

class TestSocketStream<T, U> extends SocketStream<T, U> {
  constructor(sender: T, connector: () => WebSocket) {
    super(sender, connector);
    this.subscription.ticked.connect((_, state) => {
      this.phases.push(state.phase);
    });
  }
  phases: IPoll.Phase<'standby'>[] = [];
}

describe('SocketStream', () => {
  let stream: TestSocketStream<unknown, unknown>;

  afterEach(() => {
    stream.dispose();
  });

  describe('#constructor()', () => {
    it('should create a socket stream', () => {
      const url = 'https://www.example.com/';
      stream = new TestSocketStream(null, () => new WebSocket(url));
      expect(stream).to.be.an.instanceof(SocketStream);
    });
  });

  describe('#dispose()', () => {
    it('should clean up after itself upon dispose', async () => {
      const url = 'https://www.example.com/';
      stream = new TestSocketStream(null, () => new WebSocket(url));
      await sleep(500);
      stream.dispose();
      expect(stream.phases[0]).to.equal('started');
      stream.phases.slice(1).every(phase => expect(phase).to.equal('rejected'));
    });
  });
});
