// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2019, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
import { CellRenderer } from './cellrenderer';

import { GraphicsContext } from './graphicscontext';

/**
 * A cell renderer which renders data values as text.
 */
export class TextRenderer extends CellRenderer {
  /**
   * Construct a new text renderer.
   *
   * @param options - The options for initializing the renderer.
   */
  constructor(options: TextRenderer.IOptions = {}) {
    super();
    this.font = options.font || '12px sans-serif';
    this.textColor = options.textColor || '#000000';
    this.backgroundColor = options.backgroundColor || '';
    this.verticalAlignment = options.verticalAlignment || 'center';
    this.horizontalAlignment = options.horizontalAlignment || 'left';
    this.format = options.format || TextRenderer.formatGeneric();
    this.elideDirection = options.elideDirection || 'right';
    this.wrapText = options.wrapText || false;
  }

  /**
   * The CSS shorthand font for drawing the text.
   */
  readonly font: CellRenderer.ConfigOption<string>;

  /**
   * The CSS color for drawing the text.
   */
  readonly textColor: CellRenderer.ConfigOption<string>;

  /**
   * The CSS color for the cell background.
   */
  readonly backgroundColor: CellRenderer.ConfigOption<string>;

  /**
   * The vertical alignment for the cell text.
   */
  readonly verticalAlignment: CellRenderer.ConfigOption<
    TextRenderer.VerticalAlignment
  >;

  /**
   * The horizontal alignment for the cell text.
   */
  readonly horizontalAlignment: CellRenderer.ConfigOption<
    TextRenderer.HorizontalAlignment
  >;

  /**
   * The format function for the cell value.
   */
  readonly format: TextRenderer.FormatFunc;

  /**
   * Which side to draw the ellipsis.
   */
  readonly elideDirection: CellRenderer.ConfigOption<
    TextRenderer.ElideDirection
  >;

  /**
   * Boolean flag for applying text wrapping.
   */
  readonly wrapText: CellRenderer.ConfigOption<boolean>;

