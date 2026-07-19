// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { expect } from 'chai';

// Deep import: `intersectionutils` is an internal module and is intentionally
// not re-exported from the package index. A test-only `paths` mapping in
// `tests/tsconfig.json` points this specifier at the emitted declarations.
import {
  INTERSECTION_TOLERANCE_MULTIPLIER,
  IntersectionHoverStyler
} from '@lumino/widgets/lib/intersectionutils';

const CLASS = 'lm-mod-intersection';

function div(): HTMLDivElement {
  return document.createElement('div');
}

describe('@lumino/widgets', () => {
  describe('INTERSECTION_TOLERANCE_MULTIPLIER', () => {
    it('should be 4', () => {
      expect(INTERSECTION_TOLERANCE_MULTIPLIER).to.equal(4);
    });
  });

  describe('IntersectionHoverStyler', () => {
    describe('#set()', () => {
      it('should add the intersection class to both handles', () => {
        const styler = new IntersectionHoverStyler();
        const a = div();
        const b = div();
        styler.set(a, b);
        expect(a.classList.contains(CLASS)).to.equal(true);
        expect(b.classList.contains(CLASS)).to.equal(true);
      });

      it('should style only the primary handle when no peer is given', () => {
        const styler = new IntersectionHoverStyler();
        const a = div();
        styler.set(a);
        expect(a.classList.contains(CLASS)).to.equal(true);
      });

      it('should move the class from the previous pair to the new pair', () => {
        const styler = new IntersectionHoverStyler();
        const a = div();
        const b = div();
        const c = div();
        const d = div();
        styler.set(a, b);
        styler.set(c, d);
        expect(a.classList.contains(CLASS)).to.equal(false);
        expect(b.classList.contains(CLASS)).to.equal(false);
        expect(c.classList.contains(CLASS)).to.equal(true);
        expect(d.classList.contains(CLASS)).to.equal(true);
      });

      it('should apply the class once when the same node is passed twice', () => {
        const styler = new IntersectionHoverStyler();
        const a = div();
        styler.set(a, a);
        expect(a.classList.contains(CLASS)).to.equal(true);
        // Removing it once should leave no residual class (dedupe on apply).
        a.classList.remove(CLASS);
        expect(a.classList.contains(CLASS)).to.equal(false);
      });

      it('should be a no-op when the same pair is set again', () => {
        const styler = new IntersectionHoverStyler();
        const a = div();
        const b = div();
        styler.set(a, b);
        // A second identical call must not throw and must leave the class on.
        styler.set(a, b);
        expect(a.classList.contains(CLASS)).to.equal(true);
        expect(b.classList.contains(CLASS)).to.equal(true);
      });
    });

    describe('#clear()', () => {
      it('should remove the class from both handles', () => {
        const styler = new IntersectionHoverStyler();
        const a = div();
        const b = div();
        styler.set(a, b);
        styler.clear();
        expect(a.classList.contains(CLASS)).to.equal(false);
        expect(b.classList.contains(CLASS)).to.equal(false);
      });

      it('should be safe to call when nothing is set', () => {
        const styler = new IntersectionHoverStyler();
        expect(() => styler.clear()).to.not.throw();
      });
    });
  });
});
