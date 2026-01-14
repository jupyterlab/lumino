// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { ArrayExt } from '@lumino/algorithm';
import { Message } from '@lumino/messaging';
import { ISignal, Signal } from '@lumino/signaling';
import { AccordionLayout } from './accordionlayout';
import { SplitLayout } from './splitlayout';
import { SplitPanel } from './splitpanel';
import { Title } from './title';
import { Widget } from './widget';

/**
 * A panel which arranges its widgets into resizable sections separated by a title widget.
 *
 * #### Notes
 * This class provides a convenience wrapper around {@link AccordionLayout}.
 *
 * See also the related [example](../../examples/accordionpanel/index.html) and
 * its [source](https://github.com/jupyterlab/lumino/tree/main/examples/example-accordionpanel).
 */
export class AccordionPanel extends SplitPanel {
  /**
   * Construct a new accordion panel.
   *
   * @param options - The options for initializing the accordion panel.
   *
   */
  private _spacer: Widget;
  
  constructor(options: AccordionPanel.IOptions = {}) {
    super({ ...options, layout: Private.createLayout(options) });
    this.addClass('lm-AccordionPanel');
    this._collapseMode = options.collapseMode || 'last-open';

    // 1. Initialize the spacer
    this._spacer = new Widget();
    this._spacer.addClass('lm-AccordionPanel-spacer');
    
    // 2. IMPORTANT: Always add the spacer if we are in in-place mode.
    // We add it via super.addWidget so it doesn't trigger our overridden addWidget.
    if (this._collapseMode === 'in-place') {
      super.addWidget(this._spacer);
    }
  }

  /**
   * Ensure the spacer is at the end only when 'in-place' is active.
   */
  get collapseMode(): 'last-open' | 'in-place' {
    return this._collapseMode;
  }

  set collapseMode(value: 'last-open' | 'in-place') {
    if (this._collapseMode === value) {
      return;
    }
    this._collapseMode = value;

    if (value === 'in-place') {
      super.addWidget(this._spacer);
    } else {
      this._spacer.parent = null;
    }
    this.update();
  }

  /**
   * Filter titles dynamically based on the spacer's actual position.
   */
  get titles(): ReadonlyArray<HTMLElement> {
    const allTitles = (this.layout as AccordionLayout).titles;
    const widgets = (this.layout as AccordionLayout).widgets;
    const spacerIndex = widgets.indexOf(this._spacer);

    if (spacerIndex !== -1) {
      const filtered = [...allTitles];
      filtered.splice(spacerIndex, 1);
      return filtered;
    }
    return allTitles;
  }

  /**
   * The renderer used by the accordion panel.
   */
  get renderer(): AccordionPanel.IRenderer {
    return (this.layout as AccordionLayout).renderer;
  }

  /**
   * The section title space.
   *
   * This is the height if the panel is vertical and the width if it is
   * horizontal.
   */
  get titleSpace(): number {
    return (this.layout as AccordionLayout).titleSpace;
  }
  set titleSpace(value: number) {
    (this.layout as AccordionLayout).titleSpace = value;
  }

  /**
   * A signal emitted when a widget of the AccordionPanel is collapsed or expanded.
   */
  get expansionToggled(): ISignal<this, number> {
    return this._expansionToggled;
  }

  /**
   * Add a widget to the end of the panel.
   *
   * @param widget - The widget to add to the panel.
   *
   * #### Notes
   * If the widget is already contained in the panel, it will be moved.
   */
  addWidget(widget: Widget): void {
    const widgets = (this.layout as AccordionLayout).widgets;
    const spacerIndex = widgets.indexOf(this._spacer);
    
    if (this.collapseMode === 'in-place' && spacerIndex !== -1) {
      this.insertWidget(spacerIndex, widget);
    } else {
      super.addWidget(widget);
      widget.title.changed.connect(this._onTitleChanged, this);
    }
  }
  /**
   * Collapse the widget at position `index`.
   *
   * #### Notes
   * If no widget is found for `index`, this will bail.
   *
   * @param index Widget index
   */
  collapse(index: number): void {
    const widget = (this.layout as AccordionLayout).widgets[index];

    if (widget && !widget.isHidden) {
      this._toggleExpansion(index);
    }
  }

