// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { expect } from 'chai';

import {
  BasicMouseHandler,
  BasicSelectionModel,
  DataGrid,
  DataModel
} from '@lumino/datagrid';

import { MessageLoop } from '@lumino/messaging';

import { Widget } from '@lumino/widgets';

import { Platform } from '@lumino/domutils';

/**
 * A minimal stand-in for a data grid which records `scrollBy` calls.
 */
function createFakeGrid(): {
  grid: DataGrid;
  calls: Array<[number, number]>;
} {
  const calls: Array<[number, number]> = [];
  const fake = {
    scrollX: 100,
    scrollY: 100,
    maxScrollX: 1000,
    maxScrollY: 1000,
    pageWidth: 400,
    pageHeight: 300,
    defaultSizes: { columnWidth: 64, rowHeight: 20 },
    scrollBy(dx: number, dy: number) {
      calls.push([dx, dy]);
    }
  };
  return { grid: fake as unknown as DataGrid, calls };
}

/**
 * Six rows and four columns, with body row 3 merged across all columns
 * (#864) and body rows 1 and 2 merged in column 0, and optionally column
 * headers 2 and 3 merged.
 */
class MergedModel extends DataModel {
  constructor(private headerGroup = false) {
    super();
  }
  rowCount(region: DataModel.RowRegion): number {
    return region === 'body' ? 6 : 1;
  }
  columnCount(region: DataModel.ColumnRegion): number {
    return region === 'body' ? 4 : 1;
  }
  data(region: DataModel.CellRegion, row: number, column: number): string {
    return `${region} ${row},${column}`;
  }
  groupCount(region: DataModel.CellRegion): number {
    if (region === 'body') {
      return 2;
    }
    return this.headerGroup && region === 'column-header' ? 1 : 0;
  }
  group(region: DataModel.CellRegion, index: number) {
    if (region === 'body') {
      return index === 0
        ? { r1: 3, r2: 3, c1: 0, c2: 3 }
        : { r1: 1, r2: 2, c1: 0, c2: 0 };
    }
    return { r1: 0, r2: 0, c1: 2, c2: 3 };
  }
}

/**
 * A grid of a merged model, attached, with a basic selection model.
 */
function createMergedGrid(headerGroup = false): DataGrid {
  const model = new MergedModel(headerGroup);
  const grid = new DataGrid();
  grid.dataModel = model;
  grid.selectionModel = new BasicSelectionModel({ dataModel: model });
  grid.node.style.width = '500px';
  grid.node.style.height = '300px';
  Widget.attach(grid, document.body);
  MessageLoop.flush();
  return grid;
}

/**
 * Press the middle of a header cell.
 */
function pressHeader(
  handler: BasicMouseHandler,
  grid: DataGrid,
  region: 'column-header' | 'row-header',
  index: number
): void {
  const rect = grid.viewport.node.getBoundingClientRect();
  const clientX =
    region === 'column-header'
      ? rect.left + grid.headerWidth + 64 * index + 32
      : rect.left + grid.headerWidth / 2;
  const clientY =
    region === 'column-header'
      ? rect.top + grid.headerHeight / 2
      : rect.top + grid.headerHeight + 20 * index + 10;
  handler.onMouseDown(grid, new MouseEvent('mousedown', { clientX, clientY }));
}

describe('@lumino/datagrid', () => {
  describe('BasicMouseHandler', () => {
    describe('#onMouseDown()', () => {
      let handler: BasicMouseHandler;
      let grid: DataGrid;

      beforeEach(() => {
        handler = new BasicMouseHandler();
      });

      afterEach(() => {
        handler.dispose();
        grid.dispose();
      });

      it('should select only the pressed column, whatever the body groups', () => {
        grid = createMergedGrid();
        pressHeader(handler, grid, 'column-header', 1);
        expect(grid.selectionModel!.currentSelection()).to.deep.equal({
          r1: 0,
          c1: 1,
          r2: 5,
          c2: 1
        });
      });

      it('should select only the pressed row, whatever the body groups', () => {
        grid = createMergedGrid();
        pressHeader(handler, grid, 'row-header', 1);
        expect(grid.selectionModel!.currentSelection()).to.deep.equal({
          r1: 1,
          c1: 0,
          r2: 1,
          c2: 3
        });
      });

      it('should still select the columns of a merged column header', () => {
        grid = createMergedGrid(true);
        pressHeader(handler, grid, 'column-header', 2);
        expect(grid.selectionModel!.currentSelection()).to.deep.equal({
          r1: 0,
          c1: 2,
          r2: 5,
          c2: 3
        });
      });
    });

    describe('#onWheel()', () => {
      let handler: BasicMouseHandler;

      beforeEach(() => {
        handler = new BasicMouseHandler();
      });

      afterEach(() => {
        handler.dispose();
      });

      it('should scroll vertically for a plain wheel event', () => {
        const { grid, calls } = createFakeGrid();
        handler.onWheel(grid, new WheelEvent('wheel', { deltaY: 50 }));
        expect(calls).to.deep.equal([[0, 50]]);
      });

      it('should scroll horizontally when Shift is held outside macOS', () => {
        const { grid, calls } = createFakeGrid();
        handler.onWheel(
          grid,
          new WheelEvent('wheel', { deltaY: 50, shiftKey: true })
        );
        if (Platform.IS_MAC) {
          expect(calls).to.deep.equal([[0, 50]]);
        } else {
          expect(calls).to.deep.equal([[50, 0]]);
        }
      });

      it('should use the column width for line-mode Shift + wheel outside macOS', () => {
        const { grid, calls } = createFakeGrid();
        handler.onWheel(
          grid,
          new WheelEvent('wheel', {
            deltaY: -3,
            deltaMode: WheelEvent.DOM_DELTA_LINE,
            shiftKey: true
          })
        );
        if (Platform.IS_MAC) {
          expect(calls).to.deep.equal([[0, -3 * 20]]);
        } else {
          expect(calls).to.deep.equal([[-3 * 64, 0]]);
        }
      });

      it('should not swap when the browser already reports a horizontal delta', () => {
        const { grid, calls } = createFakeGrid();
        handler.onWheel(
          grid,
          new WheelEvent('wheel', { deltaX: 50, shiftKey: true })
        );
        expect(calls).to.deep.equal([[50, 0]]);
      });
    });
  });
});
