/*
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */

import { ArrayExt } from '@lumino/algorithm';
import { UUID } from '@lumino/coreutils';
import { SplitLayout } from './splitlayout';
import { Title } from './title';
import Utils from './utils';
import { Widget } from './widget';

/**
 * A layout which arranges its widgets into collapsible resizable sections.
 */
export class AccordionLayout extends SplitLayout {
  /**
   * Construct a new accordion layout.
   *
   * @param options - The options for initializing the layout.
   *
   * #### Notes
   * The default orientation will be vertical.
   *
   * Titles must be rotated for horizontal accordion panel using CSS: see accordionpanel.css
   */
  constructor(options: AccordionLayout.IOptions) {
    super({ ...options, orientation: options.orientation || 'vertical' });
    this.titleSpace = options.titleSpace || 22;
  }

  /**
   * The section title height or width depending on the orientation.
   */
  get titleSpace(): number {
    return this.widgetOffset;
  }
  set titleSpace(value: number) {
    value = Utils.clampDimension(value);
    if (this.widgetOffset === value) {
      return;
    }
    this.widgetOffset = value;
    if (!this.parent) {
      return;
    }
    this.parent.fit();
  }

  /**
   * A read-only array of the section titles in the panel.
   */
  get titles(): ReadonlyArray<HTMLElement> {
    return this._titles;
  }

  /**
   * Dispose of the resources held by the layout.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }

    // Clear the layout state.
    this._titles.length = 0;

    // Dispose of the rest of the layout.
    super.dispose();
  }

  /**
   * The renderer used by the accordion layout.
   */
  readonly renderer: AccordionLayout.IRenderer;

  public updateTitle(index: number, widget: Widget): void {
    const oldTitle = this._titles[index];
    const expanded = oldTitle.classList.contains('lm-mod-expanded');
    const newTitle = Private.createTitle(this.renderer, widget.title, expanded);
    this._titles[index] = newTitle;

    // Add the title node to the parent before the widget.
    this.parent!.node.replaceChild(newTitle, oldTitle);
  }

  /**
   * Insert a widget into the layout at the specified index.
   *
   * @param index - The index at which to insert the widget.
   *
   * @param widget - The widget to insert into the layout.
   *
   * #### Notes
   * The index will be clamped to the bounds of the widgets.
   *
   * If the widget is already added to the layout, it will be moved.
   *
   * #### Undefined Behavior
   * An `index` which is non-integral.
   */
  insertWidget(index: number, widget: Widget): void {
    if (!widget.id) {
      widget.id = `id-${UUID.uuid4()}`;
    }
    super.insertWidget(index, widget);
  }

  /**
   * Attach a widget to the parent's DOM node.
   *
   * @param index - The current index of the widget in the layout.
   *
   * @param widget - The widget to attach to the parent.
   */
  protected attachWidget(index: number, widget: Widget): void {
    const title = Private.createTitle(this.renderer, widget.title);

    ArrayExt.insert(this._titles, index, title);

    // Add the title node to the parent before the widget.
    this.parent!.node.appendChild(title);

    widget.node.setAttribute('role', 'region');
    widget.node.setAttribute('aria-labelledby', title.id);

    super.attachWidget(index, widget);
  }

  /**
   * Move a widget in the parent's DOM node.
   *
   * @param fromIndex - The previous index of the widget in the layout.
   *
   * @param toIndex - The current index of the widget in the layout.
   *
   * @param widget - The widget to move in the parent.
   */
  protected moveWidget(
    fromIndex: number,
    toIndex: number,
    widget: Widget
  ): void {
    ArrayExt.move(this._titles, fromIndex, toIndex);
    super.moveWidget(fromIndex, toIndex, widget);
  }

  /**
   * Detach a widget from the parent's DOM node.
   *
   * @param index - The previous index of the widget in the layout.
   *
   * @param widget - The widget to detach from the parent.
   *
   * #### Notes
   * This is a reimplementation of the superclass method.
   */
  protected detachWidget(index: number, widget: Widget): void {
    const title = ArrayExt.removeAt(this._titles, index);

    this.parent!.node.removeChild(title!);

    super.detachWidget(index, widget);
  }

  /**
   * Update the item position.
   *
   * @param i Item index
   * @param isHorizontal Whether the layout is horizontal or not
   * @param left Left position in pixels
   * @param top Top position in pixels
   * @param height Item height
   * @param width Item width
   * @param size Item size
   */
  protected updateItemPosition(
    i: number,
    isHorizontal: boolean,
    left: number,
    top: number,
    height: number,
    width: number,
    size: number
  ): void {
    const titleStyle = this._titles[i].style;

    // Titles must be rotated for horizontal accordion panel using CSS: see accordionpanel.css
    titleStyle.top = `${top}px`;
    titleStyle.left = `${left}px`;
    titleStyle.height = `${this.widgetOffset}px`;
    if (isHorizontal) {
      titleStyle.width = `${height}px`;
    } else {
      titleStyle.width = `${width}px`;
    }

    super.updateItemPosition(i, isHorizontal, left, top, height, width, size);
  }

  private _titles: HTMLElement[] = [];
}

export namespace AccordionLayout {
  /**
   * A type alias for a accordion layout orientation.
   */
  export type Orientation = SplitLayout.Orientation;

  /**
   * A type alias for a accordion layout alignment.
   */
  export type Alignment = SplitLayout.Alignment;

  /**
   * An options object for initializing a accordion layout.
   */
  export interface IOptions extends SplitLayout.IOptions {
    /**
     * The renderer to use for the accordion layout.
     */
    renderer: IRenderer;

    /**
     * The section title height or width depending on the orientation.
     *
     * The default is `22`.
     */
    titleSpace?: number;
  }

  /**
   * A renderer for use with an accordion layout.
   */
  export interface IRenderer extends SplitLayout.IRenderer {
    /**
     * Common class name for all accordion titles.
     */
    readonly titleClassName: string;

    /**
     * Render the element for a section title.
     *
     * @param title - The data to use for rendering the section title.
     *
     * @returns A element representing the section title.
     */
    createSectionTitle(title: Title<Widget>): HTMLElement;
  }
}

namespace Private {
  /**
   * Create the title HTML element.
   *
   * @param renderer Accordion renderer
   * @param data Widget title
   * @returns Title HTML element
   */
  export function createTitle(
    renderer: AccordionLayout.IRenderer,
    data: Title<Widget>,
    expanded: boolean = true
  ): HTMLElement {
    const title = renderer.createSectionTitle(data);
    title.style.position = 'absolute';
    title.style.contain = 'strict';
    title.setAttribute('aria-label', `${data.label} Section`);
    title.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    title.setAttribute('aria-controls', data.owner.id);
    if (expanded) {
      title.classList.add('lm-mod-expanded');
    }
    return title;
  }
}