  /**
   * Expand the widget at position `index`.
   *
   * #### Notes
   * If no widget is found for `index`, this will bail.
   *
   * @param index Widget index
   */
  expand(index: number): void {
    const widget = (this.layout as AccordionLayout).widgets[index];

    if (widget && widget.isHidden) {
      this._toggleExpansion(index);
    }
  }

  /**
   * Insert a widget at the specified index.
   *
   * @param index - The index at which to insert the widget.
   *
   * @param widget - The widget to insert into to the panel.
   *
   * #### Notes
   * If the widget is already contained in the panel, it will be moved.
   */
  insertWidget(index: number, widget: Widget): void {
    super.insertWidget(index, widget);
    widget.title.changed.connect(this._onTitleChanged, this);
  }

  /**
   * Handle the DOM events for the accordion panel.
   *
   * @param event - The DOM event sent to the panel.
   *
   * #### Notes
   * This method implements the DOM `EventListener` interface and is
   * called in response to events on the panel's DOM node. It should
   * not be called directly by user code.
   */
  handleEvent(event: Event): void {
    super.handleEvent(event);
    switch (event.type) {
      case 'click':
        this._evtClick(event as MouseEvent);
        break;
      case 'keydown':
        this._eventKeyDown(event as KeyboardEvent);
        break;
    }
  }

  /**
   * A message handler invoked on a `'before-attach'` message.
   */
  protected onBeforeAttach(msg: Message): void {
    this.node.addEventListener('click', this);
    this.node.addEventListener('keydown', this);
    super.onBeforeAttach(msg);
  }

  /**
   * A message handler invoked on an `'after-detach'` message.
   */
  protected onAfterDetach(msg: Message): void {
    super.onAfterDetach(msg);
    this.node.removeEventListener('click', this);
    this.node.removeEventListener('keydown', this);
  }

  /**
   * Handle the `changed` signal of a title object.
   */
  private _onTitleChanged(sender: Title<Widget>): void {
    const index = ArrayExt.findFirstIndex(this.widgets, widget => {
      return widget.contains(sender.owner);
    });

    if (index >= 0) {
      (this.layout as AccordionLayout).updateTitle(index, sender.owner);
      this.update();
    }
  }