  /**
   * Paint the content for a cell.
   *
   * @param gc - The graphics context to use for drawing.
   *
   * @param config - The configuration data for the cell.
   */
  paint(gc: GraphicsContext, config: CellRenderer.CellConfig): void {
    this.drawBackground(gc, config);
    this.drawText(gc, config);
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
   * Draw the text for the cell.
   *
   * @param gc - The graphics context to use for drawing.
   *
   * @param config - The configuration data for the cell.
   */
  drawText(gc: GraphicsContext, config: CellRenderer.CellConfig): void {
    // Resolve the font for the cell.
    let font = CellRenderer.resolveOption(this.font, config);

    // Bail if there is no font to draw.
    if (!font) {
      return;
    }

    // Resolve the text color for the cell.
    let color = CellRenderer.resolveOption(this.textColor, config);

    // Bail if there is no text color to draw.
    if (!color) {
      return;
    }

    // Format the cell value to text.
    let format = this.format;
    let text = format(config);

    // Bail if there is no text to draw.
    if (!text) {
      return;
    }

    // Resolve the vertical and horizontal alignment.
    let vAlign = CellRenderer.resolveOption(this.verticalAlignment, config);
    let hAlign = CellRenderer.resolveOption(this.horizontalAlignment, config);

    // Resolve the elision direction
    let elideDirection = CellRenderer.resolveOption(
      this.elideDirection,
      config
    );

    // Resolve the text wrapping flag
    let wrapText = CellRenderer.resolveOption(this.wrapText, config);

    // Compute the padded text box height for the specified alignment.
    let boxHeight = config.height - (vAlign === 'center' ? 1 : 2);

    // Bail if the text box has no effective size.
    if (boxHeight <= 0) {
      return;
    }

    // Compute the text height for the gc font.
    let textHeight = TextRenderer.measureFontHeight(font);

    // Set up the text position variables.
    let textX: number;
    let textY: number;
    let boxWidth: number;

    // Compute the Y position for the text.
    switch (vAlign) {
      case 'top':
        textY = config.y + 2 + textHeight;
        break;
      case 'center':
        textY = config.y + config.height / 2 + textHeight / 2;
        break;
      case 'bottom':
        textY = config.y + config.height - 2;
        break;
      default:
        throw 'unreachable';
    }

    // Compute the X position for the text.
    switch (hAlign) {
      case 'left':
        textX = config.x + 8;
        boxWidth = config.width - 14;
        break;
      case 'center':
        textX = config.x + config.width / 2;
        boxWidth = config.width;
        break;
      case 'right':
        textX = config.x + config.width - 8;
        boxWidth = config.width - 14;
        break;
      default:
        throw 'unreachable';
    }

    // Clip the cell if the text is taller than the text box height.
    if (textHeight > boxHeight) {
      gc.beginPath();
      gc.rect(config.x, config.y, config.width, config.height - 1);
      gc.clip();
    }

    // Set the gc state.
    gc.font = font;
    gc.fillStyle = color;
    gc.textAlign = hAlign;
    gc.textBaseline = 'bottom';

    // The current text width in pixels.
    let textWidth = gc.measureText(text).width;

    // Apply text wrapping if enabled.
    if (wrapText && textWidth > boxWidth) {
      // Make sure box clipping happens.
      gc.beginPath();
      gc.rect(config.x, config.y, config.width, config.height - 1);
      gc.clip();

      // Split column name to words based on
      // whitespace preceding a word boundary.
      // "Hello  world" --> ["Hello  ", "world"]
      const wordsInColumn = text.split(/\s(?=\b)/);

      // Y-coordinate offset for any additional lines
      let curY = textY;
      let textInCurrentLine = wordsInColumn.shift()!;

      // Single word. Applying text wrap on word by splitting
      // it into characters and fitting the maximum number of
      // characters possible per line (box width).
      if (wordsInColumn.length === 0) {
        let curLineTextWidth = gc.measureText(textInCurrentLine).width;
        while (curLineTextWidth > boxWidth && textInCurrentLine !== '') {
          // Iterating from the end of the string until we find a
          // substring (0,i) which has a width less than the box width.
          for (let i = textInCurrentLine.length; i > 0; i--) {
            const curSubString = textInCurrentLine.substring(0, i);
            const curSubStringWidth = gc.measureText(curSubString).width;
            if (curSubStringWidth < boxWidth || curSubString.length === 1) {
              // Found a substring which has a width less than the current
              // box width. Rendering that substring on the current line
              // and setting the remainder of the parent string as the next
              // string to iterate on for the next line.
              const nextLineText = textInCurrentLine.substring(
                i,
                textInCurrentLine.length
              );
              textInCurrentLine = nextLineText;
              curLineTextWidth = gc.measureText(textInCurrentLine).width;
              gc.fillText(curSubString, textX, curY);
              curY += textHeight;
              // No need to continue iterating after we identified
              // an index to break the string on.
              break;
            }
          }
        }
      }

      // Multiple words in column header. Fitting maximum
      // number of words possible per line (box width).
      else {
        while (wordsInColumn.length !== 0) {
          // Processing the next word in the queue.
          const curWord = wordsInColumn.shift();
          // Joining that word with the existing text for
          // the current line.
          const incrementedText = [textInCurrentLine, curWord].join(' ');
          const incrementedTextWidth = gc.measureText(incrementedText).width;
          if (incrementedTextWidth > boxWidth) {
            // If the newly combined text has a width larger than
            // the box width, we render the line before the current
            // word was added. We set the current word as the next
            // line.
            gc.fillText(textInCurrentLine, textX, curY);
            curY += textHeight;
            textInCurrentLine = curWord!;
          } else {
            // The combined text hasd a width less than the box width. We
            // set the the current line text to be the new combined text.
            textInCurrentLine = incrementedText;
          }
        }
      }
      gc.fillText(textInCurrentLine!, textX, curY);
      // Terminating the call here as we don't want
      // to apply text eliding when wrapping is active.
      return;
    }

    // Elide text that is too long
    let elide = '\u2026';

    // Compute elided text
    if (elideDirection === 'right') {
      while (textWidth > boxWidth && text.length > 1) {
        if (text.length > 4 && textWidth >= 2 * boxWidth) {
          // If text width is substantially bigger, take half the string
          text = text.substring(0, text.length / 2 + 1) + elide;
        } else {
          // Otherwise incrementally remove the last character
          text = text.substring(0, text.length - 2) + elide;
        }
        textWidth = gc.measureText(text).width;
      }
    } else {
      while (textWidth > boxWidth && text.length > 1) {
        if (text.length > 4 && textWidth >= 2 * boxWidth) {
          // If text width is substantially bigger, take half the string
          text = elide + text.substring(text.length / 2);
        } else {
          // Otherwise incrementally remove the last character
          text = elide + text.substring(2);
        }
        textWidth = gc.measureText(text).width;
      }
    }

    // Draw the text for the cell.
    gc.fillText(text, textX, textY);
  }
}

/**
 * The namespace for the `TextRenderer` class statics.
 */
export namespace TextRenderer {
  /**
   * A type alias for the supported vertical alignment modes.
   */
  export type VerticalAlignment = 'top' | 'center' | 'bottom';

