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

import { TextRenderer } from './textrenderer';

/**
 * A cell renderer which renders data values as text.
 */
export class HyperlinkRenderer extends TextRenderer {
  /**
   * Construct a new text renderer.
   *
   * @param options - The options for initializing the renderer.
   */
  constructor(options: HyperlinkRenderer.IOptions = {}) {
    // Set default parameters before passing over the super.
    options.textColor = options.textColor || 'navy';
    options.font = options.font || 'bold 12px sans-serif';
    super(options);
    this.url = options.url;
    this.urlName = options.urlName;
  }

  /**
   * The URL address.
   */
  readonly url: CellRenderer.ConfigOption<string> | undefined;

  /**
   * The friendly link name.
   */
  readonly urlName: CellRenderer.ConfigOption<string> | undefined;

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

    // Resolve for the friendly URL name.
    let urlName = CellRenderer.resolveOption(this.urlName, config);

    // Resolve the text color for the cell.
    let color = CellRenderer.resolveOption(this.textColor, config);

    // Bail if there is no text color to draw.
    if (!color) {
      return;
    }

    const format = this.format;
    let text;

    // If we have a friendly URL name, use that.
    if (urlName) {
      text = format({
        ...config,
        value: urlName
      } as CellRenderer.CellConfig);
    } else {
      // Otherwise use the raw value attribute.
      text = format(config);
    }

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
    let textHeight = HyperlinkRenderer.measureFontHeight(font);

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

export namespace HyperlinkRenderer {
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
  export interface IOptions extends TextRenderer.IOptions {
    /**
     * The URL address
     */
    url?: CellRenderer.ConfigOption<string> | undefined;
    /**
     * The friendly link name.
     *
     * The default is the URL itself.
     */
    urlName?: CellRenderer.ConfigOption<string> | undefined;
  }
}
