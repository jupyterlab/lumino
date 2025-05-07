// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { expect } from 'chai';

import WebSocket from 'ws';

import { SocketStream } from '@lumino/polling';

describe('SocketStream', () => {
  let stream: SocketStream<unknown, unknown>;

  afterEach(() => {
    stream.dispose();
  });

  describe('#constructor()', () => {
    it('should create a socket stream', () => {
      const url = 'https://www.example.com/';
      stream = new SocketStream(null, () => new WebSocket(url) as any);
      expect(stream).to.be.an.instanceof(SocketStream);
    });
  });
});
