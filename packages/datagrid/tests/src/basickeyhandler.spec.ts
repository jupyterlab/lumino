// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { expect } from 'chai';

import {
  BasicKeyHandler,
  BasicMouseHandler,
  BasicSelectionModel,
  DataGrid,
  DataModel
} from '@lumino/datagrid';

import { MessageLoop } from '@lumino/messaging';

import { Widget } from '@lumino/widgets';

/**
 * The grid of #864: six rows and four columns, with body row 3 merged
 * across all columns.
 */
class MergedModel extends DataModel {
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
    return region === 'body' ? 1 : 0;
  }
  group(region: DataModel.CellRegion, index: number) {
    return { r1: 3, r2: 3, c1: 0, c2: 3 };
  }
}

const keyCodes = { ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40 };

describe('@lumino/datagrid', () => {
  describe('BasicKeyHandler', () => {
    let handler: BasicKeyHandler;
    let grid: DataGrid;

    /**
     * Put the cursor on a cell, as a click does.
     */
    function selectCell(row: number, column: number): void {
      grid.selectionModel!.select({
        r1: row,
        c1: column,
        r2: row,
        c2: column,
        cursorRow: row,
        cursorColumn: column,
        clear: 'all'
      });
    }

    /**
     * Press an arrow key, with Shift unless told otherwise.
     */
    function press(key: keyof typeof keyCodes, shiftKey = true): void {
      handler.onKeyDown(
        grid,
        new KeyboardEvent('keydown', { keyCode: keyCodes[key], shiftKey })
      );
    }

    beforeEach(() => {
      const model = new MergedModel();
      handler = new BasicKeyHandler();
      grid = new DataGrid();
      grid.dataModel = model;
      grid.selectionModel = new BasicSelectionModel({ dataModel: model });
      grid.node.style.width = '500px';
      grid.node.style.height = '300px';
      Widget.attach(grid, document.body);
      MessageLoop.flush();
    });

    afterEach(() => {
      handler.dispose();
      grid.dispose();
    });

    describe('#onKeyDown()', () => {
      it('should join a range extended into a merged cell', () => {
        selectCell(2, 3);
        press('ArrowDown');
        expect(grid.selectionModel!.currentSelection()).to.deep.equal({
          r1: 2,
          c1: 0,
          r2: 3,
          c2: 3
        });
        expect(grid.selectionModel!.cursorRow).to.equal(2);
        expect(grid.selectionModel!.cursorColumn).to.equal(3);
      });

      it('should shrink a range back out of a merged cell', () => {
        selectCell(2, 3);
        press('ArrowDown');
        press('ArrowUp');
        expect(grid.selectionModel!.currentSelection()).to.deep.equal({
          r1: 2,
          c1: 3,
          r2: 2,
          c2: 3
        });
      });

      it('should return to the cell from a column inside the merged cell', () => {
        selectCell(2, 1);
        press('ArrowDown');
        press('ArrowDown');
        expect(grid.selectionModel!.currentSelection()).to.deep.equal({
          r1: 2,
          c1: 0,
          r2: 4,
          c2: 3
        });
        press('ArrowUp');
        press('ArrowUp');
        expect(grid.selectionModel!.currentSelection()).to.deep.equal({
          r1: 2,
          c1: 1,
          r2: 2,
          c2: 1
        });
      });

      it('should not extend a range past the edge of the grid', () => {
        selectCell(2, 0);
        press('ArrowLeft');
        press('ArrowLeft');
        press('ArrowRight');
        expect(grid.selectionModel!.currentSelection()).to.deep.equal({
          r1: 2,
          c1: 0,
          r2: 2,
          c2: 1
        });
      });

      it('should extend whole columns as whole columns', () => {
        // As a press on the "col 1" header selects it.
        grid.selectionModel!.select({
          r1: 0,
          c1: 1,
          r2: Infinity,
          c2: 1,
          cursorRow: 0,
          cursorColumn: 1,
          clear: 'all'
        });
        press('ArrowRight');
        expect(grid.selectionModel!.currentSelection()).to.deep.equal({
          r1: 0,
          c1: 1,
          r2: 5,
          c2: 2
        });
      });

      it('should extend a dragged range as it was made', () => {
        const mouse = new BasicMouseHandler();
        const rect = grid.viewport.node.getBoundingClientRect();
        const point = (row: number, column: number) => ({
          clientX: rect.left + grid.headerWidth + 64 * column + 32,
          clientY: rect.top + grid.headerHeight + 20 * row + 10
        });
        mouse.onMouseDown(grid, new MouseEvent('mousedown', point(1, 1)));
        mouse.onMouseMove(grid, new MouseEvent('mousemove', point(5, 1)));
        mouse.onMouseUp(grid, new MouseEvent('mouseup', point(5, 1)));
        mouse.dispose();
        press('ArrowUp');
        press('ArrowUp');
        press('ArrowUp');
        expect(grid.selectionModel!.currentSelection()).to.deep.equal({
          r1: 1,
          c1: 1,
          r2: 2,
          c2: 1
        });
      });
    });
  });
});
