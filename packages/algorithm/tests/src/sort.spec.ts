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

import { topologicSort } from '@lumino/algorithm';

describe('@lumino/algorithm', () => {
  describe('topologicSort()', () => {
    it('should correctly order the input', () => {
      let data: Array<[string, string]> = [
        ['a', 'b'],
        ['b', 'c'],
        ['c', 'd'],
        ['d', 'e']
      ];
      let result = topologicSort(data);
      expect(result).to.deep.equal(['a', 'b', 'c', 'd', 'e']);
    });

    it('should correctly order shuffled input', () => {
      let data: Array<[string, string]> = [
        ['d', 'e'],
        ['c', 'd'],
        ['a', 'b'],
        ['b', 'c']
      ];
      let result = topologicSort(data);
      expect(result).to.deep.equal(['a', 'b', 'c', 'd', 'e']);
    });

    it('should return an approximate order when a cycle is present', () => {
      let data: Array<[string, string]> = [
        ['a', 'b'],
        ['b', 'c'],
        ['c', 'd'],
        ['c', 'b'],
        ['d', 'e']
      ];
      let result = topologicSort(data);
      expect(result.indexOf('a')).to.equal(0);
      expect(result.indexOf('e')).to.equal(4);
      expect(result.indexOf('b')).to.be.greaterThan(0).lessThan(4);
      expect(result.indexOf('c')).to.be.greaterThan(0).lessThan(4);
      expect(result.indexOf('d')).to.be.greaterThan(0).lessThan(4);
    });

    it('should return a valid order when under-constrained', () => {
      let data: Array<[string, string]> = [
        ['a', 'b'],
        ['a', 'c'],
        ['a', 'd'],
        ['a', 'e']
      ];
      let result = topologicSort(data);
      expect(result.indexOf('a')).to.equal(0);
      expect(result.indexOf('b')).to.be.greaterThan(0);
      expect(result.indexOf('c')).to.be.greaterThan(0);
      expect(result.indexOf('d')).to.be.greaterThan(0);
      expect(result.indexOf('e')).to.be.greaterThan(0);
    });
  });
});