  /**
   * A type alias for the supported horizontal alignment modes.
   */
  export type HorizontalAlignment = 'left' | 'center' | 'right';

  /**
   * A type alias for the supported ellipsis sides.
   */
  export type ElideDirection = 'left' | 'right';

  /**
   * An options object for initializing a text renderer.
   */
  export interface IOptions {
    /**
     * The font for drawing the cell text.
     *
     * The default is `'12px sans-serif'`.
     */
    font?: CellRenderer.ConfigOption<string>;

    /**
     * The color for the drawing the cell text.
     *
     * The default `'#000000'`.
     */
    textColor?: CellRenderer.ConfigOption<string>;

    /**
     * The background color for the cells.
     *
     * The default is `''`.
     */
    backgroundColor?: CellRenderer.ConfigOption<string>;

    /**
     * The vertical alignment for the cell text.
     *
     * The default is `'center'`.
     */
    verticalAlignment?: CellRenderer.ConfigOption<VerticalAlignment>;

    /**
     * The horizontal alignment for the cell text.
     *
     * The default is `'left'`.
     */
    horizontalAlignment?: CellRenderer.ConfigOption<HorizontalAlignment>;

    /**
     * The format function for the renderer.
     *
     * The default is `TextRenderer.formatGeneric()`.
     */
    format?: FormatFunc;

    /**
     * The ellipsis direction for the cell text.
     *
     * The default is `'right'`.
     */
    elideDirection?: CellRenderer.ConfigOption<ElideDirection>;

    /**
     * Whether or not to apply text wrapping.
     *
     * The default is `'false'`.
     */
    wrapText?: CellRenderer.ConfigOption<boolean>;
  }

  /**
   * A type alias for a format function.
   */
  export type FormatFunc = CellRenderer.ConfigFunc<string>;

  /**
   * Create a generic text format function.
   *
   * @param options - The options for creating the format function.
   *
   * @returns A new generic text format function.
   *
   * #### Notes
   * This formatter uses the builtin `String()` to coerce any value
   * to a string.
   */
  export function formatGeneric(
    options: formatGeneric.IOptions = {}
  ): FormatFunc {
    let missing = options.missing || '';
    return ({ value }) => {
      if (value === null || value === undefined) {
        return missing;
      }
      return String(value);
    };
  }

  /**
   * The namespace for the `formatGeneric` function statics.
   */
  export namespace formatGeneric {
    /**
     * The options for creating a generic format function.
     */
    export interface IOptions {
      /**
       * The text to use for a `null` or `undefined` data value.
       *
       * The default is `''`.
       */
      missing?: string;
    }
  }

