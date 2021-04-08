import { DataModel } from "./datamodel";
import { SectionList } from "./sectionlist";

/**
 * An interface describing a merged cell group.
 */
export interface CellGroup {
  startRow: number;
  endRow: number;
  startColumn: number;
  endColumn: number;
}

/**
 * A collection of helper functions relating to merged cell groups
 */
export namespace CellGroup {
  export function areCellsMerged(
    dataModel: DataModel,
    rgn: DataModel.CellRegion,
    cell1: number[],
    cell2: number[]
  ): boolean {
    const numGroups = dataModel.groupCount(rgn);
    const [row1, column1] = cell1;
    const [row2, column2] = cell2;

    for (let i = 0; i < numGroups; i++) {
      const group = dataModel.group(rgn, i)!;
      if (
        row1 >= group.startRow &&
        row1 <= group.endRow &&
        column1 >= group.startColumn &&
        column1 <= group.endColumn &&
        row2 >= group.startRow &&
        row2 <= group.endRow &&
        column2 >= group.startColumn &&
        column2 <= group.endColumn
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Calculates the cell boundary offsets needed for
   * a row or column at the given index by taking
   * into account merged cell groups in the region.
   * @param dataModel
   * @param regions
   * @param axis
   * @param sectionList
   * @param index
   */
  export function calculateMergeOffsets(
    dataModel: DataModel,
    regions: DataModel.CellRegion[],
    axis: "row" | "column",
    sectionList: SectionList,
    index: number
  ): [number, number, CellGroup] {
    let mergeStartOffset = 0;
    let mergeEndOffset = 0;
    let mergedCellGroups: CellGroup[] = [];

    for (const region of regions) {
      mergedCellGroups = mergedCellGroups.concat(
        getCellGroupsAtRegion(dataModel, region)
      );
    }

    let groupsAtAxis: CellGroup[] = [];

    if (axis === "row") {
      for (const region of regions) {
        groupsAtAxis = groupsAtAxis.concat(
          getCellGroupsAtRow(dataModel, region, index)
        );
      }
    } else {
      for (const region of regions) {
        groupsAtAxis = groupsAtAxis.concat(
          getCellGroupsAtColumn(dataModel, region, index)
        );
      }
    }

    if (groupsAtAxis.length === 0) {
      return [
        0,
        0,
        { startRow: -1, endRow: -1, startColumn: -1, endColumn: -1 },
      ];
    }

    let joinedGroup = groupsAtAxis[0];

    for (let g = 0; g < mergedCellGroups.length; g++) {
      const group = mergedCellGroups[g];
      if (areCellGroupsIntersectingAtAxis(joinedGroup, group, axis)) {
        joinedGroup = joinCellGroups([group, joinedGroup]);
        mergedCellGroups.splice(g, 1);
        g = 0;
      }
    }

    let minRow = joinedGroup.startRow;
    let maxRow = joinedGroup.endRow;

    for (let r = index - 1; r >= minRow; r--) {
      mergeStartOffset += sectionList.sizeOf(r);
    }

    for (let r = index + 1; r <= maxRow; r++) {
      mergeEndOffset += sectionList.sizeOf(r);
    }

    return [mergeStartOffset, mergeEndOffset, joinedGroup];
  }

  /**
   * Checks if two cell-groups are intersecting
   * in the given axis.
   * @param group1
   * @param group2
   * @param axis
   */
  export function areCellGroupsIntersectingAtAxis(
    group1: CellGroup,
    group2: CellGroup,
    axis: "row" | "column"
  ): boolean {
    if (axis === "row") {
      return (
        (group1.startRow >= group2.startRow &&
          group1.startRow <= group2.endRow) ||
        (group1.endRow >= group2.startRow && group1.endRow <= group2.endRow) ||
        (group2.startRow >= group1.startRow &&
          group2.startRow <= group1.endRow) ||
        (group2.endRow >= group1.startRow && group2.endRow <= group1.endRow)
      );
    }
    return (
      (group1.startColumn >= group2.startColumn &&
        group1.startColumn <= group2.endColumn) ||
      (group1.endColumn >= group2.startColumn &&
        group1.endColumn <= group2.endColumn) ||
      (group2.startColumn >= group1.startColumn &&
        group2.startColumn <= group1.endColumn) ||
      (group2.endColumn >= group1.startColumn &&
        group2.endColumn <= group1.endColumn)
    );
  }

  /**
   * Checks if cell-groups are intersecting.
   * @param group1
   * @param group2
   */
  export function areCellGroupsIntersecting(
    group1: CellGroup,
    group2: CellGroup
  ): boolean {
    return (
      ((group1.startRow >= group2.startRow &&
        group1.startRow <= group2.endRow) ||
        (group1.endRow >= group2.startRow && group1.endRow <= group2.endRow) ||
        (group2.startRow >= group1.startRow &&
          group2.startRow <= group1.endRow) ||
        (group2.endRow >= group1.startRow && group2.endRow <= group1.endRow)) &&
      ((group1.startColumn >= group2.startColumn &&
        group1.startColumn <= group2.endColumn) ||
        (group1.endColumn >= group2.startColumn &&
          group1.endColumn <= group2.endColumn) ||
        (group2.startColumn >= group1.startColumn &&
          group2.startColumn <= group1.endColumn) ||
        (group2.endColumn >= group1.startColumn &&
          group2.endColumn <= group1.endColumn))
    );
  }

  /**
   * Retrieves the index of the cell-group to which
   * the cell at the given row, column belongs.
   * @param dataModel
   * @param rgn
   * @param row
   * @param column
   */
  export function getGroupIndex(
    dataModel: DataModel,
    rgn: DataModel.CellRegion,
    row: number,
    column: number
  ): number {
    const numGroups = dataModel.groupCount(rgn);
    for (let i = 0; i < numGroups; i++) {
      const group = dataModel.group(rgn, i)!;
      if (
        row >= group.startRow &&
        row <= group.endRow &&
        column >= group.startColumn &&
        column <= group.endColumn
      ) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Returns a cell-group for the given row/index coordinates.
   * @param dataModel
   * @param rgn
   * @param row
   * @param column
   */
  export function getGroup(
    dataModel: DataModel,
    rgn: DataModel.CellRegion,
    row: number,
    column: number
  ): CellGroup | null {
    const groupIndex = getGroupIndex(dataModel, rgn, row, column);
    if (groupIndex === -1) {
      return null;
    }

    return dataModel.group(rgn, groupIndex);
  }

  /**
   * Returns all cell groups which belong to
   * a given cell cell region.
   * @param dataModel
   * @param rgn
   */
  export function getCellGroupsAtRegion(
    dataModel: DataModel,
    rgn: DataModel.CellRegion
  ): CellGroup[] {
    let groupsAtRegion: CellGroup[] = [];
    const numGroups = dataModel.groupCount(rgn);

    for (let i = 0; i < numGroups; i++) {
      const group = dataModel.group(rgn, i)!;
      groupsAtRegion.push(group);
    }
    return groupsAtRegion;
  }

  /**
   * Calculates and returns a merged cell-group from
   * two cell-group objects.
   * @param groups
   */
  export function joinCellGroups(groups: CellGroup[]): CellGroup {
    let startRow = Number.MAX_VALUE;
    let endRow = Number.MIN_VALUE;
    let startColumn = Number.MAX_VALUE;
    let endColumn = Number.MIN_VALUE;

    for (const group of groups) {
      startRow = Math.min(startRow, group.startRow);
      endRow = Math.max(endRow, group.endRow);
      startColumn = Math.min(startColumn, group.startColumn);
      endColumn = Math.max(endColumn, group.endColumn);
    }

    return { startRow, endRow, startColumn, endColumn };
  }

  /**
   * Merges a cell group with other cells groups in the
   * same region if they intersect.
   * @param dataModel the data model of the grid.
   * @param group the target cell group.
   * @param region the region wer're of the cell group.
   * @returns a new cell group after merging has happened.
   */
  export function joinCellGroupWithMergedCellGroups(
    dataModel: DataModel,
    group: CellGroup,
    region: DataModel.CellRegion
  ): CellGroup {
    let joinedGroup: CellGroup = { ...group };

    const mergedCellGroups: CellGroup[] = getCellGroupsAtRegion(
      dataModel,
      region
    );

    for (let g = 0; g < mergedCellGroups.length; g++) {
      const mergedGroup = mergedCellGroups[g];
      if (areCellGroupsIntersecting(joinedGroup, mergedGroup)) {
        joinedGroup = joinCellGroups([joinedGroup, mergedGroup]);
      }
    }

    return joinedGroup;
  }

  /**
   * Retrieves a list of cell groups intersecting at
   * a given row.
   * @param dataModel data model of the grid.
   * @param rgn the cell region.
   * @param row the target row to look for intersections at.
   * @returns all cell groups intersecting with the row.
   */
  export function getCellGroupsAtRow(
    dataModel: DataModel,
    rgn: DataModel.CellRegion,
    row: number
  ): CellGroup[] {
    let groupsAtRow = [];
    const numGroups = dataModel.groupCount(rgn);

    for (let i = 0; i < numGroups; i++) {
      const group = dataModel.group(rgn, i)!;
      if (row >= group.startRow && row <= group.endRow) {
        groupsAtRow.push(group);
      }
    }
    return groupsAtRow;
  }

  /**
   * Retrieves a list of cell groups intersecting at
   * a given column.
   * @param dataModel data model of the grid.
   * @param rgn the cell region.
   * @param column the target column to look for intersections at.
   * @returns all cell groups intersecting with the column.
   */
  export function getCellGroupsAtColumn(
    dataModel: DataModel,
    rgn: DataModel.CellRegion,
    column: number
  ): CellGroup[] {
    let groupsAtColumn = [];
    const numGroups = dataModel.groupCount(rgn);

    for (let i = 0; i < numGroups; i++) {
      const group = dataModel.group(rgn, i)!;
      if (column >= group.startColumn && column <= group.endColumn) {
        groupsAtColumn.push(group);
      }
    }
    return groupsAtColumn;
  }

  /**
   * Checks if cell group 1 is above cell group 2.
   * @param group1 cell group 1.
   * @param group2 cell group 2.
   * @returns boolean.
   */
  export function isCellGroupAbove(
    group1: CellGroup,
    group2: CellGroup
  ): boolean {
    return group2.endRow >= group1.startRow;
  }

  /**
   * Checks if cell group 1 is below cell group 2.
   */
  export function isCellGroupBelow(
    group1: CellGroup,
    group2: CellGroup
  ): boolean {
    return group2.startRow <= group1.endRow;
  }

  /**
   * Merges a target cell group with any cell groups
   * it intersects with at a given row or column.
   * @param dataModel data model of the grid.
   * @param regions list of cell regions.
   * @param axis row or column.
   * @param group the target cell group.
   * @returns a new merged cell group.
   */
  export function joinCellGroupsIntersectingAtAxis(
    dataModel: DataModel,
    regions: DataModel.CellRegion[],
    axis: "row" | "column",
    group: CellGroup
  ): CellGroup {
    let groupsAtAxis: CellGroup[] = [];
    // TODO: optimize this to break after first one found
    if (axis === "row") {
      for (const region of regions) {
        for (let r = group.startRow; r <= group.endRow; r++) {
          groupsAtAxis = groupsAtAxis.concat(
            CellGroup.getCellGroupsAtRow(dataModel, region, r)
          );
        }
      }
    } else {
      for (const region of regions) {
        for (let c = group.startColumn; c <= group.endColumn; c++) {
          groupsAtAxis = groupsAtAxis.concat(
            CellGroup.getCellGroupsAtColumn(dataModel, region, c)
          );
        }
      }
    }

    let mergedGroupAtAxis: CellGroup = CellGroup.joinCellGroups(groupsAtAxis);

    if (groupsAtAxis.length > 0) {
      let mergedCellGroups: CellGroup[] = [];
      for (const region of regions) {
        mergedCellGroups = mergedCellGroups.concat(
          CellGroup.getCellGroupsAtRegion(dataModel, region)
        );
      }

      for (let g = 0; g < mergedCellGroups.length; g++) {
        const group = mergedCellGroups[g];
        if (
          CellGroup.areCellGroupsIntersectingAtAxis(
            mergedGroupAtAxis,
            group,
            axis
          )
        ) {
          mergedGroupAtAxis = CellGroup.joinCellGroups([
            group,
            mergedGroupAtAxis,
          ]);
          mergedCellGroups.splice(g, 1);
          g = 0;
        }
      }
    }
    return mergedGroupAtAxis;
  }
}
