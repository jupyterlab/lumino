// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
import {
  RepeatIterator, once, repeat
} from '@lumino/algorithm';

import {
  testIterator
} from './iter.spec';


describe('@lumino/algorithm', () => {

  describe('repeat()', () => {

    testIterator(() => {
      return [repeat('foo', 3), ['foo', 'foo', 'foo']];
    });

  });

  describe('once()', () => {

    testIterator(() => {
      return [once('foo'), ['foo']];
    });

  });

  describe('RepeatIterator', () => {

    testIterator(() => {
      return [new RepeatIterator('foo', 3), ['foo', 'foo', 'foo']];
    });

  });

});
