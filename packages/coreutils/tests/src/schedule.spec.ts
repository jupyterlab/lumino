// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { expect } from 'chai';

import { schedule, unschedule } from '@lumino/coreutils';

/**
 * Return a promise that resolves in the given milliseconds with the given value.
 */
function sleep(milliseconds: number = 0): Promise<unknown> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(undefined);
    }, milliseconds);
  });
}

describe('@lumino/coreutils', () => {
  describe('schedule() and unschedule()', () => {
    it('should schedule a deferred function invocation', done => {
      schedule(() => void done());
    }).timeout(5000); // Increase test timeout for Windows.

    it('should allow a callback to be unscheduled', async () => {
      let called = false;
      unschedule(schedule(() => (called = true)));
      await sleep(100);
      expect(called).to.equal(false);
    });
  });
});