  /**
   * Compute the size of widgets in this panel on the title click event.
   * On closing, the size of the widget is cached and we will try to expand
   * the last opened widget.
   * On opening, we will use the cached size if it is available to restore the
   * widget.
   * In both cases, if we can not compute the size of widgets, we will let
   * `SplitLayout` decide.
   *
   * @param index - The index of widget to be opened of closed
   *
   * @returns Relative size of widgets in this panel, if this size can
   * not be computed, return `undefined`
   */
private _computeWidgetSize(index: number): number[] | undefined {
  const layout = this.layout as AccordionLayout;
  const widgets = layout.widgets;
  const widget = widgets[index];
  
  if (!widget || widget === this._spacer) {
    return undefined;
  }

  const isHidden = widget.isHidden;
  const widgetSizes = layout.absoluteSizes();
  const delta = (isHidden ? -1 : 1) * this.spacing;
  const totalPanelSize = widgetSizes.reduce((acc, val) => acc + val, 0);

  let newSize = [...widgetSizes];

  if (this._collapseMode === 'in-place') {
    const currentSize = widgetSizes[index];
    
    if (!isHidden) {
      // --- COLLAPSING ---
      this._widgetSizesCache.set(widget, currentSize);
      newSize[index] = 0;

      // Find the next available "consumer" (could be a widget or our spacer)
      let consumerIndex = -1;
      for (let i = index + 1; i < newSize.length; i++) {
        // The spacer is always at the end and is never hidden
        if (widgets[i] === this._spacer || !widgets[i].isHidden) {
          consumerIndex = i;
          break;
        }
      }

      if (consumerIndex !== -1) {
        newSize[consumerIndex] += currentSize + delta;
      }
    } else {
      // --- EXPANDING ---
      const previousSize = this._widgetSizesCache.get(widget) || 0;
      newSize[index] = previousSize;

      let consumerIndex = -1;
      for (let i = index + 1; i < newSize.length; i++) {
        if (widgets[i] === this._spacer || !widgets[i].isHidden) {
          consumerIndex = i;
          break;
        }
      }

      if (consumerIndex !== -1) {
        // Take space back from the successor (or spacer)
        newSize[consumerIndex] = Math.max(0, newSize[consumerIndex] - (previousSize - delta));
      }
    }

    const denominator = totalPanelSize + delta;
    return denominator <= 0 ? undefined : newSize.map(sz => sz / denominator);
  }
    // --- DEFAULT: 'last-open' behavior ---
    if (!isHidden) {
      const currentSize = widgetSizes[index];
      this._widgetSizesCache.set(widget, currentSize);
      newSize[index] = 0;

      const widgetToCollapse = newSize.map(sz => sz > 0).lastIndexOf(true);
      if (widgetToCollapse === -1) {
        return undefined;
      }
      newSize[widgetToCollapse] = widgetSizes[widgetToCollapse] + currentSize + delta;
    } else {
      const previousSize = this._widgetSizesCache.get(widget);
      if (!previousSize) {
        return undefined;
      }
      newSize[index] += previousSize;

      const widgetToCollapse = newSize
        .map(sz => sz - previousSize > 0)
        .lastIndexOf(true);
      if (widgetToCollapse === -1) {
        newSize.forEach((_, idx) => {
          if (idx !== index) {
            newSize[idx] -= (widgetSizes[idx] / totalPanelSize) * (previousSize - delta);
          }
        });
      } else {
        newSize[widgetToCollapse] -= previousSize - delta;
      }
    }
    return newSize.map(sz => sz / (totalPanelSize + delta));
  }

  /**
   * Handle the `'click'` event for the accordion panel
   */
  private _evtClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;

    if (target) {
      const index = ArrayExt.findFirstIndex(this.titles, title => {
        return title.contains(target);
      });

      if (index >= 0) {
        event.preventDefault();
        event.stopPropagation();
        this._toggleExpansion(index);
      }
    }
  }

  /**
   * Handle the `'keydown'` event for the accordion panel.
   */
  private _eventKeyDown(event: KeyboardEvent): void {
    if (event.defaultPrevented) {
      return;
    }

    const target = event.target as HTMLElement | null;
    let handled = false;
    if (target) {
      const index = ArrayExt.findFirstIndex(this.titles, title => {
        return title.contains(target);
      });

      if (index >= 0) {
        const keyCode = event.keyCode.toString();

        // If Space or Enter is pressed on title, emulate click event
        if (event.key.match(/Space|Enter/) || keyCode.match(/13|32/)) {
          target.click();
          handled = true;
        } else if (
          this.orientation === 'horizontal'
            ? event.key.match(/ArrowLeft|ArrowRight/) || keyCode.match(/37|39/)
            : event.key.match(/ArrowUp|ArrowDown/) || keyCode.match(/38|40/)
        ) {
          // If Up or Down (for vertical) / Left or Right (for horizontal) is pressed on title, loop on titles
          const direction =
            event.key.match(/ArrowLeft|ArrowUp/) || keyCode.match(/37|38/)
              ? -1
              : 1;
          const length = this.titles.length;
          const newIndex = (index + length + direction) % length;

          this.titles[newIndex].focus();
          handled = true;
        } else if (event.key === 'End' || keyCode === '35') {
          // If End is pressed on title, focus on the last title
          this.titles[this.titles.length - 1].focus();
          handled = true;
        } else if (event.key === 'Home' || keyCode === '36') {
          // If Home is pressed on title, focus on the first title
          this.titles[0].focus();
          handled = true;
        }
      }

      if (handled) {
        event.preventDefault();
      }
    }
  }

  private _toggleExpansion(index: number) {
    const widgets = (this.layout as AccordionLayout).widgets;
    const widget = widgets[index];
    const titles = (this.layout as AccordionLayout).titles;
    const title = titles[index];

    if (!widget || widget === this._spacer) {
      return;
    }

    const newSize = this._computeWidgetSize(index);

    if (widget.isHidden) {
      title.classList.add('lm-mod-expanded');
      title.setAttribute('aria-expanded', 'true');
      widget.show();
    } else {
      title.classList.remove('lm-mod-expanded');
      title.setAttribute('aria-expanded', 'false');
      widget.hide();
    }
    
    if (newSize) {
      // Set sizes WITHOUT animation to prevent redistribution flicker
      this.setRelativeSizes(newSize);
    }

    this._expansionToggled.emit(index);
  }

  private _collapseMode: 'last-open' | 'in-place';
  private _widgetSizesCache: WeakMap<Widget, number> = new WeakMap();
  private _expansionToggled = new Signal<this, number>(this);
}

