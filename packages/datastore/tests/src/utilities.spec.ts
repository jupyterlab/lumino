// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2019, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
import {
  expect
} from 'chai';

import {
  createDuplexId, createTriplexId, idCmp
} from '@lumino/datastore';


describe('@lumino/datastore', () => {
  let storeId = 1;
  let encoder = new TextEncoder();
  let decoder = new TextDecoder('utf8');


  describe('createDuplexId', () => {
    it('should generate valid strings without unpaired surrogates', () => {
      let prev = '';
      for (let version = 0; version < 100000; version++) {
        let id = createDuplexId(version, storeId);
        expect(idCmp(id, prev)).to.be.above(0);

        // The new ID should be valid unicode, without unpaired surrogates.
        // We can test this by round-tripping an encode/decode and checking
        // that the string is the same.
        expect(decoder.decode(encoder.encode(id))).to.equal(id);

        prev = id;
      }
    });
  });

  describe('createTriplexId', () => {
    it('should generate valid strings without unpaired surrogates', () => {
      let ids: string[] = [];
      for (let version = 0; version < 100000; version++) {
        // Generate a random index for insertion.
        let index = Math.round(Math.random()*ids.length);
        // Fetch the lower and upper identifiers.
        let lower = index === 0 ? '' : ids[index - 1];
        let upper = index === ids.length ? '' : ids[index];
        // Create an id to be inserted into the index position.
        let id = createTriplexId(version, storeId, lower, upper);

        // The new ID should fall between the upper and lower bounds.
        expect(idCmp(id, lower)).to.be.above(0);
        if (index !== ids.length) {
          expect(idCmp(id, upper)).to.be.below(0);
        }

        // The new ID should be valid unicode, without unpaired surrogates.
        // We can test this by round-tripping an encode/decode and checking
        // that the string is the same.
        expect(decoder.decode(encoder.encode(id))).to.equal(id);

        // Insert the new id into the sorted IDs list.
        ids.splice(index, 0, id);
      }

    }).timeout(20000);
  });
});
