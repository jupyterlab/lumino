// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { expect } from 'chai';

import { IPoll, Poll } from '@lumino/polling';

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

describe('Poll', () => {
  let poll: Poll | undefined;

  afterEach(() => {
    poll?.dispose();
    poll = undefined;
  });

  describe('#constructor()', () => {
    it('should create a poll', () => {
      poll = new Poll({
        auto: false,
        factory: () => Promise.resolve(),
        name: '@lumino/polling:Poll#constructor()-1'
      });
      expect(poll).to.be.an.instanceof(Poll);
    });

    it('should start polling automatically', async () => {
      const expected = 'started resolved';
      const ticker: IPoll.Phase<any>[] = [];
      poll = new Poll({
        name: '@lumino/polling:Poll#constructor()-2',
        frequency: { interval: 100 },
        factory: () => Promise.resolve()
      });
      poll.ticked.connect((_, tick) => {
        ticker.push(tick.phase);
      });
      expect(poll.state.phase).to.equal('constructed');
      await poll.tick;
      expect(poll.state.phase).to.equal('started');
      await poll.tick;
      expect(poll.state.phase).to.equal('resolved');
      expect(ticker.join(' ')).to.equal(expected);
    });

    it('should not poll if `auto` is set to false', async () => {
      const expected = '';
      const ticker: IPoll.Phase<any>[] = [];
      poll = new Poll({
        auto: false,
        name: '@lumino/polling:Poll#constructor()-2',
        frequency: { interval: 100 },
        factory: () => Promise.resolve()
      });
      poll.ticked.connect((_, tick) => {
        ticker.push(tick.phase);
      });
      expect(poll.state.phase).to.equal('constructed');
      await sleep(1000); // Sleep for longer than the interval.
      expect(ticker.join(' ')).to.equal(expected);
    });

    describe('#options.frequency', () => {
      it('should set frequency interval', () => {
        const interval = 9000;
        poll = new Poll({
          factory: () => Promise.resolve(),
          frequency: { interval },
          name: '@lumino/polling:Poll#frequency:interval-1'
        });
        expect(poll.frequency.interval).to.equal(interval);
      });

      it('should default frequency interval to `1000`', () => {
        poll = new Poll({
          factory: () => Promise.resolve(),
          frequency: {},
          name: '@lumino/polling:Poll#frequency:interval-2'
        });
        expect(poll.frequency.interval).to.equal(1000);
      });

      it('should set backoff', () => {
        const backoff = false;
        poll = new Poll({
          factory: () => Promise.resolve(),
          frequency: { backoff },
          name: '@lumino/polling:Poll#frequency:backoff-1'
        });
        expect(poll.frequency.backoff).to.equal(backoff);
      });

      it('should default backoff to `true`', () => {
        poll = new Poll({
          factory: () => Promise.resolve(),
          name: '@lumino/polling:Poll#frequency:backoff-2'
        });
        expect(poll.frequency.backoff).to.equal(true);
      });

      it('should set max value', () => {
        const max = 200000;
        poll = new Poll({
          factory: () => Promise.resolve(),
          frequency: { max },
          name: '@lumino/polling:Poll#max-1'
        });
        expect(poll.frequency.max).to.equal(200000);
      });

      it('should default max to 30s', () => {
        const interval = 500;
        const max = 30 * 1000;
        poll = new Poll({
          frequency: { interval },
          factory: () => Promise.resolve(),
          name: '@lumino/polling:Poll#frequency:max-2'
        });
        expect(poll.frequency.max).to.equal(max);
      });

      it('should normalize max to be biggest of default, max, interval', () => {
        const interval = 25 * 1000;
        const max = 20 * 1000;
        poll = new Poll({
          frequency: { interval },
          factory: () => Promise.resolve(),
          name: '@lumino/polling:Poll#frequency:max-3'
        });
        expect(poll.frequency.max).to.not.equal(max);
        expect(poll.frequency.max).to.equal(30 * 1000); // Poll default max
      });

      it('should normalize max to be biggest of default, max, interval', () => {
        const interval = 40 * 1000;
        const max = 20 * 1000;
        poll = new Poll({
          frequency: { interval },
          factory: () => Promise.resolve(),
          name: '@lumino/polling:Poll#frequency:max-4'
        });
        expect(poll.frequency.max).to.not.equal(max);
        expect(poll.frequency.max).to.equal(interval);
      });
    });
  });

  describe('#hidden', () => {
    class HiddenPoll extends Poll {
      get hidden(): boolean {
        return true;
      }
    }

    it('should tick `linger` times when the document is hidden', async () => {
      const total = 24;
      const linger = 19;
      const ticker: IPoll.Phase<any>[] = [];
      const expected = `started${' resolved'.repeat(linger)}${' standby'.repeat(
        total - linger
      )}`;
      let lingered = 0;
      const poll = new HiddenPoll({
        auto: false,
        factory: async () => lingered++,
        frequency: { interval: Poll.IMMEDIATE },
        linger,
        standby: 'when-hidden',
        name: '@lumino/polling:Poll#hidden-1'
      });
      poll.ticked.connect((_, tick) => {
        ticker.push(tick.phase);
      });
      await poll.start();
      let i = 0;
      while (i++ < total) {
        await poll.tick;
      }
      expect(ticker.join(' ')).to.equal(expected);
      expect(lingered).to.equal(linger);
      poll.dispose();
    });
  });

  describe('#name', () => {
    it('should be set to value passed in during instantation', () => {
      const factory = () => Promise.resolve();
      const name = '@lumino/polling:Poll#name-1';
      poll = new Poll({ factory, name });
      expect(poll.name).to.equal(name);
    });

    it('should default to `unknown`', () => {
      poll = new Poll({ factory: () => Promise.resolve() });
      expect(poll.name).to.equal('unknown');
    });
  });

  describe('#disposed', () => {
    it('should emit when the poll is disposed', () => {
      poll = new Poll({
        factory: () => Promise.resolve(),
        name: '@lumino/polling:Poll#disposed-1'
      });
      let disposed = false;
      poll.disposed.connect(() => {
        disposed = true;
      });
      poll.dispose();
      expect(disposed).to.equal(true);
    });
  });

  describe('#isDisposed', () => {
    it('should indicate whether the poll is disposed', () => {
      poll = new Poll({
        factory: () => Promise.resolve(),
        name: '@lumino/polling:Poll#isDisposed-1'
      });
      expect(poll.isDisposed).to.equal(false);
      poll.dispose();
      expect(poll.isDisposed).to.equal(true);
    });
  });

  describe('#[Symbol.asyncIterator]', () => {
    it('should yield after each tick', async () => {
      const total = 15;
      let i = 0;
      poll = new Poll({
        auto: false,
        factory: async () => (++i > total ? poll?.stop() : undefined),
        frequency: { interval: Poll.IMMEDIATE },
        name: '@lumino/polling:Poll#[Symbol.asyncIterator]-1'
      });
      const expected = `started ${'resolved '.repeat(total)}stopped`;
      const ticker: IPoll.Phase<any>[] = [];
      void poll.start();
      for await (const state of poll) {
        ticker.push(state.phase);
        if (state.phase === 'stopped') {
          break;
        }
      }
      expect(ticker.join(' ')).to.equal(expected);
    });

    it('should yield rejections', async () => {
      const total = 11;
      let i = 0;
      poll = new Poll({
        auto: false,
        factory: async () => (++i > total ? poll!.stop() : Promise.reject()),
        frequency: { interval: Poll.IMMEDIATE },
        name: '@lumino/polling:Poll#[Symbol.asyncIterator]-2'
      });
      const expected = `started ${'rejected '.repeat(total)}stopped`;
      const ticker: IPoll.Phase<any>[] = [];
      void poll.start();
      for await (const state of poll) {
        ticker.push(state.phase);
        if (state.phase === 'stopped') {
          break;
        }
      }
      expect(ticker.join(' ')).to.equal(expected);
    });

    it('should yield until disposed', async () => {
      const total = 7;
      let i = 0;
      poll = new Poll({
        auto: false,
        factory: async () => (++i > total ? poll!.dispose() : undefined),
        frequency: { interval: Poll.IMMEDIATE },
        name: '@lumino/polling:Poll#[Symbol.asyncIterator]-3'
      });
      const expected = `started${' resolved'.repeat(total)}`;
      const ticker: IPoll.Phase<any>[] = [];
      void poll.start();
      for await (const state of poll) {
        ticker.push(state.phase);
        if (poll.isDisposed) {
          break;
        }
      }
      expect(ticker.join(' ')).to.equal(expected);
    });

    it('should not drop rapid schedule calls', async () => {
      poll = new Poll<number>({
        auto: false,
        factory: () => Promise.resolve(-1),
        frequency: { interval: Poll.NEVER },
        name: '@lumino/polling:Poll#[Symbol.asyncIterator]-4'
      });
      void poll.start();
      await poll.tick;

      const payloads = [1, 2, 3, 4, 5];
      const collected: number[] = [];
      const consumption = (async () => {
        for await (const state of poll!) {
          if (state.payload === -1) continue;
          collected.push(state.payload as number);
          if (collected.length === payloads.length) break;
        }
      })();

      for (const payload of payloads) {
        void poll.schedule({ payload, phase: 'resolved' });
      }

      await consumption;
      expect(collected).to.deep.equal(payloads);
    });

    it('should drop oldest states when buffer overflows', async () => {
      poll = new Poll<number>({
        auto: false,
        factory: () => Promise.resolve(-1),
        frequency: { interval: Poll.NEVER },
        name: '@lumino/polling:Poll#[Symbol.asyncIterator]-7'
      });
      void poll.start();
      await poll.tick;

      const LIMIT = 1000;
      const OVERFLOW = 10;

      const collected: number[] = [];
      const consumption = (async () => {
        for await (const state of poll!) {
          if (state.payload === -1) continue;
          collected.push(state.payload as number);
          if (collected.length === LIMIT) break;
        }
      })();

      for (let i = 0; i < LIMIT + OVERFLOW; i++) {
        void poll.schedule({ payload: i, phase: 'resolved' });
      }

      await consumption;

      expect(collected.length).to.equal(LIMIT);
      // Oldest items were dropped to stay within the buffer limit.
      expect(collected[0]).to.equal(OVERFLOW);
      expect(collected[LIMIT - 1]).to.equal(LIMIT + OVERFLOW - 1);
    });

    it('should stop yielding after disposal', async () => {
      poll = new Poll({
        auto: false,
        factory: () => Promise.resolve(),
        frequency: { interval: Poll.NEVER },
        name: '@lumino/polling:Poll#[Symbol.asyncIterator]-5'
      });
      void poll.start();
      await poll.tick;

      void poll.schedule({ payload: 'a', phase: 'resolved' });
      void poll.schedule({ payload: 'b', phase: 'resolved' });
      void poll.schedule({ payload: 'c', phase: 'resolved' });
      poll.dispose();

      const collected: string[] = [];
      for await (const state of poll) {
        collected.push(state.phase);
      }
      expect(collected).to.deep.equal([]);
    });

    it('should work identically for one-tick-at-a-time polling', async () => {
      const total = 5;
      let i = 0;
      poll = new Poll({
        auto: false,
        factory: async () => ++i,
        frequency: { interval: Poll.IMMEDIATE },
        name: '@lumino/polling:Poll#[Symbol.asyncIterator]-6'
      });
      const ticker: IPoll.Phase<any>[] = [];
      void poll.start();
      for await (const state of poll) {
        ticker.push(state.phase);
        if (i >= total) {
          poll.dispose();
          break;
        }
      }
      // Should see started, then resolved for each factory call.
      expect(ticker[0]).to.equal('started');
      expect(ticker.slice(1).every(p => p === 'resolved')).to.equal(true);
      expect(ticker.length).to.be.greaterThan(1);
    });
  });

  describe('#tick', () => {
    it('should resolve after a tick', async () => {
      poll = new Poll({
        auto: false,
        factory: () => Promise.resolve(),
        frequency: { interval: 100, backoff: false },
        name: '@lumino/polling:Poll#tick-1'
      });
      const expected = 'started resolved resolved';
      const ticker: IPoll.Phase<any>[] = [];
      const tock = (poll: Poll) => {
        ticker.push(poll.state.phase);
        poll.tick.then(tock).catch(() => undefined);
      };
      void poll.tick.then(tock);
      void poll.start();
      await sleep(1000); // Sleep for longer than the interval.
      expect(ticker.join(' ').startsWith(expected)).to.equal(true);
    });

    it('should resolve after `ticked` emits in lock step', async () => {
      poll = new Poll({
        factory: () =>
          Math.random() > 0.5 ? Promise.resolve() : Promise.reject(),
        frequency: { interval: 0, backoff: false },
        name: '@lumino/polling:Poll#tick-2'
      });
      const ticker: IPoll.Phase<any>[] = [];
      const tocker: IPoll.Phase<any>[] = [];
      poll.ticked.connect(async (_, state) => {
        ticker.push(state.phase);
        expect(ticker.length).to.equal(tocker.length + 1);
      });
      const tock = (poll: Poll): void => {
        tocker.push(poll.state.phase);
        expect(ticker.join(' ')).to.equal(tocker.join(' '));
        poll.tick.then(tock);
      };
      // Kick off the promise listener, but void its settlement to verify that
      // the poll's internal sync of the promise and the signal is correct.
      poll.tick.then(tock);
      await poll.stop();
      await poll.start();
      await poll.tick;
      await poll.refresh();
      await poll.tick;
      await poll.refresh();
      await poll.tick;
      await poll.refresh();
      await poll.tick;
      await poll.stop();
      await poll.start();
      await poll.tick;
      await sleep(250);
      await poll.tick;
      expect(ticker.join(' ')).to.equal(tocker.join(' '));
    });
  });

  describe('#ticked', () => {
    it('should emit a tick identical to the poll state', async () => {
      poll = new Poll<void, void>({
        factory: () => Promise.resolve(),
        frequency: { interval: 100, backoff: false },
        name: '@lumino/polling:Poll#ticked-3'
      });
      poll.ticked.connect((poll, tick) => {
        expect(tick).to.equal(poll.state);
      });
      await sleep(1000); // Sleep for longer than the interval.
    });
  });

  describe('#dispose()', () => {
    it('should dispose the poll and be safe to call repeatedly', async () => {
      let rejected = false;
      let tick: Promise<Poll>;
      poll = new Poll({
        name: '@lumino/polling:Poll#dispose()-1',
        factory: () => Promise.resolve()
      });
      tick = poll.tick;
      expect(poll.isDisposed).to.equal(false);
      poll.dispose();
      expect(poll.isDisposed).to.equal(true);
      try {
        await tick;
      } catch (error) {
        rejected = true;
      }
      poll.dispose();
      expect(rejected).to.equal(true);
    });
  });

  describe('#refresh()', () => {
    it('should refresh the poll, superseding `started`', async () => {
      const expected = 'refreshed resolved';
      const ticker: IPoll.Phase<any>[] = [];
      poll = new Poll({
        name: '@lumino/polling:Poll#refresh()-1',
        frequency: { interval: 100 },
        factory: () => Promise.resolve()
      });
      poll.ticked.connect((_, tick) => {
        ticker.push(tick.phase);
      });
      expect(poll.state.phase).to.equal('constructed');
      await poll.refresh();
      expect(poll.state.phase).to.equal('refreshed');
      await poll.tick;
      expect(poll.state.phase).to.equal('resolved');
      expect(ticker.join(' ')).to.equal(expected);
    });

    it('should be safe to call multiple times', async () => {
      const expected = 'started resolved refreshed resolved';
      const ticker: IPoll.Phase<any>[] = [];
      poll = new Poll({
        name: '@lumino/polling:Poll#refresh()-2',
        frequency: { interval: 100 },
        factory: () => Promise.resolve()
      });
      poll.ticked.connect((_, tick) => {
        ticker.push(tick.phase);
      });
      expect(poll.state.phase).to.equal('constructed');
      await poll.tick;
      expect(poll.state.phase).to.equal('started');
      await poll.tick;
      expect(poll.state.phase).to.equal('resolved');
      await poll.refresh();
      expect(poll.state.phase).to.equal('refreshed');
      await poll.refresh();
      expect(poll.state.phase).to.equal('refreshed');
      await poll.refresh();
      expect(poll.state.phase).to.equal('refreshed');
      await poll.tick;
      expect(poll.state.phase).to.equal('resolved');
      expect(ticker.join(' ')).to.equal(expected);
    });
  });

  describe('#start()', () => {
    it('should start the poll if it is stopped', async () => {
      const expected = 'stopped started resolved';
      const ticker: IPoll.Phase<any>[] = [];
      poll = new Poll({
        name: '@lumino/polling:Poll#start()-1',
        frequency: { interval: 100 },
        factory: () => Promise.resolve()
      });
      poll.ticked.connect((_, tick) => {
        ticker.push(tick.phase);
      });
      await poll.stop();
      expect(poll.state.phase).to.equal('stopped');
      await poll.start();
      expect(poll.state.phase).to.equal('started');
      await poll.tick;
      expect(poll.state.phase).to.equal('resolved');
      expect(ticker.join(' ')).to.equal(expected);
    });

    it('be safe to call multiple times and no-op if unnecessary', async () => {
      const expected = 'started resolved stopped started resolved';
      const ticker: IPoll.Phase<any>[] = [];
      poll = new Poll({
        auto: false,
        name: '@lumino/polling:Poll#start()-2',
        frequency: { interval: 100 },
        factory: () => Promise.resolve()
      });
      poll.ticked.connect((_, tick) => {
        ticker.push(tick.phase);
      });
      expect(poll.state.phase).to.equal('constructed');
      await poll.start();
      expect(poll.state.phase).to.equal('started');
      await poll.start();
      expect(poll.state.phase).to.equal('started');
      await poll.start();
      expect(poll.state.phase).to.equal('started');
      await poll.tick;
      expect(poll.state.phase).to.equal('resolved');
      await poll.stop();
      expect(poll.state.phase).to.equal('stopped');
      await poll.start();
      expect(poll.state.phase).to.equal('started');
      await poll.tick;
      expect(poll.state.phase).to.equal('resolved');
      expect(ticker.join(' ')).to.equal(expected);
    });
  });

  describe('#stop()', () => {
    it('should stop the poll if it is active', async () => {
      const expected = 'started stopped started resolved';
      const ticker: IPoll.Phase<any>[] = [];
      poll = new Poll({
        auto: false,
        name: '@lumino/polling:Poll#stop()-1',
        frequency: { interval: 100 },
        factory: () => Promise.resolve()
      });
      poll.ticked.connect((_, tick) => {
        ticker.push(tick.phase);
      });
      await poll.start();
      expect(poll.state.phase).to.equal('started');
      await poll.stop();
      expect(poll.state.phase).to.equal('stopped');
      await poll.start();
      expect(poll.state.phase).to.equal('started');
      await poll.tick;
      expect(poll.state.phase).to.equal('resolved');
      expect(ticker.join(' ')).to.equal(expected);
    });

    it('be safe to call multiple times', async () => {
      const expected = 'started stopped started resolved';
      const ticker: IPoll.Phase<any>[] = [];
      poll = new Poll({
        auto: false,
        name: '@lumino/polling:Poll#stop()-2',
        frequency: { interval: 100 },
        factory: () => Promise.resolve()
      });
      poll.ticked.connect((_, tick) => {
        ticker.push(tick.phase);
      });
      expect(poll.state.phase).to.equal('constructed');
      await poll.start();
      expect(poll.state.phase).to.equal('started');
      await poll.stop();
      expect(poll.state.phase).to.equal('stopped');
      await poll.stop();
      expect(poll.state.phase).to.equal('stopped');
      await poll.stop();
      expect(poll.state.phase).to.equal('stopped');
      await poll.start();
      expect(poll.state.phase).to.equal('started');
      await poll.tick;
      expect(poll.state.phase).to.equal('resolved');
      expect(ticker.join(' ')).to.equal(expected);
    });
  });

  describe('#schedule()', () => {
    it('should schedule the next poll state', async () => {
      poll = new Poll({
        factory: () => Promise.resolve(),
        frequency: { interval: 100 },
        name: '@lumino/polling:Poll#schedule()-1'
      });
      expect(poll.state.phase).to.equal('constructed');
      await poll.tick;
      expect(poll.state.phase).to.equal('started');
      await poll.tick;
      expect(poll.state.phase).to.equal('resolved');
      await poll.schedule({ phase: 'refreshed' });
      expect(poll.state.phase).to.equal('refreshed');
      return;
    });

    it('should default to standby state', async () => {
      poll = new Poll({
        factory: () => Promise.resolve(),
        frequency: { interval: 100 },
        name: '@lumino/polling:Poll#schedule()-2'
      });
      expect(poll.state.phase).to.equal('constructed');
      await poll.tick;
      expect(poll.state.phase).to.equal('started');
      await poll.tick;
      expect(poll.state.phase).to.equal('resolved');
      await poll.schedule();
      expect(poll.state.phase).to.equal('standby');
      return;
    });

    it('should support phase transition cancellation', async () => {
      poll = new Poll({
        factory: () => Promise.resolve(),
        frequency: { interval: 100 },
        name: '@lumino/polling:Poll#schedule()-3'
      });
      expect(poll.state.phase).to.equal('constructed');
      await poll.tick;
      expect(poll.state.phase).to.equal('started');
      await poll.tick;
      expect(poll.state.phase).to.equal('resolved');
      await poll.schedule();
      expect(poll.state.phase).to.equal('standby');
      await poll.schedule({
        cancel: last => last.phase === 'standby',
        phase: 'refreshed'
      });
      expect(poll.state.phase).to.equal('standby');
      return;
    });
  });
});