/**
 * The namespace for the `AccordionPanel` class statics.
 */
export namespace AccordionPanel {
  /**
   * A type alias for a accordion panel orientation.
   */
  export type Orientation = SplitLayout.Orientation;

  /**
   * A type alias for a accordion panel alignment.
   */
  export type Alignment = SplitLayout.Alignment;

  /**
   * A type alias for a accordion panel renderer.
   */
  export type IRenderer = AccordionLayout.IRenderer;

  /**
   * An options object for initializing a accordion panel.
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

    /**
     * The collapse behavior mode for accordion sections.
     *
     * - `'last-open'` (default): When a section collapses, its space is redistributed
     *   to the last open section. This is the original behavior.
     * - `'in-place'`: Sections collapse and expand in place without affecting other
     *   sections. The panel itself shrinks/grows accordingly.
     *
     * #### Example
     * ```typescript
     * const panel = new AccordionPanel({
     *   collapseMode: 'in-place',
     *   orientation: 'vertical'
     * });
     * ```
     */
    collapseMode?: 'last-open' | 'in-place';
  }

  /**
   * The default implementation of `IRenderer`.
   */
  export class Renderer extends SplitPanel.Renderer implements IRenderer {
    constructor() {
      super();
      this._uuid = ++Renderer._nInstance;
    }
    /**
     * A selector which matches any title node in the accordion.
     */
    readonly titleClassName = 'lm-AccordionPanel-title';

    /**
     * Render the collapse indicator for a section title.
     *
     * @param data - The data to use for rendering the section title.
     *
     * @returns A element representing the collapse indicator.
     */
    createCollapseIcon(data: Title<Widget>): HTMLElement {
      return document.createElement('span');
    }

    /**
     * Render the element for a section title.
     *
     * @param data - The data to use for rendering the section title.
     *
     * @returns A element representing the section title.
     */
    createSectionTitle(data: Title<Widget>): HTMLElement {
      const handle = document.createElement('h3');
      handle.setAttribute('tabindex', '0');
      handle.id = this.createTitleKey(data);
      handle.className = this.titleClassName;
      for (const aData in data.dataset) {
        handle.dataset[aData] = data.dataset[aData];
      }

      const collapser = handle.appendChild(this.createCollapseIcon(data));
      collapser.className = 'lm-AccordionPanel-titleCollapser';

      const label = handle.appendChild(document.createElement('span'));
      label.className = 'lm-AccordionPanel-titleLabel';
      label.textContent = data.label;
      label.title = data.caption || data.label;

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
        key = `title-key-${this._uuid}-${this._titleID++}`;
        this._titleKeys.set(data, key);
      }
      return key;
    }

    private static _nInstance = 0;
    private readonly _uuid: number;
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
        titleSpace: options.titleSpace
      })
    );
  }
}
