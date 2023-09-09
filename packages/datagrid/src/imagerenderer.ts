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

const PERCENTAGE_REGEX = /^(\d+(\.\d+)?)%$/;
const PIXEL_REGEX = /^(\d+(\.\d+)?)px$/;

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
    this.textColor = options.textColor || '#000000';
    this.placeholder = options.placeholder || '...';

    this.width = options.width || '';
    // Not using the || operator, because the empty string '' is a valid value
    this.height = options.height === undefined ? '100%' : options.height;
  }

  /**
   * The CSS color for drawing the placeholder text.
   */
  readonly textColor: CellRenderer.ConfigOption<string>;

  /**
   * The CSS color for the cell background.
   */
  readonly backgroundColor: CellRenderer.ConfigOption<string>;

  /**
   * The placeholder text.
   */
  readonly placeholder: CellRenderer.ConfigOption<string>;

  /**
   * The width of the image.
   */
  readonly width: CellRenderer.ConfigOption<string>;

  /**
   * The height of the image.
   */
  readonly height: CellRenderer.ConfigOption<string>;

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
    const color = CellRenderer.resolveOption(this.backgroundColor, config);

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
    const placeholder = CellRenderer.resolveOption(this.placeholder, config);
    const color = CellRenderer.resolveOption(this.textColor, config);

    const textX = config.x + config.width / 2;
    const textY = config.y + config.height / 2;

    // Draw the placeholder.
    gc.fillStyle = color;
    gc.fillText(placeholder, textX, textY);
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

    const width = CellRenderer.resolveOption(this.width, config);
    const height = CellRenderer.resolveOption(this.height, config);

    // width and height are unset, we display the image with its original size
    if (!width && !height) {
      gc.drawImage(img, config.x, config.y);
      return;
    }

    let requestedWidth = img.width;
    let requestedHeight = img.height;

    let widthPercentageMatch: RegExpMatchArray | null;
    let widthPixelMatch: RegExpMatchArray | null;
    let heightPercentageMatch: RegExpMatchArray | null;
    let heightPixelMatch: RegExpMatchArray | null;

    if ((widthPercentageMatch = width.match(PERCENTAGE_REGEX))) {
      requestedWidth =
        (parseFloat(widthPercentageMatch[1]) / 100) * config.width;
    } else if ((widthPixelMatch = width.match(PIXEL_REGEX))) {
      requestedWidth = parseFloat(widthPixelMatch[1]);
    }

    if ((heightPercentageMatch = height.match(PERCENTAGE_REGEX))) {
      requestedHeight =
        (parseFloat(heightPercentageMatch[1]) / 100) * config.height;
    } else if ((heightPixelMatch = height.match(PIXEL_REGEX))) {
      requestedHeight = parseFloat(heightPixelMatch[1]);
    }

    // If width is not set, we compute it respecting the image size ratio
    if (!width) {
      requestedWidth = (img.width / img.height) * requestedHeight;
    }

    // If height is not set, we compute it respecting the image size ratio
    if (!height) {
      requestedHeight = (img.height / img.width) * requestedWidth;
    }

    gc.drawImage(img, config.x, config.y, requestedWidth, requestedHeight);
  }

  private static dataCache = new Map<string, HTMLImageElement | undefined>();
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
     * The placeholder text while the cell is loading.
     *
     * The default is `'...'`.
     */
    placeholder?: CellRenderer.ConfigOption<string>;

    /**
     * The color for the drawing the placeholder text.
     *
     * The default is `'#000000'`.
     */
    textColor?: CellRenderer.ConfigOption<string>;

    /**
     * The width of the image. Can be a percentage of the available space (e.g. '50%'), a
     * number of pixels (e.g. '123px') or an empty string.
     * If it's an empty string, it will respect the image size ratio depending on the height value
     * Examples:
     * - if height='100%' and width='', it will take the available height in the cell and compute the width so
     * that the image is not malformed.
     * - if height='' and width='50%', it will take half of the available width in the cell and compute the height so
     * that the image is not malformed.
     * - if height='' and width='', the image will keep its original size.
     *
     * The default is `''`.
     */
    width?: CellRenderer.ConfigOption<string>;

    /**
     * The height of the image. Can be a percentage of the available space (e.g. '50%'), a
     * number of pixels (e.g. '123px') or an empty string.
     * If it's an empty string, it will respect the image size ratio depending on the width value
     * Examples:
     * - if height='100%' and width='', it will take the available height in the cell and compute the width so
     * that the image is not malformed.
     * - if height='' and width='50%', it will take half of the available width in the cell and compute the height so
     * that the image is not malformed.
     * - if height='' and width='', the image will keep its original size.
     *
     * The default is `'100%'`.
     */
    height?: CellRenderer.ConfigOption<string>;
  }
}
