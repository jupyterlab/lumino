// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2023, Lumino Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/

import { CellRenderer } from './cellrenderer';
import { GraphicsContext } from './graphicscontext';

/**
 * An object which renders the cells of a data grid asynchronously.
 *
 * #### Notes
 * For performance reason, the datagrid only paints cells synchronously,
 * though if your cell renderer inherits from AsyncCellRenderer, you will
 * be able to do some asynchronous work prior to painting the cell.
 * See `ImageRenderer` for an example of an asynchronous renderer.
 */
export abstract class AsyncCellRenderer extends CellRenderer {
  /**
   * Whether the renderer is ready or not for that specific config.
   * If it's not ready, the datagrid will paint the placeholder using `paintPlaceholder`.
   * If it's ready, the datagrid will paint the cell synchronously using `paint`.
   *
   * @param config - The configuration data for the cell.
   *
   * @returns Whether the renderer is ready for this config or not.
   */
  abstract isReady(config: CellRenderer.CellConfig): boolean;

  /**
   * Do any asynchronous work prior to painting this cell config.
   *
   * @param config - The configuration data for the cell.
   */
  abstract load(config: CellRenderer.CellConfig): Promise<void>;

  /**
   * Paint the placeholder for a cell, waiting for the renderer to be ready.
   *
   * @param gc - The graphics context to use for drawing.
   *
   * @param config - The configuration data for the cell.
   */
  abstract paintPlaceholder(
    gc: GraphicsContext,
    config: CellRenderer.CellConfig
  ): void;
}
