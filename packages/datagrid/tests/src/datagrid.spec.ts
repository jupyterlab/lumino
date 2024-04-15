// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { expect } from 'chai';

import { DataGrid } from '@lumino/datagrid';

describe('@lumino/datagrid', () => {
  let datagrid: DataGrid;
  beforeEach(() => {
    datagrid = new DataGrid();
  });
  describe('DataGrid', () => {
    describe('currentViewport()', () => {
      it('should return the viewport', () => {
        expect(datagrid.currentViewport).to.be.undefined;
      });
    });
  });
});
