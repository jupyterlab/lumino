// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { ArrayExt } from '@lumino/algorithm';
import { Message } from '@lumino/messaging';
import { AccordionLayout } from './accordionlayout';
import { SplitLayout } from './splitlayout';
import { SplitPanel } from './splitpanel';
import { Title } from './title';
import { Widget } from './widget';

/**
 * A panel which arranges its widgets into resizable sections separated by a title widget.
 *
 * #### Notes
 * This class provides a convenience wrapper around [[AccordionLayout]].
 */
export class AccordionPanel extends SplitPanel {
  /**
   * Construct a new accordion panel.
   *
   * @param options - The options for initializing the accordion panel.
   */
  constructor(options: AccordionPanel.IOptions = {}) {
    super({ ...options, layout: Private.createLayout(options) });
    this.addClass('lm-AccordionPanel');
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
   * A read-only array of the section titles in the panel.
   */
  get titles(): ReadonlyArray<HTMLElement> {
    return (this.layout as AccordionLayout).titles;
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
    super.addWidget(widget);
    widget.title.changed.connect(this._onTitleChanged, this);
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

        const title = this.titles[index];
        const widget = (this.layout as AccordionLayout).widgets[index];
        if (widget.isHidden) {
          title.classList.add('lm-mod-expanded');
          title.setAttribute('aria-expanded', 'true');
          widget.show();
        } else {
          title.classList.remove('lm-mod-expanded');
          title.setAttribute('aria-expanded', 'false');
          widget.hide();
        }
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
  }

  /**
   * The default implementation of `IRenderer`.
   */
  export class Renderer extends SplitPanel.Renderer implements IRenderer {
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
      handle.setAttribute('role', 'button');
      handle.setAttribute('tabindex', '0');
      handle.id = this.createTitleKey(data);
      handle.className = this.titleClassName;
      handle.title = data.caption;
      for (const aData in data.dataset) {
        handle.dataset[aData] = data.dataset[aData];
      }

      const collapser = handle.appendChild(this.createCollapseIcon(data));
      collapser.className = 'lm-AccordionPanel-titleCollapser';

      const label = handle.appendChild(document.createElement('span'));
      label.className = 'lm-AccordionPanel-titleLabel';
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
        titleSpace: options.titleSpace
      })
    );
  }
}
