// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2023, Lumino Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
import { PromiseDelegate } from '@lumino/coreutils';
import { AsyncCellRenderer } from './asynccellrenderer';
import { CellRenderer } from './cellrenderer';

import { GraphicsContext } from './graphicscontext';

/**
 * Sizing mode. Can be 'original', 'fit-height', 'fit-width', or 'fill'.
 * 'fit-height' will make the image fit the available height in the cell, respecting the image size ratio.
 * 'fit-width' will make the image fit the available width in the cell, respecting the image size ratio.
 * 'fill' will make the image fill the available space in the cell, NOT respecting the image size ratio.
 * 'original' will make respect the size of the original image.
 *
 * The default is 'fit-height'
 */
export type SizingMode = 'fit-height' | 'fit-width' | 'fill' | 'original';

/**
 * A cell renderer which renders data values as images.
 */
export class ImageRenderer extends AsyncCellRenderer {
  /**
   * Construct a new text renderer.
   *
   * @param options - The options for initializing the renderer.
   */
  constructor(options: ImageRenderer.IOptions = {}) {
    super();

    this.backgroundColor = options.backgroundColor || '';
    this.sizingMode = options.sizingMode || 'fit-height';
  }

  /**
   * The CSS color for the cell background.
   */
  readonly backgroundColor: CellRenderer.ConfigOption<string>;

  /**
   * Sizing mode. Can be 'original', 'fit', or 'fill'.
   */
  readonly sizingMode: CellRenderer.ConfigOption<SizingMode>;

  /**
   * Whether the renderer is ready or not for that specific config.
   * If it's not ready, the datagrid will paint the placeholder.
   * If it's ready, the datagrid will paint the image synchronously.
   *
   * @param config - The configuration data for the cell.
   *
   * @returns Whether the renderer is ready for this config or not.
   */
  isReady(config: CellRenderer.CellConfig): boolean {
    return (
      !config.value || ImageRenderer.dataCache.get(config.value) !== undefined
    );
  }

  /**
   * Load the image asynchronously for a specific config.
   *
   * @param config - The configuration data for the cell.
   */
  async load(config: CellRenderer.CellConfig): Promise<void> {
    // Bail early if there is nothing to do
    if (!config.value) {
      return;
    }

    const value = config.value;
    const loadedPromise = new PromiseDelegate<void>();

    ImageRenderer.dataCache.set(value, undefined);

    const img = new Image();
    img.onload = () => {
      // Load image
      ImageRenderer.dataCache.set(value, img);

      loadedPromise.resolve();
    };
    img.src = value;

    return loadedPromise.promise;
  }

  /**
   * Paint the placeholder for a cell, waiting for the renderer to be ready.
   *
   * @param gc - The graphics context to use for drawing.
   *
   * @param config - The configuration data for the cell.
   */
  paintPlaceholder(gc: GraphicsContext, config: CellRenderer.CellConfig): void {
    this.drawBackground(gc, config);
    this.drawPlaceholder(gc, config);
  }

  /**
   * Paint the content for a cell.
   *
   * @param gc - The graphics context to use for drawing.
   *
   * @param config - The configuration data for the cell.
   */
  paint(gc: GraphicsContext, config: CellRenderer.CellConfig): void {
    this.drawBackground(gc, config);
    this.drawImage(gc, config);
  }

  /**
   * Draw the background for the cell.
   *
   * @param gc - The graphics context to use for drawing.
   *
   * @param config - The configuration data for the cell.
   */
  drawBackground(gc: GraphicsContext, config: CellRenderer.CellConfig): void {
    // Resolve the background color for the cell.
    let color = CellRenderer.resolveOption(this.backgroundColor, config);

    // Bail if there is no background color to draw.
    if (!color) {
      return;
    }

    // Fill the cell with the background color.
    gc.fillStyle = color;
    gc.fillRect(config.x, config.y, config.width, config.height);
  }

  /**
   * Draw the placeholder for the cell.
   *
   * @param gc - The graphics context to use for drawing.
   *
   * @param config - The configuration data for the cell.
   */
  drawPlaceholder(gc: GraphicsContext, config: CellRenderer.CellConfig): void {
    // TODO Consider inheriting from/using a TextRenderer for rendering the placeholder
    const textX = config.x + config.width / 2;
    const textY = config.y + config.height / 2;

    // Draw the placeholder.
    gc.fillStyle = 'black'; // TODO Make this part of the cell config
    gc.fillText('loading...', textX, textY); // TODO Make this "loading..." part of the cell config
  }

  /**
   * Draw the image for the cell.
   *
   * @param gc - The graphics context to use for drawing.
   *
   * @param config - The configuration data for the cell.
   */
  drawImage(gc: GraphicsContext, config: CellRenderer.CellConfig): void {
    // Bail early if there is nothing to draw
    if (!config.value) {
      return;
    }

    const img = ImageRenderer.dataCache.get(config.value);

    // If it's not loaded yet, show the placeholder
    if (!img) {
      return this.drawPlaceholder(gc, config);
    }

    const fitWidth = (img.width / img.height) * config.height;
    const fitHeight = (img.height / img.width) * config.width;
    switch (this.sizingMode) {
      case 'fit-height':
        gc.drawImage(img, config.x, config.y, fitWidth, config.height);
        break;
      case 'fit-width':
        gc.drawImage(img, config.x, config.y, config.width, fitHeight);
        break;
      case 'fill':
        gc.drawImage(img, config.x, config.y, config.width, config.height);
        break;
      case 'original':
        gc.drawImage(img, config.x, config.y);
        break;
    }
  }

  static dataCache = new Map<string, HTMLImageElement | undefined>();
}

/**
 * The namespace for the `ImageRenderer` class statics.
 */
export namespace ImageRenderer {
  /**
   * An options object for initializing an image renderer.
   */
  export interface IOptions {
    /**
     * The background color for the cells.
     *
     * The default is `''`.
     */
    backgroundColor?: CellRenderer.ConfigOption<string>;

    /**
     * Sizing mode. Can be 'original', 'fit-height', 'fit-width', or 'fill'.
     * 'fit-height' will make the image fit the available height in the cell, respecting the image size ratio.
     * 'fit-width' will make the image fit the available width in the cell, respecting the image size ratio.
     * 'fill' will make the image fill the available space in the cell, NOT respecting the image size ratio.
     * 'original' will make respect the size of the original image.
     *
     * The default is 'fit-height'
     */
    sizingMode?: CellRenderer.ConfigOption<SizingMode>;
  }
}
