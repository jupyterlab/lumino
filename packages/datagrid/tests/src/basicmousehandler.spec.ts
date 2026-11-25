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
  constructor(
    private headerGroup = false,
    private widenSelections = true
  ) {
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
        ? {
            r1: 3,
            r2: 3,
            c1: 0,
            c2: 3,
            widenSelections: this.widenSelections
          }
        : { r1: 1, r2: 2, c1: 0, c2: 0 };
    }
    return { r1: 0, r2: 0, c1: 2, c2: 3 };
  }
}

/**
 * Six rows and four columns with two rows of column headers: column
 * headers 0 to 1 are merged in the first header row and 1 to 2 in the
 * second, and row headers 1 to 2 are merged.
 */
class HeaderModel extends DataModel {
  constructor(private widenSelections = true) {
    super();
  }
  rowCount(region: DataModel.RowRegion): number {
    return region === 'body' ? 6 : 2;
  }
  columnCount(region: DataModel.ColumnRegion): number {
    return region === 'body' ? 4 : 1;
  }
  data(region: DataModel.CellRegion, row: number, column: number): string {
    return `${region} ${row},${column}`;
  }
  groupCount(region: DataModel.CellRegion): number {
    return region === 'column-header' ? 2 : region === 'row-header' ? 1 : 0;
  }
  group(region: DataModel.CellRegion, index: number) {
    if (region === 'row-header') {
      return { r1: 1, r2: 2, c1: 0, c2: 0 };
    }
    return {
      r1: index,
      r2: index,
      c1: index,
      c2: index + 1,
      widenSelections: this.widenSelections
    };
  }
}

/**
 * Attach a grid of a model, with a basic selection model.
 */
function attachGrid(
  model: DataModel,
  selectionMode: 'cell' | 'row' | 'column' = 'cell'
): DataGrid {
  const grid = new DataGrid();
  grid.dataModel = model;
  grid.selectionModel = new BasicSelectionModel({
    dataModel: model,
    selectionMode
  });
  grid.node.style.width = '500px';
  grid.node.style.height = '300px';
  Widget.attach(grid, document.body);
  MessageLoop.flush();
  return grid;
}

/**
 * A grid of a merged model, attached, with a basic selection model.
 */
function createMergedGrid(
  headerGroup = false,
  selectionMode: 'cell' | 'row' | 'column' = 'cell',
  widenSelections = true
): DataGrid {
  return attachGrid(
    new MergedModel(headerGroup, widenSelections),
    selectionMode
  );
}

/**
 * Press the middle of a header cell.
 */
function pressHeader(
  handler: BasicMouseHandler,
  grid: DataGrid,
  region: 'column-header' | 'row-header',
  index: number,
  shiftKey = false
): void {
  const rect = grid.viewport.node.getBoundingClientRect();
  const clientX =
    region === 'column-header'
      ? rect.left + grid.headerWidth + 64 * index + 32
      : rect.left + grid.headerWidth / 2;
  const clientY =
    region === 'column-header'
      ? rect.top + grid.defaultSizes.columnHeaderHeight / 2
      : rect.top + grid.headerHeight + 20 * index + 10;
  handler.onMouseDown(
    grid,
    new MouseEvent('mousedown', { clientX, clientY, shiftKey })
  );
  handler.onMouseUp(grid, new MouseEvent('mouseup'));
}

/**
 * The client position of the middle of a body cell.
 */
function bodyPoint(
  grid: DataGrid,
  row: number,
  column: number
): MouseEventInit {
  const rect = grid.viewport.node.getBoundingClientRect();
  return {
    clientX: rect.left + grid.headerWidth + 64 * column + 32,
    clientY: rect.top + grid.headerHeight + 20 * row + 10
  };
}

/**
 * Press a body cell, optionally with Shift.
 */
function pressBody(
  handler: BasicMouseHandler,
  grid: DataGrid,
  row: number,
  column: number,
  shiftKey = false
): void {
  handler.onMouseDown(
    grid,
    new MouseEvent('mousedown', { ...bodyPoint(grid, row, column), shiftKey })
  );
}

/**
 * Drag from one body cell to another.
 */
function dragBody(
  handler: BasicMouseHandler,
  grid: DataGrid,
  from: [number, number],
  to: [number, number]
): void {
  pressBody(handler, grid, from[0], from[1]);
  handler.onMouseMove(
    grid,
    new MouseEvent('mousemove', bodyPoint(grid, to[0], to[1]))
  );
  handler.onMouseUp(grid, new MouseEvent('mouseup', bodyPoint(grid, ...to)));
}

/**
 * The alpha of the selection overlay in the middle of a body cell.
 */
