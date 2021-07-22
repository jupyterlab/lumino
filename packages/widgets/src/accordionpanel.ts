// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { AccordionLayout } from "./accordionlayout";
import { SplitLayout } from "./splitlayout";
import { SplitPanel } from "./splitpanel";
import { Title } from "./title";
import { Widget } from "./widget";

/**
 * A panel which arranges its widgets into resizable sections separated by a title widget.
 *
 * #### Notes
 * This class provides a convenience wrapper around [[AccordionLayout]]. // TODO
 */
export class AccordionPanel extends SplitPanel {
  /**
   * Construct a new accordion panel.
   *
   * @param options - The options for initializing the accordion panel.
   */
  constructor(options: AccordionPanel.IOptions = {}) {
    super({ ...options, layout: Private.createLayout(options) });
    this.addClass("lm-AccordionPanel");
  }

  /**
   * Get the section title height.
   */
  get titleSpace(): number {
    return (this.layout as AccordionLayout).titleSpace;
  }

  /**
   * Set the section title height.
   */
  set titleSpace(value: number) {
    (this.layout as AccordionLayout).titleSpace = value;
  }

  /**
   * A read-only array of the section titles in the panel.
   */
  get titles(): ReadonlyArray<HTMLElement> {
    return (this.layout as AccordionLayout).titles;
  }
}

/**
 * The namespace for the `AccordionPanel` class statics.
 */
export namespace AccordionPanel {
  /**
   * A type alias for a split panel orientation.
   */
  export type Orientation = SplitLayout.Orientation;

  /**
   * A type alias for a split panel alignment.
   */
  export type Alignment = SplitLayout.Alignment;

  /**
   * A type alias for a split panel renderer.
   */
  export type IRenderer = AccordionLayout.IRenderer;

  /**
   * An options object for initializing a split panel.
   */
  export interface IOptions extends Partial<AccordionLayout.IOptions> {
    /**
     * The accordion layout to use for the accordion panel.
     *
     * If this is provided, the other options are ignored.
     *
     * The default is a new `AccordionLayout`.
     */
    layout?: AccordionLayout;
  }

  /**
   * The default implementation of `IRenderer`.
   */
  export class Renderer extends SplitPanel.Renderer implements IRenderer {
    /**
     * Render the collapse indicator for a section title.
     *
     * @param data - The data to use for rendering the section title.
     *
     * @returns A element representing the collapse indicator.
     */
    createCollapseIcon(data: Title<Widget>): HTMLElement {
      return document.createElement("span");
    }

    /**
     * Render the element for a section title.
     *
     * @param data - The data to use for rendering the section title.
     *
     * @returns A element representing the section title.
     */
    createSectionTitle(data: Title<Widget>): HTMLElement {
      const handle = document.createElement("h3");
      handle.id = this.createTitleKey(data);
      handle.className = "lm-AccordionPanel-title";
      handle.title = data.caption;
      for (const aData in data.dataset) {
        handle.dataset[aData] = data.dataset[aData];
      }

      const collapser = handle.appendChild(this.createCollapseIcon(data));
      collapser.className = "lm-AccordionPanel-titleCollapser";

      const label = handle.appendChild(document.createElement("span"));
      label.className = "lm-AccordionPanel-titleLabel";
      label.textContent = data.label;

      return handle;
    }

    /**
     * Create a unique render key for the title.
     *
     * @param data - The data to use for the title.
     *
     * @returns The unique render key for the title.
     *
     * #### Notes
     * This method caches the key against the section title the first time
     * the key is generated.
     */
    createTitleKey(data: Title<Widget>): string {
      let key = this._titleKeys.get(data);
      if (key === undefined) {
        key = `title-key-${this._titleID++}`;
        this._titleKeys.set(data, key);
      }
      return key;
    }

    private _titleID = 0;
    private _titleKeys = new WeakMap<Title<Widget>, string>();
  }

  /**
   * The default `Renderer` instance.
   */
  export const defaultRenderer = new Renderer();
}

namespace Private {
  /**
   * Create an accordion layout for the given panel options.
   *
   * @param options Panel options
   * @returns Panel layout
   */
  export function createLayout(
    options: AccordionPanel.IOptions
  ): AccordionLayout {
    return (
      options.layout ||
      new AccordionLayout({
        renderer: options.renderer || AccordionPanel.defaultRenderer,
        orientation: options.orientation,
        alignment: options.alignment,
        spacing: options.spacing,
        titleSpace: options.titleSpace,
      })
    );
  }
}
