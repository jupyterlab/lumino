// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { expect } from 'chai';

import { BasicMouseHandler, DataGrid } from '@lumino/datagrid';

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

describe('@lumino/datagrid', () => {
  describe('BasicMouseHandler', () => {
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

      it('should scroll horizontally when Shift is held', () => {
        const { grid, calls } = createFakeGrid();
        handler.onWheel(
          grid,
          new WheelEvent('wheel', { deltaY: 50, shiftKey: true })
        );
        expect(calls).to.deep.equal([[50, 0]]);
      });

      it('should use the column width for line-mode Shift + wheel', () => {
        const { grid, calls } = createFakeGrid();
        handler.onWheel(
          grid,
          new WheelEvent('wheel', {
            deltaY: -3,
            deltaMode: WheelEvent.DOM_DELTA_LINE,
            shiftKey: true
          })
        );
        expect(calls).to.deep.equal([[-3 * 64, 0]]);
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
