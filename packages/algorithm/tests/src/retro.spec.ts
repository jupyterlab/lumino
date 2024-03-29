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

import { retro } from '@lumino/algorithm';

import { testIterator } from './iter.spec';

describe('@lumino/algorithm', () => {
  describe('retro()', () => {
    it('should create an iterator for an array-like object', () => {
      expect(Array.from(retro([0, 1, 2, 3]))).to.deep.equal([3, 2, 1, 0]);
    });

    it('should call `retro` on a retroable', () => {
      let data = [1, 2, 3, 4];
      let retroable = { retro: () => retro(data) };
      testIterator(() => [retro(retroable), data.slice().reverse()], 'retro');
    });

    it('should reverse an array', () => {
      testIterator(() => {
        return [retro([1, 2, 3]), [3, 2, 1]];
      });
    });
  });
});
