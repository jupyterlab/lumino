// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { CellGroup } from './cellgroup';

import { DataGrid } from './datagrid';

import { DataModel } from './datamodel';

import { SelectionModel } from './selectionmodel';

/**
 * The selections made by the mouse and key handlers.
 *
 * #### Notes
 * A selection of body cells is stored joined with the merged cells it
 * covers, so that it is drawn and copied as it is stored. Whole rows or
 * columns from a header are not joined with the body's merged cells: a
 * selection that starts from a header stays whole rows or columns while
 * it spans every row or column, and joins like any range once Shift makes
 * it a range of cells.
 *
 * The last selection made here is remembered, so that the handlers extend
 * a range as it was made rather than as it was joined: Shift and an arrow
 * key can then shrink a range back out of a merged cell.
 *
 * This module is internal to the package.
 */
export namespace HandlerSelection {
  /**
   * Select a range of body cells, joined with the merged cells it covers.
   *
   * @param grid - The data grid of interest.
   *
   * @param args - The range as made, and the cursor and clear mode.
   *
   * #### Notes
   * A cell of a merged cell selects the whole merged cell, which the cursor
   * covers.
   */
  export function selectRange(
    grid: DataGrid,
    args: SelectionModel.SelectArgs
  ): void {
    joinAndSelect(grid, args, false);
  }

  /**
   * Select whole rows or columns, as a header press does, without joining
   * the body's merged cells.
   *
   * @param grid - The data grid of interest.
   *
   * @param args - The selection, and the cursor and clear mode.
   */
  export function selectLines(
    grid: DataGrid,
    args: SelectionModel.SelectArgs
  ): void {
    const model = grid.selectionModel;
    if (!model) {
      return;
    }
    model.select(args);
    remember(model, null, true);
  }

  /**
   * Extend the current selection to a new range, as Shift does with a key
   * or a click, and as a drag does.
   *
   * @param grid - The data grid of interest.
   *
   * @param args - The new range as made, and the cursor and clear mode.
   *
   * #### Notes
   * A selection that started from a header stays whole rows or columns
   * while the new range spans every row or column. Any other range joins
   * the merged cells it covers.
   */
  export function extend(
    grid: DataGrid,
    args: SelectionModel.SelectArgs
  ): void {
    const model = grid.selectionModel;
    const dataModel = grid.dataModel;
    if (!model || !dataModel) {
      return;
    }
    const current = model.currentSelection();
    const fromHeader =
      !!current && startedFromHeader(model, dataModel, current);
    if (fromHeader && isWholeRowsOrColumns(dataModel, args)) {
      selectLines(grid, args);
    } else {
      joinAndSelect(grid, args, fromHeader);
    }
  }

  /**
   * Get a selection as it was made, if it is the last selection made here,
   * or else the selection itself.
   */
  export function asMade(
    model: SelectionModel,
    selection: SelectionModel.Selection
  ): SelectionModel.Selection {
    const entry = entries.get(model);
    return entry && sameCells(entry.stored, selection) ? entry.made : selection;
  }

  /**
   * Join a range with the merged cells of a region that it covers, and
   * with the merged cells that those reach in turn.
   *
   * @param dataModel - The data model of the grid.
   *
   * @param region - The region of the range.
   *
   * @param range - The range to join, with its corners in either order.
   *
   * @returns The joined range, with its corners in the order of the
   * range's corners.
   *
   * #### Notes
   * Merged cells whose `widenSelections` is `false` are not joined. The
   * cost depends on the number of merged cells, not on the size of the
   * range.
   */
  export function joinMergedCells(
    dataModel: DataModel,
    region: DataModel.CellRegion,
    range: SelectionModel.Selection
  ): SelectionModel.Selection {
    let r1 = Math.min(range.r1, range.r2);
    let r2 = Math.max(range.r1, range.r2);
    let c1 = Math.min(range.c1, range.c2);
    let c2 = Math.max(range.c1, range.c2);
    const groups = CellGroup.getCellGroupsAtRegion(dataModel, region);
    let changed = true;
    while (changed) {
      changed = false;
      for (const group of groups) {
        if (
          group.widenSelections === false ||
          group.r2 < r1 ||
          group.r1 > r2 ||
          group.c2 < c1 ||
          group.c1 > c2
        ) {
          continue;
        }
        if (group.r1 < r1 || group.r2 > r2 || group.c1 < c1 || group.c2 > c2) {
          r1 = Math.min(r1, group.r1);
          r2 = Math.max(r2, group.r2);
          c1 = Math.min(c1, group.c1);
          c2 = Math.max(c2, group.c2);
          changed = true;
        }
      }
    }
    const down = range.r1 <= range.r2;
    const right = range.c1 <= range.c2;
    return {
      r1: down ? r1 : r2,
      c1: right ? c1 : c2,
      r2: down ? r2 : r1,
      c2: right ? c2 : c1
    };
  }

