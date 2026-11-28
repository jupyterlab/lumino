// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { expect } from 'chai';

import {
  CellRenderer,
  DataGrid,
  DataModel,
  GraphicsContext,
  TextRenderer
} from '@lumino/datagrid';

import { MessageLoop } from '@lumino/messaging';

import { Widget } from '@lumino/widgets';

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
 * columns, and column headers 1 and 2 merged.
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
    return region === 'body' ? 2 : region === 'column-header' ? 1 : 0;
  }
  group(region: DataModel.CellRegion, index: number) {
    if (region === 'column-header') {
      return { r1: 0, r2: 0, c1: 1, c2: 2 };
    }
    const row = index === 0 ? 0 : 3;
    return { r1: row, r2: row, c1: 0, c2: 3 };
  }
  changeCell(
    row: number,
    column: number,
    region: DataModel.CellRegion = 'body'
  ): void {
    this.emitChanged({
      type: 'cells-changed',
      region,
      row,
      column,
      rowSpan: 1,
      columnSpan: 1
    });
  }
}

/**
 * A data grid which records the rectangles that it paints.
 */
class PaintRecordingGrid extends DataGrid {
  painted: Array<[number, number, number, number]> = [];

  protected paintContent(rx: number, ry: number, rw: number, rh: number): void {
    this.painted.push([rx, ry, rw, rh]);
    super.paintContent(rx, ry, rw, rh);
  }
}

/**
 * The rectangle of a cell range on the viewport, with the default sizes: a
 * 64 px row header, a 20 px column header and cells of 64 by 20 px.
 */
function cellRect(
  region: 'body' | 'column-header',
  r1: number,
  c1: number,
  r2: number,
  c2: number
): [number, number, number, number] {
  const top = region === 'body' ? 20 : 0;
  return [64 + 64 * c1, top + 20 * r1, 64 * (c2 - c1 + 1), 20 * (r2 - r1 + 1)];
}

/**
 * Many rows and ten columns, with one group across all columns on every
 * 10th body row (#865). Records the reads of the data and of the groups.
 */
class ManyGroupsModel extends DataModel {
  dataReads: Array<[number, number]> = [];
  groupReads = 0;

  constructor(
    private rows: number,
    private groups: number
  ) {
    super();
  }
  rowCount(region: DataModel.RowRegion): number {
    return region === 'body' ? this.rows : 1;
  }
  columnCount(region: DataModel.ColumnRegion): number {
    return region === 'body' ? 10 : 1;
  }
  data(region: DataModel.CellRegion, row: number, column: number): string {
    if (region === 'body') {
      this.dataReads.push([row, column]);
    }
    return `${row},${column}`;
  }
  groupCount(region: DataModel.CellRegion): number {
    return region === 'body' ? this.groups : 0;
  }
  group(region: DataModel.CellRegion, index: number) {
    this.groupReads++;
    return { r1: index * 10, r2: index * 10, c1: 0, c2: 9 };
  }
}

/**
 * A cell renderer which records the config of each painted cell.
 */
class RecordingRenderer extends TextRenderer {
  configs: CellRenderer.CellConfig[] = [];

  paint(gc: GraphicsContext, config: CellRenderer.CellConfig): void {
    this.configs.push({ ...config });
    super.paint(gc, config);
  }
}

/**
 * A data grid which can repaint all its content from a test.
 */
class RepaintableGrid extends DataGrid {
  repaintAll(): void {
    this.repaintContent();
    MessageLoop.flush();
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

  describe('MergedModel', () => {
    describe('changeCell()', () => {
      let grid: PaintRecordingGrid;
      let merged: MergedModel;

      beforeEach(() => {
        merged = new MergedModel();
        grid = new PaintRecordingGrid();
        grid.dataModel = merged;
        grid.node.style.width = '400px';
        grid.node.style.height = '200px';
        Widget.attach(grid, document.body);
        MessageLoop.flush();
        grid.painted = [];
      });

      afterEach(() => {
        grid.dispose();
      });

      it('should repaint the whole merged cell of a changed cell', () => {
        merged.changeCell(3, 2);
        MessageLoop.flush();
        expect(grid.painted).to.deep.equal([cellRect('body', 3, 0, 3, 3)]);
      });

      it('should repaint the whole merged cell in row 0', () => {
        merged.changeCell(0, 1);
        MessageLoop.flush();
        expect(grid.painted).to.deep.equal([cellRect('body', 0, 0, 0, 3)]);
      });

      it('should repaint the whole merged cell of a changed header cell', () => {
        merged.changeCell(0, 2, 'column-header');
        MessageLoop.flush();
        expect(grid.painted).to.deep.equal([
          cellRect('column-header', 0, 1, 0, 2)
        ]);
      });

      it('should repaint only a changed cell outside merged cells', () => {
        merged.changeCell(1, 1);
        MessageLoop.flush();
        expect(grid.painted).to.deep.equal([cellRect('body', 1, 1, 1, 1)]);
      });
    });

    describe('paint', () => {
      it('should paint a merged cell as wide as its columns of different sizes', () => {
        const merged = new MergedModel();
        const renderer = new RecordingRenderer();
        const grid = new RepaintableGrid();
        grid.cellRenderers.update({ body: renderer });
        grid.dataModel = merged;
        grid.node.style.width = '500px';
        grid.node.style.height = '200px';
        Widget.attach(grid, document.body);
        grid.resizeColumn('body', 1, 100);
        MessageLoop.flush();
        renderer.configs = [];
        grid.repaintAll();
        const mergedRow3 = renderer.configs.filter(
          config => config.row === 3 && config.column === 0
        );
        expect(mergedRow3.map(config => config.width)).to.deep.equal([
          64 + 100 + 64 + 64
        ]);
        expect(mergedRow3.map(config => config.height)).to.deep.equal([20]);
        grid.dispose();
      });
    });
  });

  describe('ManyGroupsModel', () => {
    let grid: RepaintableGrid;
    let groupModel: ManyGroupsModel;

    beforeEach(() => {
      groupModel = new ManyGroupsModel(20_000, 1_000);
      grid = new RepaintableGrid();
      grid.dataModel = groupModel;
      grid.node.style.width = '600px';
      grid.node.style.height = '260px';
      Widget.attach(grid, document.body);
      MessageLoop.flush();
    });

    afterEach(() => {
      grid.dispose();
    });

    it('should not read the data of merged cells outside the viewport when scrolling', () => {
      groupModel.dataReads = [];
      grid.scrollTo(0, 20);
      MessageLoop.flush();
      const rows = groupModel.dataReads.map(([row]) => row);
      expect(rows.length).to.be.greaterThan(0);
      expect(Math.max(...rows)).to.be.lessThan(20);
    });

    it('should not go through every group for every painted cell', () => {
      groupModel.dataReads = [];
      groupModel.groupReads = 0;
      grid.repaintAll();
      expect(groupModel.dataReads.length).to.be.greaterThan(0);
      // About 50 visible body cells outside the merged rows: a few scans of
      // the groups per paint, not one per cell.
      expect(groupModel.groupReads).to.be.lessThan(10 * 1_000);
    });
  });
});