function overlayAlpha(grid: DataGrid, row: number, column: number): number {
  MessageLoop.flush();
  const canvases = grid.viewport.node.querySelectorAll('canvas');
  const overlay = canvases[canvases.length - 1];
  const ratio = overlay.width / overlay.getBoundingClientRect().width;
  const x = (grid.headerWidth + 64 * column + 32) * ratio;
  const y = (grid.headerHeight + 20 * row + 10) * ratio;
  return overlay.getContext('2d')!.getImageData(x, y, 1, 1).data[3];
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

      it('should join a header range with the whole merged header it crosses', () => {
        grid = createMergedGrid(true);
        pressHeader(handler, grid, 'column-header', 0);
        pressHeader(handler, grid, 'column-header', 3, true);
        expect(grid.selectionModel!.currentSelection()).to.deep.equal({
          r1: 0,
          c1: 0,
          r2: 5,
          c2: 3
        });
      });

      it('should join the merged headers that a merged header reaches', () => {
        grid = attachGrid(new HeaderModel());
        pressHeader(handler, grid, 'column-header', 0);
        expect(grid.selectionModel!.currentSelection()).to.deep.equal({
          r1: 0,
          c1: 0,
          r2: 5,
          c2: 2
        });
      });

      it('should select both rows of a merged row header', () => {
        grid = attachGrid(new HeaderModel());
        pressHeader(handler, grid, 'row-header', 1);
        expect(grid.selectionModel!.currentSelection()).to.deep.equal({
          r1: 1,
          c1: 0,
          r2: 2,
          c2: 3
        });
      });

      it('should not join merged headers that do not widen selections', () => {
        grid = attachGrid(new HeaderModel(false));
        pressHeader(handler, grid, 'column-header', 0);
        expect(grid.selectionModel!.currentSelection()).to.deep.equal({
          r1: 0,
          c1: 0,
          r2: 5,
          c2: 0
        });
      });

      it('should keep the order of a header range made backwards', () => {
        grid = createMergedGrid(true);
        pressHeader(handler, grid, 'column-header', 2);
        pressHeader(handler, grid, 'column-header', 0, true);
        expect(grid.selectionModel!.currentSelection()).to.deep.equal({
          r1: 0,
          c1: 3,
          r2: 5,
          c2: 0
        });
      });

      it('should highlight only the pressed column', () => {
        grid = createMergedGrid();
        pressHeader(handler, grid, 'column-header', 1);
        expect(overlayAlpha(grid, 1, 1)).to.be.above(0);
        expect(overlayAlpha(grid, 1, 2)).to.equal(0);
        expect(overlayAlpha(grid, 3, 2)).to.equal(0);
      });

      it('should not widen a Shift+click range across a group that does not widen selections', () => {
        grid = createMergedGrid(false, 'cell', false);
        pressBody(handler, grid, 1, 1);
        handler.onMouseUp(grid, new MouseEvent('mouseup'));
        pressBody(handler, grid, 5, 1, true);
        expect(grid.selectionModel!.currentSelection()).to.deep.equal({
          r1: 1,
          c1: 1,
          r2: 5,
          c2: 1
        });
      });

      it('should join a Shift+click range with the merged cells it covers', () => {
        grid = createMergedGrid();
        pressBody(handler, grid, 1, 1);
        handler.onMouseUp(grid, new MouseEvent('mouseup'));
        pressBody(handler, grid, 5, 1, true);
        expect(grid.selectionModel!.currentSelection()).to.deep.equal({
          r1: 1,
          c1: 0,
          r2: 5,
          c2: 3
        });
        expect(grid.selectionModel!.cursorRow).to.equal(1);
        expect(grid.selectionModel!.cursorColumn).to.equal(1);
      });
    });

    describe('#onMouseMove()', () => {
      let handler: BasicMouseHandler;
      let grid: DataGrid;

      beforeEach(() => {
        handler = new BasicMouseHandler();
      });

      afterEach(() => {
        handler.dispose();
        grid.dispose();
      });

      it('should join a dragged range with the merged cells it covers', () => {
        grid = createMergedGrid();
        dragBody(handler, grid, [1, 1], [5, 1]);
        expect(grid.selectionModel!.currentSelection()).to.deep.equal({
          r1: 1,
          c1: 0,
          r2: 5,
          c2: 3
        });
        expect(overlayAlpha(grid, 4, 3)).to.be.above(0);
      });

      it('should not widen a dragged range across a group that does not widen selections', () => {
        grid = createMergedGrid(false, 'cell', false);
        dragBody(handler, grid, [1, 1], [5, 1]);
        expect(grid.selectionModel!.currentSelection()).to.deep.equal({
          r1: 1,
          c1: 1,
          r2: 5,
          c2: 1
        });
      });

      it('should keep the corner order of a range dragged up and left', () => {
        grid = createMergedGrid();
        // Row 3 widens the range to column 0, whose merged cell reaches row 1.
        dragBody(handler, grid, [5, 2], [2, 1]);
        expect(grid.selectionModel!.currentSelection()).to.deep.equal({
          r1: 5,
          c1: 3,
          r2: 1,
          c2: 0
        });
      });

      it('should end a joined range at row or column 0', () => {
        grid = createMergedGrid();
        dragBody(handler, grid, [0, 0], [1, 0]);
        expect(grid.selectionModel!.currentSelection()).to.deep.equal({
          r1: 0,
          c1: 0,
          r2: 2,
          c2: 0
        });
      });

      it('should keep a drag within a merged cell a single cell', () => {
        grid = createMergedGrid();
        dragBody(handler, grid, [3, 1], [3, 1]);
        expect(grid.selectionModel!.currentSelection()).to.deep.equal({
          r1: 3,
          c1: 1,
          r2: 3,
          c2: 1
        });
      });

      it('should select whole columns without the body merged cells in column mode', () => {
        grid = createMergedGrid(false, 'column');
        dragBody(handler, grid, [2, 0], [2, 1]);
        expect(grid.selectionModel!.currentSelection()).to.deep.equal({
          r1: 0,
          c1: 0,
          r2: 5,
          c2: 1
        });
      });

      it('should select whole rows without the body merged cells in row mode', () => {
        grid = createMergedGrid(false, 'row');
        dragBody(handler, grid, [2, 1], [2, 2]);
        expect(grid.selectionModel!.currentSelection()).to.deep.equal({
          r1: 2,
          c1: 0,
          r2: 2,
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
