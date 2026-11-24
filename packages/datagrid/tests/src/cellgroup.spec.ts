// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { expect } from 'chai';

import { CellGroup, DataModel } from '@lumino/datagrid';

/**
 * Three rows and two columns, with two merged cells that touch at a
 * corner: rows 0 to 1 of column 1, and rows 1 to 2 of column 0.
 */
class ChainModel extends DataModel {
  rowCount(region: DataModel.RowRegion): number {
    return region === 'body' ? 3 : 1;
  }
  columnCount(region: DataModel.ColumnRegion): number {
    return region === 'body' ? 2 : 1;
  }
  data(region: DataModel.CellRegion, row: number, column: number): string {
    return `${row},${column}`;
  }
  groupCount(region: DataModel.CellRegion): number {
    return region === 'body' ? 2 : 0;
  }
  group(region: DataModel.CellRegion, index: number) {
    return index === 0
      ? { r1: 0, r2: 1, c1: 1, c2: 1 }
      : { r1: 1, r2: 2, c1: 0, c2: 0 };
  }
}

describe('@lumino/datagrid', () => {
  describe('CellGroup', () => {
    describe('joinCellGroups()', () => {
      it('should end at row and column 0', () => {
        expect(
          CellGroup.joinCellGroups([{ r1: 0, r2: 0, c1: 0, c2: 0 }])
        ).to.deep.equal({ r1: 0, r2: 0, c1: 0, c2: 0 });
      });
    });

    describe('joinCellGroupWithMergedCellGroups()', () => {
      it('should join a merged cell reached through another one', () => {
        expect(
          CellGroup.joinCellGroupWithMergedCellGroups(
            new ChainModel(),
            { r1: 2, r2: 2, c1: 0, c2: 1 },
            'body'
          )
        ).to.deep.equal({ r1: 0, r2: 2, c1: 0, c2: 1 });
      });

      it('should join only the merged cells that pass the filter', () => {
        expect(
          CellGroup.joinCellGroupWithMergedCellGroups(
            new ChainModel(),
            { r1: 2, r2: 2, c1: 0, c2: 1 },
            'body',
            group => group.c1 === 1
          )
        ).to.deep.equal({ r1: 2, r2: 2, c1: 0, c2: 1 });
      });

      it('should keep the order of corners given in reverse', () => {
        expect(
          CellGroup.joinCellGroupWithMergedCellGroups(
            new ChainModel(),
            { r1: 2, r2: 2, c1: 1, c2: 0 },
            'body'
          )
        ).to.deep.equal({ r1: 0, r2: 2, c1: 1, c2: 0 });
      });
    });
  });
});
