// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { expect } from 'chai';

import { Debouncer, Throttler } from '@lumino/polling';

describe('Debouncer', () => {
  let debouncer: Debouncer;

  afterEach(() => {
    debouncer.dispose();
  });

  describe('#constructor()', () => {
    it('should create a debouncer', () => {
      debouncer = new Debouncer(async () => undefined);
      expect(debouncer).to.be.an.instanceof(Debouncer);
    });
  });

  describe('#invoke()', () => {
    it('should invoke and debounce a function', async () => {
      let counter = 0;
      debouncer = new Debouncer(() => counter++);
      expect(counter).to.equal(0);
      await debouncer.invoke();
      expect(counter).to.equal(1);
      void debouncer.invoke();
      void debouncer.invoke();
      void debouncer.invoke();
      await debouncer.invoke();
      expect(counter).to.equal(2);
    });
  });

});

describe('Throttler', () => {
  let throttler: Throttler;

  afterEach(() => {
    throttler.dispose();
  });

  describe('#constructor()', () => {
    it('should create a debouncer', () => {
      throttler = new Throttler(async () => undefined);
      expect(throttler).to.be.an.instanceof(Throttler);
    });
  });

});
