// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
import { take } from '@lumino/algorithm';

import { testIterator } from './iter.spec';

describe('@lumino/algorithm', () => {
  describe('take()', () => {
    testIterator(() => {
      return [take([1, 2, 3, 4, 5], 2), [1, 2]];
    });
  });

  describe('take()', () => {
    testIterator(() => {
      return [take([0, 1, 2, 3][Symbol.iterator](), 1), [0]];
    });
  });

  describe('take() with count=0', () => {
    testIterator(() => {
      return [take([0, 1, 2, 3][Symbol.iterator](), 0), []];
    });
  });
});
