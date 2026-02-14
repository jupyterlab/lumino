/*
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */

import { hasTopLevelComma } from '@lumino/coreutils/src/selector';
import { expect } from 'chai';

describe('selector validation', () => {
  it('allows commas inside :is()', () => {
    expect(hasTopLevelComma('.a:is(.b,.c)')).to.equal(false);
  });

  it('allows commas inside :where()', () => {
    expect(hasTopLevelComma('.a:where(.b,.c)')).to.equal(false);
  });

  it('rejects top-level commas', () => {
    expect(hasTopLevelComma('.a, .b')).to.equal(true);
  });

  it('rejects mixed selectors', () => {
    expect(hasTopLevelComma('.a:is(.b,.c), .d')).to.equal(true);
  });
});
