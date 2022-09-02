// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
import { chain } from '@lumino/algorithm';

import { testIterator } from './iter.spec';

describe('@lumino/algorithm', () => {
  describe('chain()', () => {
    testIterator(() => {
      let it = chain([1, 2, 3], [4], [5, 6]);
      let expected = [1, 2, 3, 4, 5, 6];
      return [it, expected];
    });
  });

  describe('ChainIterator', () => {
    testIterator(() => {
      let a = [1, 2, 3];
      let b = ['four', 'five'];
      let c = [true, false][Symbol.iterator]();
      type T = number | string | boolean;
      let it = chain<T>(a, b, c);
      let expected = [1, 2, 3, 'four', 'five', true, false];
      return [it, expected];
    });
  });
});
