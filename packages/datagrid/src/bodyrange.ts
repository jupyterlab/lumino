// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { CellGroup } from './cellgroup';

import { DataModel } from './datamodel';

import { SelectionModel } from './selectionmodel';

/**
 * Ranges of cells selected in the body by the mouse or the keys.
 *
 * #### Notes
 * A range is stored joined with the merged cells it covers, so that it is
 * drawn and copied as it is stored. The range as it was made is kept as
 * well, and the handlers extend that one: Shift and an arrow key can then
 * shrink a range back out of a merged cell.
 *
 * This module is internal to the package.
 */
export namespace BodyRange {
  /**
   * Select a range of body cells, joined with the merged cells it covers.
   *
   * @param dataModel - The data model of the grid.
   *
   * @param model - The selection model of the grid.
   *
   * @param args - The range as made, and the cursor and clear mode.
   *
   * #### Notes
   * A single cell is selected as is, since the cursor already covers its
   * merged cell. Merged cells whose `widenSelections` is `false` are not
   * joined.
   */
  export function select(
    dataModel: DataModel,
    model: SelectionModel,
    args: SelectionModel.SelectArgs
  ): void {
    const made = clampToBody(dataModel, args);
    const joined =
      made.r1 === made.r2 && made.c1 === made.c2
        ? made
        : CellGroup.joinCellGroupWithMergedCellGroups(
            dataModel,
            made,
            'body',
            widensSelections
          );
    model.select({ ...args, ...joined });
    const stored = model.currentSelection();
    if (stored) {
      ranges.set(model, { made, stored });
    }
  }

  /**
   * Whether a selection is the last range selected with `select`.
   */
  export function isRange(
    model: SelectionModel,
    selection: SelectionModel.Selection
  ): boolean {
    const entry = ranges.get(model);
    return !!entry && entry.stored === selection;
  }

  /**
   * Get a selection as it was made, if it is the last range selected
   * with `select`, or else the selection itself.
   */
  export function asMade(
    model: SelectionModel,
    selection: SelectionModel.Selection
  ): SelectionModel.Selection {
    const entry = ranges.get(model);
    return entry && entry.stored === selection ? entry.made : selection;
  }

  /**
   * Whether a selection spans every row or every column of the body, as a
   * header press selects them.
   */
  export function isWholeRowsOrColumns(
    dataModel: DataModel,
    selection: SelectionModel.Selection
  ): boolean {
    const { r1, c1, r2, c2 } = selection;
    const maxRow = dataModel.rowCount('body') - 1;
    const maxColumn = dataModel.columnCount('body') - 1;
    return (
      (Math.min(r1, r2) <= 0 && Math.max(r1, r2) >= maxRow) ||
      (Math.min(c1, c2) <= 0 && Math.max(c1, c2) >= maxColumn)
    );
  }

  /**
   * The last range selected with `select`, as made and as stored, by
   * selection model.
   */
  const ranges = new WeakMap<
    SelectionModel,
    { made: SelectionModel.Selection; stored: SelectionModel.Selection }
  >();

  /**
   * Whether a range across part of a merged cell group widens to cover it.
   */
  function widensSelections(group: CellGroup): boolean {
    return group.widenSelections !== false;
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