  /**
   * Create a fixed decimal format function.
   *
   * @param options - The options for creating the format function.
   *
   * @returns A new fixed decimal format function.
   *
   * #### Notes
   * This formatter uses the builtin `Number()` and `toFixed()` to
   * coerce values.
   *
   * The `formatIntlNumber()` formatter is more flexible, but slower.
   */
  export function formatFixed(options: formatFixed.IOptions = {}): FormatFunc {
    let digits = options.digits;
    let missing = options.missing || '';
    return ({ value }) => {
      if (value === null || value === undefined) {
        return missing;
      }
      return Number(value).toFixed(digits);
    };
  }

  /**
   * The namespace for the `formatFixed` function statics.
   */
  export namespace formatFixed {
    /**
     * The options for creating a fixed format function.
     */
    export interface IOptions {
      /**
       * The number of digits to include after the decimal point.
       *
       * The default is determined by the user agent.
       */
      digits?: number;

      /**
       * The text to use for a `null` or `undefined` data value.
       *
       * The default is `''`.
       */
      missing?: string;
    }
  }

  /**
   * Create a significant figure format function.
   *
   * @param options - The options for creating the format function.
   *
   * @returns A new significant figure format function.
   *
   * #### Notes
   * This formatter uses the builtin `Number()` and `toPrecision()`
   * to coerce values.
   *
   * The `formatIntlNumber()` formatter is more flexible, but slower.
   */
  export function formatPrecision(
    options: formatPrecision.IOptions = {}
  ): FormatFunc {
    let digits = options.digits;
    let missing = options.missing || '';
    return ({ value }) => {
      if (value === null || value === undefined) {
        return missing;
      }
      return Number(value).toPrecision(digits);
    };
  }

  /**
   * The namespace for the `formatPrecision` function statics.
   */
  export namespace formatPrecision {
    /**
     * The options for creating a precision format function.
     */
    export interface IOptions {
      /**
       * The number of significant figures to include in the value.
       *
       * The default is determined by the user agent.
       */
      digits?: number;

      /**
       * The text to use for a `null` or `undefined` data value.
       *
       * The default is `''`.
       */
      missing?: string;
    }
  }

  /**
   * Create a scientific notation format function.
   *
   * @param options - The options for creating the format function.
   *
   * @returns A new scientific notation format function.
   *
   * #### Notes
   * This formatter uses the builtin `Number()` and `toExponential()`
   * to coerce values.
   *
   * The `formatIntlNumber()` formatter is more flexible, but slower.
   */
  export function formatExponential(
    options: formatExponential.IOptions = {}
  ): FormatFunc {
    let digits = options.digits;
    let missing = options.missing || '';
    return ({ value }) => {
      if (value === null || value === undefined) {
        return missing;
      }
      return Number(value).toExponential(digits);
    };
  }

  /**
   * The namespace for the `formatExponential` function statics.
   */
  export namespace formatExponential {
    /**
     * The options for creating an exponential format function.
     */
    export interface IOptions {
      /**
       * The number of digits to include after the decimal point.
       *
       * The default is determined by the user agent.
       */
      digits?: number;

      /**
       * The text to use for a `null` or `undefined` data value.
       *
       * The default is `''`.
       */
      missing?: string;
    }
  }

  /**
   * Create an international number format function.
   *
   * @param options - The options for creating the format function.
   *
   * @returns A new international number format function.
   *
   * #### Notes
   * This formatter uses the builtin `Intl.NumberFormat` object to
   * coerce values.
   *
   * This is the most flexible (but slowest) number formatter.
   */
  export function formatIntlNumber(
    options: formatIntlNumber.IOptions = {}
  ): FormatFunc {
    let missing = options.missing || '';
    let nft = new Intl.NumberFormat(options.locales, options.options);
    return ({ value }) => {
      if (value === null || value === undefined) {
        return missing;
      }
      return nft.format(value);
    };
  }

  /**
   * The namespace for the `formatIntlNumber` function statics.
   */
  export namespace formatIntlNumber {
    /**
     * The options for creating an intl number format function.
     */
    export interface IOptions {
      /**
       * The locales to pass to the `Intl.NumberFormat` constructor.
       *
       * The default is determined by the user agent.
       */
      locales?: string | string[];

