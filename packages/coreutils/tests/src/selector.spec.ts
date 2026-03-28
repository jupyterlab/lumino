/*
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */

import { expect } from 'chai';
import { Selector } from '@lumino/coreutils';

describe('selector validation', () => {
  it('allows commas inside :is()', () => {
    expect(Selector.hasTopLevelComma('.a:is(.b,.c)')).to.equal(false);
  });

  it('allows commas inside :where()', () => {
    expect(Selector.hasTopLevelComma('.a:where(.b,.c)')).to.equal(false);
  });

  it('rejects top-level commas', () => {
    expect(Selector.hasTopLevelComma('.a, .b')).to.equal(true);
  });

  it('rejects mixed selectors', () => {
    expect(Selector.hasTopLevelComma('.a:is(.b,.c), .d')).to.equal(true);
  });
});
