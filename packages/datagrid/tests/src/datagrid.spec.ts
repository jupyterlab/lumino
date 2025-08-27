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
    datagrid.viewport.node.style.height = '500px';
    datagrid.viewport.node.style.width = '500px';
    document.children[0].appendChild(datagrid.node);
  });

  describe('DataGrid', () => {
    describe('currentViewport()', () => {
      it('should return the viewport', () => {
        const viewport = datagrid.currentViewport;

        if (viewport === undefined) {
          throw new Error('viewport is undefined');
        }

        expect(viewport.firstRow).to.be.eq(0);
        expect(viewport.firstColumn).to.be.eq(0);
        expect(viewport.lastRow).to.be.eq(22);
        expect(viewport.lastColumn).to.be.eq(4);
      });
    });
  });
});