  /**
   * Select a range of body cells joined with the merged cells it covers,
   * and remember it as made.
   */
  function joinAndSelect(
    grid: DataGrid,
    args: SelectionModel.SelectArgs,
    fromHeader: boolean
  ): void {
    const model = grid.selectionModel;
    const dataModel = grid.dataModel;
    if (!model || !dataModel) {
      return;
    }
    const made = clampToBody(dataModel, args);
    model.select({ ...args, ...joinMergedCells(dataModel, 'body', made) });
    remember(model, made, fromHeader);
  }

  /**
   * Whether a selection started from a header: as remembered if it is the
   * last selection made here, or else if it spans every row or column.
   */
  function startedFromHeader(
    model: SelectionModel,
    dataModel: DataModel,
    selection: SelectionModel.Selection
  ): boolean {
    const entry = entries.get(model);
    if (entry && sameCells(entry.stored, selection)) {
      return entry.fromHeader;
    }
    return isWholeRowsOrColumns(dataModel, selection);
  }

  /**
   * Whether a selection of more than one cell spans every row or every
   * column of the body.
   */
  function isWholeRowsOrColumns(
    dataModel: DataModel,
    selection: SelectionModel.Selection
  ): boolean {
    const { r1, c1, r2, c2 } = selection;
    if (r1 === r2 && c1 === c2) {
      return false;
    }
    const maxRow = dataModel.rowCount('body') - 1;
    const maxColumn = dataModel.columnCount('body') - 1;
    return (
      (Math.min(r1, r2) <= 0 && Math.max(r1, r2) >= maxRow) ||
      (Math.min(c1, c2) <= 0 && Math.max(c1, c2) >= maxColumn)
    );
  }

  /**
   * The last selection made here, by selection model: the cells as made,
   * the cells as stored, and whether it started from a header.
   *
   * #### Notes
   * The cells are compared rather than the selection objects, because a
   * selection model may replace its objects, for example when rows are
   * added, and may return copies.
   */
  const entries = new WeakMap<
    SelectionModel,
    {
      made: SelectionModel.Selection;
      stored: SelectionModel.Selection;
      fromHeader: boolean;
    }
  >();

  /**
   * Remember the current selection of a selection model as the last one
   * made here.
   */
  function remember(
    model: SelectionModel,
    made: SelectionModel.Selection | null,
    fromHeader: boolean
  ): void {
    const current = model.currentSelection();
    if (!current) {
      entries.delete(model);
      return;
    }
    const stored = {
      r1: current.r1,
      c1: current.c1,
      r2: current.r2,
      c2: current.c2
    };
    entries.set(model, { made: made || stored, stored, fromHeader });
  }

  /**
   * Whether two selections cover the same cells with the same corners.
   */
  function sameCells(
    a: SelectionModel.Selection,
    b: SelectionModel.Selection
  ): boolean {
    return a.r1 === b.r1 && a.c1 === b.c1 && a.r2 === b.r2 && a.c2 === b.c2;
  }

  /**
   * Clamp a selection to the body of a data model.
   */
  function clampToBody(
    dataModel: DataModel,
    selection: SelectionModel.Selection
  ): SelectionModel.Selection {
    const maxRow = dataModel.rowCount('body') - 1;
    const maxColumn = dataModel.columnCount('body') - 1;
    return {
      r1: Math.max(0, Math.min(selection.r1, maxRow)),
      c1: Math.max(0, Math.min(selection.c1, maxColumn)),
      r2: Math.max(0, Math.min(selection.r2, maxRow)),
      c2: Math.max(0, Math.min(selection.c2, maxColumn))
    };
  }
}
