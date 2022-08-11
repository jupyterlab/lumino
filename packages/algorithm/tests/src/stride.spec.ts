// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
import { stride } from '@lumino/algorithm';

import { testIterator } from './iter.spec';

describe('@lumino/algorithm', () => {
  describe('stride()', () => {
    testIterator(() => {
      return [stride([0, 1, 2, 3, 4, 5], 2), [0, 2, 4]];
    });
  });

  describe('StrideIterator', () => {
    testIterator(() => {
      let it = [1, 2, 3, 4, 5, 6, 7][Symbol.iterator]();
      return [stride(it, 3), [1, 4, 7]];
    });
  });
});
