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

/**
 * Six rows and four columns, with body rows 0 and 3 each merged across all
 * columns.
 */
class MergedModel extends DataModel {
  rowCount(region: DataModel.RowRegion): number {
    return region === 'body' ? 6 : 1;
  }
  columnCount(region: DataModel.ColumnRegion): number {
    return region === 'body' ? 4 : 1;
  }
  data(region: DataModel.CellRegion, row: number, column: number): string {
    return `${row},${column}`;
  }
  groupCount(region: DataModel.CellRegion): number {
    return region === 'body' ? 2 : 0;
  }
  group(region: DataModel.CellRegion, index: number) {
    const row = index === 0 ? 0 : 3;
    return { r1: row, r2: row, c1: 0, c2: 3 };
  }
  changeCell(row: number, column: number): void {
    this.emitChanged({
      type: 'cells-changed',
      region: 'body',
      row,
      column,
      rowSpan: 1,
      columnSpan: 1
    });
  }
}

/**
 * A data grid which records the regions it is asked to repaint.
 */
class RepaintRecordingGrid extends DataGrid {
  regions: Array<[DataModel.CellRegion, number, number, number, number]> = [];

  protected repaintRegion(
    region: DataModel.CellRegion,
    r1: number,
    c1: number,
    r2: number,
    c2: number
  ): void {
    this.regions.push([region, r1, c1, r2, c2]);
    super.repaintRegion(region, r1, c1, r2, c2);
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

    describe('cells-changed', () => {
      let grid: RepaintRecordingGrid;
      let merged: MergedModel;

      beforeEach(() => {
        merged = new MergedModel();
        grid = new RepaintRecordingGrid();
        grid.dataModel = merged;
      });

      afterEach(() => {
        grid.dispose();
      });

      it('should repaint the whole merged cell of a changed cell', () => {
        merged.changeCell(3, 2);
        expect(grid.regions).to.deep.equal([['body', 3, 0, 3, 3]]);
      });

      it('should repaint the whole merged cell in row 0', () => {
        merged.changeCell(0, 1);
        expect(grid.regions).to.deep.equal([['body', 0, 0, 0, 3]]);
      });

      it('should repaint only a changed cell outside merged cells', () => {
        merged.changeCell(1, 1);
        expect(grid.regions).to.deep.equal([['body', 1, 1, 1, 1]]);
      });
    });
  });
});
