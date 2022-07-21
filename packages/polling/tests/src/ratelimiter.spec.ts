// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { expect } from 'chai';

import { Debouncer, Poll, Throttler } from '@lumino/polling';

describe('Debouncer', () => {
  const limit = Poll.IMMEDIATE;
  let debouncer: Debouncer;

  afterEach(() => {
    debouncer.dispose();
  });

  describe('#constructor()', () => {
    it('should create a debouncer', () => {
      debouncer = new Debouncer(async () => undefined, limit);
      expect(debouncer).to.be.an.instanceof(Debouncer);
    });
  });

  describe('#invoke()', () => {
    it('should invoke and debounce a function', async () => {
      let counter = 0;
      debouncer = new Debouncer(() => counter++, limit);
      expect(counter).to.equal(0);
      await debouncer.invoke();
      expect(counter).to.equal(1);
      void debouncer.invoke();
      void debouncer.invoke();
      void debouncer.invoke();
      await debouncer.invoke();
      expect(counter).to.equal(2);
    });

    it('should debounce with arguments', async () => {
      let output = '';
      debouncer = new Debouncer((name?: string) => {
        output = `Hello, ${name || 'world'}`;
      }, limit);
      void debouncer.invoke('Huey');
      void debouncer.invoke('Dewey');
      await debouncer.invoke('Louie');
      expect(output).to.equal('Hello, Louie');
    });
  });
});

describe('Throttler', () => {
  const limit = Poll.IMMEDIATE;
  let throttler: Throttler;

  afterEach(() => {
    throttler.dispose();
  });

  describe('#constructor()', () => {
    it('should create a throttler', () => {
      throttler = new Throttler(async () => undefined, limit);
      expect(throttler).to.be.an.instanceof(Throttler);
    });
  });

  describe('#invoke()', () => {
    it('should invoke and throttle a function', async () => {
      let counter = 0;
      throttler = new Throttler(() => counter++, limit);
      expect(counter).to.equal(0);
      await throttler.invoke();
      expect(counter).to.equal(1);
      void throttler.invoke();
      void throttler.invoke();
      void throttler.invoke();
      await throttler.invoke();
      expect(counter).to.equal(2);
    });

    it('should throttle with arguments', async () => {
      let output = '';
      throttler = new Throttler((name?: string) => {
        output = `Hello, ${name || 'world'}`;
      }, limit);
      void throttler.invoke();
      await throttler.invoke('Huey');
      expect(output).to.equal('Hello, world');
      void throttler.invoke('Dewey');
      await throttler.invoke('Louie');
      expect(output).to.equal('Hello, Dewey');
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
      throttler = new Throttler(invoked => {
        expect(invoked).to.equal(1);
      }, limit);

      void throttler.invoke(1);
      void throttler.invoke(2);
      void throttler.invoke(3);
      void throttler.invoke(4);
      await throttler.invoke(5);
    });

    it('should support the `leading` edge of cycle', async () => {
      const edge = 'leading';

      throttler = new Throttler(
        invoked => {
          expect(invoked).to.equal(1);
        },
        { edge, limit }
      );

      void throttler.invoke(1);
      void throttler.invoke(2);
      void throttler.invoke(3);
      void throttler.invoke(4);
      await throttler.invoke(5);
    });

    it('should support the `trailing` edge of cycle', async () => {
      const edge = 'trailing';
      throttler = new Throttler(
        invoked => {
          expect(invoked).to.equal(5);
        },
        { edge, limit }
      );

      void throttler.invoke(1);
      void throttler.invoke(2);
      void throttler.invoke(3);
      void throttler.invoke(4);
      await throttler.invoke(5);
    });
  });
});
