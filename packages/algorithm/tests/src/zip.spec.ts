// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
import { zip } from '@lumino/algorithm';

import { testIterator } from './iter.spec';

describe('@lumino/algorithm', () => {
  describe('zip()', () => {
    testIterator(() => {
      return [
        zip([1, 2, 3], [4, 5, 6]),
        [
          [1, 4],
          [2, 5],
          [3, 6]
        ]
      ];
    });
  });

  describe('zip()', () => {
    testIterator(() => {
      let i1 = ['one', 'two'];
      let i2 = [1, 2];
      let i3 = [true, false];
      type T = string | number | boolean;
      let it = zip<T>(i1, i2, i3);
      let results = [
        ['one', 1, true],
        ['two', 2, false]
      ];
      return [it, results];
    });
  });
});
