// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
import { expect } from 'chai';

import { each, every, some } from '@lumino/algorithm';

/**
 * A helper function to test the methods of an iterator.
 *
 * @param factory - A function which produces an iterator and the
 *   expected results of that iterator.
 */
export function testIterator<T>(
  factory: () => [IterableIterator<T>, T[]]
): void {
  describe('yield', () => {
    it('should return the same values in the iterator', () => {
      let [it, results] = factory();
      expect(Array.from(it)).to.deep.equal(results);
    });
  });
}

describe('@lumino/algorithm', () => {
  describe('each()', () => {
    it('should visit every item in an iterable', () => {
      let result = 0;
      let data = [1, 2, 3, 4, 5];
      each(data, x => {
        result += x;
      });
      expect(result).to.equal(15);
    });

    it('should break early if the callback returns `false`', () => {
      let result = 0;
      let data = [1, 2, 3, 4, 5];
      each(data, x => {
        if (x > 3) {
          return false;
        }
        result += x;
        return true;
      });
      expect(result).to.equal(6);
    });
  });

  describe('every()', () => {
    it('should verify all items in an iterable satisfy a condition', () => {
      let data = [1, 2, 3, 4, 5];
      let valid = every(data, x => x > 0);
      let invalid = every(data, x => x > 4);
      expect(valid).to.equal(true);
      expect(invalid).to.equal(false);
    });
  });

  describe('some()', () => {
    it('should verify some items in an iterable satisfy a condition', () => {
      let data = [1, 2, 3, 4, 5];
      let valid = some(data, x => x > 4);
      let invalid = some(data, x => x < 0);
      expect(valid).to.equal(true);
      expect(invalid).to.equal(false);
    });
  });
});
