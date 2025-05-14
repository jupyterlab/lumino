// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { expect } from 'chai';

import { Server, WebSocket } from 'mock-socket';

import { IPoll, SocketStream } from '@lumino/polling';

/**
 * Returns a promise that resolves to `value` after `milliseconds` elapse.
 */
const sleep = (milliseconds: number = 0, value?: unknown): Promise<unknown> =>
  new Promise(resolve => void setTimeout(() => resolve(value), milliseconds));

class TestSocketStream<T, U> extends SocketStream<T, U> {
  constructor(sender: T, connector: () => WebSocket) {
    super(sender, connector);
    this.connection.ticked.connect((_, state) => {
      this.phases.push(state.phase);
    });
    void this.collect();
  }

  async collect() {
    for await (const message of this) {
      this.messages.push(message);
    }
  }

  messages: U[] = [];
  phases: IPoll.Phase<any>[] = [];
}

describe('SocketStream', () => {
  const url = 'ws://localhost:8888';
  let server: Server;
  let stream: TestSocketStream<unknown, unknown>;

  before(async () => {
    server = new Server(url);
  });

  afterEach(() => {
    stream.dispose();
  });

  after(async () => new Promise<void>(resolve => server.stop(() => resolve())));

  describe('#constructor()', () => {
    it('should create a socket stream', () => {
      stream = new TestSocketStream(null, () => new WebSocket(url));
      expect(stream).to.be.an.instanceof(SocketStream);
    });
  });

  describe('#dispose()', () => {
    it('should clean up after itself upon dispose', async () => {
      stream = new TestSocketStream(null, () => new WebSocket(url));
      stream.dispose();
      expect(stream.isDisposed).to.equal(true);
    });
  });

  describe('[Symbol.asyncIterator]', () => {
    it('should receive socket messages', async () => {
      stream = new TestSocketStream(null, () => new WebSocket(url));
      server.on('connection', socket => {
        socket.send('{ "alpha": 1 }');
        socket.send('{ "bravo": 2 }');
      });
      await sleep(250);
      expect(stream.messages).to.eql([{ alpha: 1 }, { bravo: 2 }]);
    });
  });
});
