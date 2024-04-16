// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { expect } from 'chai';

import { DataGrid, DataModel } from '@lumino/datagrid';

class LargeDataModel extends DataModel {
  rowCount(region: DataModel.RowRegion): number {
    return region === 'body' ? 1_000_000_000_000 : 2;
  }

  columnCount(region: DataModel.ColumnRegion): number {
    return region === 'body' ? 1_000_000_000_000 : 3;
  }

  data(region: DataModel.CellRegion, row: number, column: number): any {
    if (region === 'row-header') {
      return `R: ${row}, ${column}`;
    }
    if (region === 'column-header') {
      return `C: ${row}, ${column}`;
    }
    if (region === 'corner-header') {
      return `N: ${row}, ${column}`;
    }
    return `(${row}, ${column})`;
  }
}

describe('@lumino/datagrid', () => {
  let datagrid: DataGrid;
  let model: LargeDataModel;

  beforeEach(() => {
    datagrid = new DataGrid();
    model = new LargeDataModel();
    datagrid.dataModel = model;
  });

  describe('DataGrid', () => {
    describe('currentViewport()', () => {
      it('should return the viewport', () => {
        expect(datagrid.currentViewport).to.be.undefined;
      });
    });
  });
});
