// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { expect } from 'chai';

import { CellGroup } from '@lumino/datagrid';

describe('@lumino/datagrid', () => {
  describe('CellGroup', () => {
    describe('joinCellGroups()', () => {
      it('should end at row and column 0', () => {
        expect(
          CellGroup.joinCellGroups([{ r1: 0, r2: 0, c1: 0, c2: 0 }])
        ).to.deep.equal({ r1: 0, r2: 0, c1: 0, c2: 0 });
      });
    });
  });
});