      /**
       * The options to pass to the `Intl.NumberFormat` constructor.
       *
       * The default is determined by the user agent.
       */
      options?: Intl.NumberFormatOptions;

      /**
       * The text to use for a `null` or `undefined` data value.
       *
       * The default is `''`.
       */
      missing?: string;
    }
  }

  /**
   * Create a date format function.
   *
   * @param options - The options for creating the format function.
   *
   * @returns A new date format function.
   *
   * #### Notes
   * This formatter uses `Date.toDateString()` to format the values.
   *
   * If a value is not a `Date` object, `new Date(value)` is used to
   * coerce the value to a date.
   *
   * The `formatIntlDateTime()` formatter is more flexible, but slower.
   */
  export function formatDate(options: formatDate.IOptions = {}): FormatFunc {
    let missing = options.missing || '';
    return ({ value }) => {
      if (value === null || value === undefined) {
        return missing;
      }
      if (value instanceof Date) {
        return value.toDateString();
      }
      return new Date(value).toDateString();
    };
  }

  /**
   * The namespace for the `formatDate` function statics.
   */
  export namespace formatDate {
    /**
     * The options for creating a date format function.
     */
    export interface IOptions {
      /**
       * The text to use for a `null` or `undefined` data value.
       *
       * The default is `''`.
       */
      missing?: string;
    }
  }

  /**
   * Create a time format function.
   *
   * @param options - The options for creating the format function.
   *
   * @returns A new time format function.
   *
   * #### Notes
   * This formatter uses `Date.toTimeString()` to format the values.
   *
   * If a value is not a `Date` object, `new Date(value)` is used to
   * coerce the value to a date.
   *
   * The `formatIntlDateTime()` formatter is more flexible, but slower.
   */
  export function formatTime(options: formatTime.IOptions = {}): FormatFunc {
    let missing = options.missing || '';
    return ({ value }) => {
      if (value === null || value === undefined) {
        return missing;
      }
      if (value instanceof Date) {
        return value.toTimeString();
      }
      return new Date(value).toTimeString();
    };
  }

  /**
   * The namespace for the `formatTime` function statics.
   */
  export namespace formatTime {
    /**
     * The options for creating a time format function.
     */
    export interface IOptions {
      /**
       * The text to use for a `null` or `undefined` data value.
       *
       * The default is `''`.
       */
      missing?: string;
    }
  }

  /**
   * Create an ISO datetime format function.
   *
   * @param options - The options for creating the format function.
   *
   * @returns A new ISO datetime format function.
   *
   * #### Notes
   * This formatter uses `Date.toISOString()` to format the values.
   *
   * If a value is not a `Date` object, `new Date(value)` is used to
   * coerce the value to a date.
   *
   * The `formatIntlDateTime()` formatter is more flexible, but slower.
   */
  export function formatISODateTime(
    options: formatISODateTime.IOptions = {}
  ): FormatFunc {
    let missing = options.missing || '';
    return ({ value }) => {
      if (value === null || value === undefined) {
        return missing;
      }
      if (value instanceof Date) {
        return value.toISOString();
      }
      return new Date(value).toISOString();
    };
  }

  /**
   * The namespace for the `formatISODateTime` function statics.
   */
  export namespace formatISODateTime {
    /**
     * The options for creating an ISO datetime format function.
     */
    export interface IOptions {
      /**
       * The text to use for a `null` or `undefined` data value.
       *
       * The default is `''`.
       */
      missing?: string;
    }
  }

  /**
   * Create a UTC datetime format function.
   *
   * @param options - The options for creating the format function.
   *
   * @returns A new UTC datetime format function.
   *
   * #### Notes
   * This formatter uses `Date.toUTCString()` to format the values.
   *
   * If a value is not a `Date` object, `new Date(value)` is used to
   * coerce the value to a date.
   *
   * The `formatIntlDateTime()` formatter is more flexible, but slower.
   */
  export function formatUTCDateTime(
    options: formatUTCDateTime.IOptions = {}
  ): FormatFunc {
    let missing = options.missing || '';
    return ({ value }) => {
      if (value === null || value === undefined) {
        return missing;
      }
      if (value instanceof Date) {
        return value.toUTCString();
      }
      return new Date(value).toUTCString();
    };
  }

