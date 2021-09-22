import { DataModel } from './datamodel';
import { SectionList } from './sectionlist';

/**
 * An interface describing a merged cell group.
 * r1: start row
 * r2: end row
 * c1: start column
 * c2: end column
 */
export interface CellGroup {
  r1: number;
  r2: number;
  c1: number;
  c2: number;
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
        row1 >= group.r1 &&
        row1 <= group.r2 &&
        column1 >= group.c1 &&
        column1 <= group.c2 &&
        row2 >= group.r1 &&
        row2 <= group.r2 &&
        column2 >= group.c1 &&
        column2 <= group.c2
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
    axis: 'row' | 'column',
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

    if (axis === 'row') {
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
      return [0, 0, { r1: -1, r2: -1, c1: -1, c2: -1 }];
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

    let minRow = joinedGroup.r1;
    let maxRow = joinedGroup.r2;

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
    axis: 'row' | 'column'
  ): boolean {
    if (axis === 'row') {
      return (
        (group1.r1 >= group2.r1 && group1.r1 <= group2.r2) ||
        (group1.r2 >= group2.r1 && group1.r2 <= group2.r2) ||
        (group2.r1 >= group1.r1 && group2.r1 <= group1.r2) ||
        (group2.r2 >= group1.r1 && group2.r2 <= group1.r2)
      );
    }
    return (
      (group1.c1 >= group2.c1 && group1.c1 <= group2.c2) ||
      (group1.c2 >= group2.c1 && group1.c2 <= group2.c2) ||
      (group2.c1 >= group1.c1 && group2.c1 <= group1.c2) ||
      (group2.c2 >= group1.c1 && group2.c2 <= group1.c2)
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
      ((group1.r1 >= group2.r1 && group1.r1 <= group2.r2) ||
        (group1.r2 >= group2.r1 && group1.r2 <= group2.r2) ||
        (group2.r1 >= group1.r1 && group2.r1 <= group1.r2) ||
        (group2.r2 >= group1.r1 && group2.r2 <= group1.r2)) &&
      ((group1.c1 >= group2.c1 && group1.c1 <= group2.c2) ||
        (group1.c2 >= group2.c1 && group1.c2 <= group2.c2) ||
        (group2.c1 >= group1.c1 && group2.c1 <= group1.c2) ||
        (group2.c2 >= group1.c1 && group2.c2 <= group1.c2))
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
        row >= group.r1 &&
        row <= group.r2 &&
        column >= group.c1 &&
        column <= group.c2
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
      startRow = Math.min(startRow, group.r1);
      endRow = Math.max(endRow, group.r2);
      startColumn = Math.min(startColumn, group.c1);
      endColumn = Math.max(endColumn, group.c2);
    }

    return { r1: startRow, r2: endRow, c1: startColumn, c2: endColumn };
  }

  /**
   * Merges a cell group with other cells groups in the
   * same region if they intersect.
   * @param dataModel the data model of the grid.
   * @param group the target cell group.
   * @param region the region of the cell group.
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
      if (row >= group.r1 && row <= group.r2) {
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
      if (column >= group.c1 && column <= group.c2) {
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
    return group2.r2 >= group1.r1;
  }

  /**
   * Checks if cell group 1 is below cell group 2.
   */
  export function isCellGroupBelow(
    group1: CellGroup,
    group2: CellGroup
  ): boolean {
    return group2.r1 <= group1.r2;
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
    axis: 'row' | 'column',
    group: CellGroup
  ): CellGroup {
    let groupsAtAxis: CellGroup[] = [];
    if (axis === 'row') {
      for (const region of regions) {
        for (let r = group.r1; r <= group.r2; r++) {
          groupsAtAxis = groupsAtAxis.concat(
            CellGroup.getCellGroupsAtRow(dataModel, region, r)
          );
        }
      }
    } else {
      for (const region of regions) {
        for (let c = group.c1; c <= group.c2; c++) {
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
            mergedGroupAtAxis
          ]);
          mergedCellGroups.splice(g, 1);
          g = 0;
        }
      }
    }
    return mergedGroupAtAxis;
  }
}
