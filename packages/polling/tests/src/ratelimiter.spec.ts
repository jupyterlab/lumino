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
  const limit = 500;
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

  describe('#invoke()', () => {
    it('should invoke and throttle a function', async () => {
      let counter = 0;
      throttler = new Throttler(() => counter++);
      expect(counter).to.equal(0);
      await throttler.invoke();
      expect(counter).to.equal(1);
      void throttler.invoke();
      void throttler.invoke();
      void throttler.invoke();
      await throttler.invoke();
      expect(counter).to.equal(2);
    });

    it('should collapse invocations into one promise per cycle', async () => {
      throttler = new Throttler(() => undefined, limit);
      const first = throttler.invoke();
      const second = throttler.invoke();
      const third = throttler.invoke();
      const fourth = throttler.invoke();
      const fifth = throttler.invoke();

      await fifth;

      const sixth = throttler.invoke();
      const seventh = throttler.invoke();

      expect(first).to.equal(second, 'first === second');
      expect(first).to.equal(third, 'first === third');
      expect(first).to.equal(fourth, 'first === fourth');
      expect(first).to.equal(fifth, 'first === fifth');
      expect(fifth).not.to.equal(sixth, 'fifth !== sixth');
      expect(sixth).to.equal(seventh, 'sixth === seventh');
    });

    it('should default to the `leading` edge of cycle', async () => {
      const started = (new Date()).getTime();
      let invoked = 0;

      throttler = new Throttler(() => {
        invoked = (new Date()).getTime();
        expect(invoked - started).to.be.lessThan(limit);
      }, limit);

      void throttler.invoke();
      void throttler.invoke();
      void throttler.invoke();
      void throttler.invoke();
      await throttler.invoke();
    });

    it('should support the `leading` edge of cycle', async () => {
      const edge = 'leading';
      const started = (new Date()).getTime();
      let invoked = 0;

      throttler = new Throttler(() => {
        invoked = (new Date()).getTime();
        expect(invoked - started).to.be.lessThan(limit);
      }, { edge, limit });

      void throttler.invoke();
      void throttler.invoke();
      void throttler.invoke();
      void throttler.invoke();
      await throttler.invoke();
    });

    it('should support the `trailing` edge of cycle', async () => {
      const edge = 'trailing';
      const started = (new Date()).getTime();
      let invoked = 0;

      throttler = new Throttler(() => {
        invoked = (new Date()).getTime();
        expect(invoked - started).to.be.gte(limit);
      }, { edge, limit });

      void throttler.invoke();
      void throttler.invoke();
      void throttler.invoke();
      void throttler.invoke();
      await throttler.invoke();
    });
  });

});