  /**
   * The namespace for the `formatUTCDateTime` function statics.
   */
  export namespace formatUTCDateTime {
    /**
     * The options for creating a UTC datetime format function.
     */
    export interface IOptions {
      /**
       * The text to use for a `null` or `undefined` data value.
       *
       * The default is `''`.
       */
      missing?: string;
    }
  }

  /**
   * Create an international datetime format function.
   *
   * @param options - The options for creating the format function.
   *
   * @returns A new international datetime format function.
   *
   * #### Notes
   * This formatter uses the builtin `Intl.DateTimeFormat` object to
   * coerce values.
   *
   * This is the most flexible (but slowest) datetime formatter.
   */
  export function formatIntlDateTime(
    options: formatIntlDateTime.IOptions = {}
  ): FormatFunc {
    let missing = options.missing || '';
    let dtf = new Intl.DateTimeFormat(options.locales, options.options);
    return ({ value }) => {
      if (value === null || value === undefined) {
        return missing;
      }
      return dtf.format(value);
    };
  }

  /**
   * The namespace for the `formatIntlDateTime` function statics.
   */
  export namespace formatIntlDateTime {
    /**
     * The options for creating an intl datetime format function.
     */
    export interface IOptions {
      /**
       * The locales to pass to the `Intl.DateTimeFormat` constructor.
       *
       * The default is determined by the user agent.
       */
      locales?: string | string[];

      /**
       * The options to pass to the `Intl.DateTimeFormat` constructor.
       *
       * The default is determined by the user agent.
       */
      options?: Intl.DateTimeFormatOptions;

      /**
       * The text to use for a `null` or `undefined` data value.
       *
       * The default is `''`.
       */
      missing?: string;
    }
  }

  /**
   * Measure the height of a font.
   *
   * @param font - The CSS font string of interest.
   *
   * @returns The height of the font bounding box.
   *
   * #### Notes
   * This function uses a temporary DOM node to measure the text box
   * height for the specified font. The first call for a given font
   * will incur a DOM reflow, but the return value is cached, so any
   * subsequent call for the same font will return the cached value.
   */
  export function measureFontHeight(font: string): number {
    // Look up the cached font height.
    let height = Private.fontHeightCache[font];

    // Return the cached font height if it exists.
    if (height !== undefined) {
      return height;
    }

    // Normalize the font.
    Private.fontMeasurementGC.font = font;
    let normFont = Private.fontMeasurementGC.font;

    // Set the font on the measurement node.
    Private.fontMeasurementNode.style.font = normFont;

    // Add the measurement node to the document.
    document.body.appendChild(Private.fontMeasurementNode);

    // Measure the node height.
    height = Private.fontMeasurementNode.offsetHeight;

    // Remove the measurement node from the document.
    document.body.removeChild(Private.fontMeasurementNode);

    // Cache the measured height for the font and norm font.
    Private.fontHeightCache[font] = height;
    Private.fontHeightCache[normFont] = height;

    // Return the measured height.
    return height;
  }
}

/**
 * The namespace for the module implementation details.
 */
namespace Private {
  /**
   * A cache of measured font heights.
   */
  export const fontHeightCache: { [font: string]: number } = Object.create(
    null
  );

  /**
   * The DOM node used for font height measurement.
   */
  export const fontMeasurementNode = (() => {
    let node = document.createElement('div');
    node.style.position = 'absolute';
    node.style.top = '-99999px';
    node.style.left = '-99999px';
    node.style.visibility = 'hidden';
    node.textContent = 'M';
    return node;
  })();

  /**
   * The GC used for font measurement.
   */
  export const fontMeasurementGC = (() => {
    let canvas = document.createElement('canvas');
    canvas.width = 0;
    canvas.height = 0;
    return canvas.getContext('2d')!;
  })();
}
