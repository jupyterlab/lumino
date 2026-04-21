// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
import { ArrayExt } from '@lumino/algorithm';

import { IDisposable } from '@lumino/disposable';

import { Drag } from '@lumino/dragdrop';

import { Message } from '@lumino/messaging';

import { ISignal, Signal } from '@lumino/signaling';

import { Panel } from './panel';

import { SplitLayout } from './splitlayout';

import { Widget } from './widget';

/**
 * A panel which arranges its widgets into resizable sections.
 *
 * #### Notes
 * This class provides a convenience wrapper around a {@link SplitLayout}.
 */
export class SplitPanel extends Panel {
  /**
   * Construct a new split panel.
   *
   * @param options - The options for initializing the split panel.
   */
  constructor(options: SplitPanel.IOptions = {}) {
    super({ layout: Private.createLayout(options) });
    this.addClass('lm-SplitPanel');
    if (options.nodeCountThreshold !== undefined) {
      this._nodeCountThreshold = options.nodeCountThreshold;
    }
  }

  /**
   * Dispose of the resources held by the panel.
   */
  dispose(): void {
    this._releaseMouse();
    super.dispose();
  }

  /**
   * Get the layout orientation for the split panel.
   */
  get orientation(): SplitPanel.Orientation {
    return (this.layout as SplitLayout).orientation;
  }

  /**
   * Set the layout orientation for the split panel.
   */
  set orientation(value: SplitPanel.Orientation) {
    (this.layout as SplitLayout).orientation = value;
  }

  /**
   * Get the content alignment for the split panel.
   *
   * #### Notes
   * This is the alignment of the widgets in the layout direction.
   *
   * The alignment has no effect if the widgets can expand to fill the
   * entire split panel.
   */
  get alignment(): SplitPanel.Alignment {
    return (this.layout as SplitLayout).alignment;
  }

  /**
   * Set the content alignment for the split panel.
   *
   * #### Notes
   * This is the alignment of the widgets in the layout direction.
   *
   * The alignment has no effect if the widgets can expand to fill the
   * entire split panel.
   */
  set alignment(value: SplitPanel.Alignment) {
    (this.layout as SplitLayout).alignment = value;
  }

  /**
   * Get the inter-element spacing for the split panel.
   */
  get spacing(): number {
    return (this.layout as SplitLayout).spacing;
  }

  /**
   * Set the inter-element spacing for the split panel.
   */
  set spacing(value: number) {
    (this.layout as SplitLayout).spacing = value;
  }

  /**
   * The renderer used by the split panel.
   */
  get renderer(): SplitPanel.IRenderer {
    return (this.layout as SplitLayout).renderer;
  }

  /**
   * A signal emitted when a split handle has moved.
   */
  get handleMoved(): ISignal<this, void> {
    return this._handleMoved;
  }

  /**
   * A read-only array of the split handles in the panel.
   */
  get handles(): ReadonlyArray<HTMLDivElement> {
    return (this.layout as SplitLayout).handles;
  }

  /**
   * Get the relative sizes of the widgets in the panel.
   *
   * @returns A new array of the relative sizes of the widgets.
   *
   * #### Notes
   * The returned sizes reflect the sizes of the widgets normalized
   * relative to their siblings.
   *
   * This method **does not** measure the DOM nodes.
   */
  relativeSizes(): number[] {
    return (this.layout as SplitLayout).relativeSizes();
  }

  /**
   * Set the relative sizes for the widgets in the panel.
   *
   * @param sizes - The relative sizes for the widgets in the panel.
   * @param update - Update the layout after setting relative sizes.
   * Default is True.
   *
   * #### Notes
   * Extra values are ignored, too few will yield an undefined layout.
   *
   * The actual geometry of the DOM nodes is updated asynchronously.
   */
  setRelativeSizes(sizes: number[], update = true): void {
    (this.layout as SplitLayout).setRelativeSizes(sizes, update);
  }

  /**
   * Handle the DOM events for the split panel.
   *
   * @param event - The DOM event sent to the panel.
   *
   * #### Notes
   * This method implements the DOM `EventListener` interface and is
   * called in response to events on the panel's DOM node. It should
   * not be called directly by user code.
   */
  handleEvent(event: Event): void {
    switch (event.type) {
      case 'pointerdown':
        this._evtPointerDown(event as PointerEvent);
        break;
      case 'pointermove':
        this._evtPointerMove(event as PointerEvent);
        break;
      case 'pointerup':
        this._evtPointerUp(event as PointerEvent);
        break;
      case 'keydown':
        this._evtKeyDown(event as KeyboardEvent);
        break;
      case 'contextmenu':
        event.preventDefault();
        event.stopPropagation();
        break;
    }
  }

  /**
   * A message handler invoked on a `'before-attach'` message.
   */
  protected onBeforeAttach(msg: Message): void {
    this.node.addEventListener('pointerdown', this);
  }

  /**
   * A message handler invoked on an `'after-detach'` message.
   */
  protected onAfterDetach(msg: Message): void {
    this.node.removeEventListener('pointerdown', this);
    this._releaseMouse();
  }

  /**
   * A message handler invoked on a `'child-added'` message.
   */
  protected onChildAdded(msg: Widget.ChildMessage): void {
    msg.child.addClass('lm-SplitPanel-child');
    this._releaseMouse();
  }

  /**
   * A message handler invoked on a `'child-removed'` message.
   */
  protected onChildRemoved(msg: Widget.ChildMessage): void {
    msg.child.removeClass('lm-SplitPanel-child');
    this._releaseMouse();
  }

  /**
   * Handle the `'keydown'` event for the split panel.
   */
  private _evtKeyDown(event: KeyboardEvent): void {
    // Stop input events during drag.
    if (this._pressData) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Release the mouse if `Escape` is pressed.
    if (event.keyCode === 27) {
      this._releaseMouse();
    }
  }

  /**
   * Handle the `'pointerdown'` event for the split panel.
   */
  private _evtPointerDown(event: PointerEvent): void {
    // Do nothing if the primary button is not pressed.
    if (event.button !== 0) {
      return;
    }

    // Find the handle which contains the target, if any.
    let layout = this.layout as SplitLayout;
    let index = ArrayExt.findFirstIndex(layout.handles, handle => {
      return handle.contains(event.target as HTMLElement);
    });

    // Bail early if the mouse press was not on a handle.
    if (index === -1) {
      return;
    }

    // Stop the event when a split handle is pressed.
    event.preventDefault();
    event.stopPropagation();

    // Add the extra document listeners.
    document.addEventListener('pointerup', this, true);
    document.addEventListener('pointermove', this, true);
    document.addEventListener('keydown', this, true);
    document.addEventListener('contextmenu', this, true);

    // Compute the offset delta for the handle press.
    let delta: number;
    let handle = layout.handles[index];
    let rect = handle.getBoundingClientRect();
    if (layout.orientation === 'horizontal') {
      delta = event.clientX - rect.left;
    } else {
      delta = event.clientY - rect.top;
    }

    // Override the cursor and store the press data.
    let style = window.getComputedStyle(handle);
    let override = Drag.overrideCursor(style.cursor!);
    this._pressData = { index, delta, override };

    // Freeze heavy leaf widgets immediately when drag starts.
    this._freezeHeavyLeaves();
  }

  /**
   * Handle the `'pointermove'` event for the split panel.
   */
  private _evtPointerMove(event: PointerEvent): void {
    // Stop the event when dragging a split handle.
    event.preventDefault();
    event.stopPropagation();

    // Compute the desired offset position for the handle.
    let pos: number;
    let layout = this.layout as SplitLayout;
    let rect = this.node.getBoundingClientRect();
    if (layout.orientation === 'horizontal') {
      pos = event.clientX - rect.left - this._pressData!.delta;
    } else {
      pos = event.clientY - rect.top - this._pressData!.delta;
    }

    // Move the handle. The actual layout update is deferred via
    // the lumino message loop; the PerformanceObserver set up on
    // pointerdown will detect if the resulting frame is slow.
    layout.moveHandle(this._pressData!.index, pos);

    // Debounce: refresh frozen elements after the user stops moving.
    this._scheduleRefresh();
  }

  /**
   * Handle the `'pointerup'` event for the split panel.
   */
  private _evtPointerUp(event: PointerEvent): void {
    // Do nothing if the primary button is not released.
    if (event.button !== 0) {
      return;
    }

    // Stop the event when releasing a handle.
    event.preventDefault();
    event.stopPropagation();

    // Finalize the mouse release.
    this._releaseMouse();
  }

  /**
   * Release the mouse grab for the split panel.
   */
  private _releaseMouse(): void {
    // Bail early if no drag is in progress.
    if (!this._pressData) {
      return;
    }

    // Unfreeze all contained elements.
    this._unfreezeElements();

    // Clear the override cursor.
    this._pressData.override.dispose();
    this._pressData = null;

    // Emit the handle moved signal.
    this._handleMoved.emit();

    // Remove the extra document listeners.
    document.removeEventListener('keydown', this, true);
    document.removeEventListener('pointerup', this, true);
    document.removeEventListener('pointermove', this, true);
    document.removeEventListener('contextmenu', this, true);
  }

  /**
   * Walk the widget tree to find leaf widgets, then apply
   * `contain: strict` with pinned width/height on those whose
   * subtree exceeds the node count threshold.
   */
  private _freezeHeavyLeaves(): void {
    if (this._frozenGroups.length > 0) {
      return;
    }

    // Find deepest heavy widgets in the tree.
    let targets: Widget[] = [];
    for (let i = 0; i < this.widgets.length; i++) {
      Private.collectHeavyWidgets(this.widgets[i], this._nodeCountThreshold, targets);
    }

    // Read dimensions before mutations.
    let groups: {
      el: HTMLElement;
      rect: DOMRect;
      isHead: boolean;
      prevContain: string;
      prevWidth: string;
      prevMinWidth: string;
      prevMaxWidth: string;
      prevHeight: string;
      prevMinHeight: string;
      prevMaxHeight: string;
      prevContentVisibility: string;
      prevContainIntrinsicWidth: string;
      prevContainIntrinsicHeight: string;
    }[][] = [];
    for (let target of targets) {
      let head = target.node;
      if (head.style.contain === 'strict') {
        continue;
      }
      let group: {
        el: HTMLElement;
        rect: DOMRect;
        isHead: boolean;
        prevContain: string;
        prevWidth: string;
        prevMinWidth: string;
        prevMaxWidth: string;
        prevHeight: string;
        prevMinHeight: string;
        prevMaxHeight: string;
        prevContentVisibility: string;
        prevContainIntrinsicWidth: string;
        prevContainIntrinsicHeight: string;
      }[] = [];

      group.push({
        el: head,
        rect: head.getBoundingClientRect(),
        isHead: true,
        prevContain: head.style.contain,
        prevWidth: head.style.width,
        prevMinWidth: head.style.minWidth,
        prevMaxWidth: head.style.maxWidth,
        prevHeight: head.style.height,
        prevMinHeight: head.style.minHeight,
        prevMaxHeight: head.style.maxHeight,
        prevContentVisibility: head.style.getPropertyValue('content-visibility'),
        prevContainIntrinsicWidth: head.style.containIntrinsicWidth,
        prevContainIntrinsicHeight: head.style.containIntrinsicHeight
      });

      for (let i = 0; i < head.children.length; i++) {
        let child = head.children[i] as HTMLElement;
        group.push({
          el: child,
          rect: child.getBoundingClientRect(),
          isHead: false,
          prevContain: child.style.contain,
          prevWidth: child.style.width,
          prevMinWidth: child.style.minWidth,
          prevMaxWidth: child.style.maxWidth,
          prevHeight: child.style.height,
          prevMinHeight: child.style.minHeight,
          prevMaxHeight: child.style.maxHeight,
          prevContentVisibility: child.style.getPropertyValue('content-visibility'),
          prevContainIntrinsicWidth: child.style.containIntrinsicWidth,
          prevContainIntrinsicHeight: child.style.containIntrinsicHeight
        });
      }

      groups.push(group);
    }

    // Apply containment and pinned sizes.
    for (let group of groups) {
      let frozenGroup: Private.IFrozenElement[] = [];
      for (let entry of group) {
        frozenGroup.push({
          element: entry.el,
          isHead: entry.isHead,
          prevContain: entry.prevContain,
          prevWidth: entry.prevWidth,
          prevMinWidth: entry.prevMinWidth,
          prevMaxWidth: entry.prevMaxWidth,
          prevHeight: entry.prevHeight,
          prevMinHeight: entry.prevMinHeight,
          prevMaxHeight: entry.prevMaxHeight,
          prevContentVisibility: entry.prevContentVisibility,
          prevContainIntrinsicWidth: entry.prevContainIntrinsicWidth,
          prevContainIntrinsicHeight: entry.prevContainIntrinsicHeight
        });

        entry.el.style.width = `${entry.rect.width}px`;
        entry.el.style.minWidth = `${entry.rect.width}px`;
        entry.el.style.maxWidth = `${entry.rect.width}px`;
        entry.el.style.maxHeight = `${entry.rect.height}px`;

        if (entry.isHead) {
          entry.el.style.height = `${entry.rect.height}px`;
          entry.el.style.minHeight = `${entry.rect.height}px`;
          entry.el.style.contain = 'strict';
          entry.el.classList.add('lm-layout-frozen');
        } else {
          entry.el.style.setProperty('content-visibility', 'auto');
          entry.el.style.containIntrinsicWidth = `${entry.rect.width}px`;
          entry.el.style.containIntrinsicHeight = `${entry.rect.height}px`;
        }
      }
      this._frozenGroups.push(frozenGroup);
    }

    console.log(`[SplitPanel] froze ${this._frozenGroups.length} groups`);

    // Start periodic interval to keep sizes roughly correct
    // during long continuous drags.
    if (this._frozenGroups.length > 0 && this._intervalId === 0) {
      this._intervalId = window.setInterval(() => {
        this._refreshFrozenElements();
      }, Private.REFRESH_INTERVAL_MS);
    }
  }

  /**
   * Schedule a debounced refresh of frozen elements. Resets on
   * each call so the refresh only fires after the user stops
   * moving the handle.
   */
  private _scheduleRefresh(): void {
    if (this._frozenGroups.length === 0) {
      return;
    }
    if (this._refreshTimerId !== 0) {
      clearTimeout(this._refreshTimerId);
    }
    this._refreshTimerId = window.setTimeout(() => {
      this._refreshTimerId = 0;
      this._refreshFrozenElements();
    }, Private.REFRESH_DEBOUNCE_MS);
  }

  /**
   * Refresh frozen groups one at a time, spreading the reflow
   * cost across multiple animation frames.
   */
  private _refreshFrozenElements(): void {
    console.log(`[SplitPanel] refreshing ${this._frozenGroups.length} frozen groups (staggered)`);
    let g = 0;
    const step = () => {
      if (g >= this._frozenGroups.length) {
        this._refreshRAFId = 0;
        return;
      }
      let group = this._frozenGroups[g];
      // Frame 1: lift containment to let the browser settle layout.
      for (let entry of group) {
        let el = entry.element;
        el.style.contain = entry.prevContain;
        el.style.width = '';
        el.style.minWidth = '';
        el.style.maxWidth = '';
        el.style.height = '';
        el.style.minHeight = '';
        el.style.maxHeight = '';
        el.style.setProperty('content-visibility', entry.prevContentVisibility);
        el.style.containIntrinsicWidth = entry.prevContainIntrinsicWidth;
        el.style.containIntrinsicHeight = entry.prevContainIntrinsicHeight;
      }
      // Frame 2: read the settled rect and re-pin.
      this._refreshRAFId = requestAnimationFrame(() => {
        let rects = group.map(entry => entry.element.getBoundingClientRect());
        for (let i = 0; i < group.length; i++) {
          let entry = group[i];
          let rect = rects[i];
          let el = entry.element;
          el.style.width = `${rect.width}px`;
          el.style.minWidth = `${rect.width}px`;
          el.style.maxWidth = `${rect.width}px`;
          el.style.maxHeight = `${rect.height}px`;
          if (entry.isHead) {
            el.style.height = `${rect.height}px`;
            el.style.minHeight = `${rect.height}px`;
            el.style.contain = 'strict';
          } else {
            el.style.setProperty('content-visibility', 'auto');
            el.style.containIntrinsicWidth = `${rect.width}px`;
            el.style.containIntrinsicHeight = `${rect.height}px`;
          }
        }
        g++;
        this._refreshRAFId = requestAnimationFrame(step);
      });
    };
    this._refreshRAFId = requestAnimationFrame(step);
  }

  /**
   * Remove containment and restore original styles on all frozen
   * elements.
   */
  private _unfreezeElements(): void {
    console.log(`[SplitPanel] unfreezing ${this._frozenGroups.length} groups`);
    if (this._refreshTimerId !== 0) {
      clearTimeout(this._refreshTimerId);
      this._refreshTimerId = 0;
    }
    if (this._refreshRAFId !== 0) {
      cancelAnimationFrame(this._refreshRAFId);
      this._refreshRAFId = 0;
    }
    if (this._intervalId !== 0) {
      clearInterval(this._intervalId);
      this._intervalId = 0;
    }
    for (let group of this._frozenGroups) {
      for (let entry of group) {
        entry.element.style.contain = entry.prevContain;
        entry.element.style.width = entry.prevWidth;
        entry.element.style.minWidth = entry.prevMinWidth;
        entry.element.style.maxWidth = entry.prevMaxWidth;
        entry.element.style.height = entry.prevHeight;
        entry.element.style.minHeight = entry.prevMinHeight;
        entry.element.style.maxHeight = entry.prevMaxHeight;
        entry.element.style.setProperty('content-visibility', entry.prevContentVisibility);
        entry.element.style.containIntrinsicWidth = entry.prevContainIntrinsicWidth;
        entry.element.style.containIntrinsicHeight = entry.prevContainIntrinsicHeight;
        if (entry.isHead) {
          entry.element.classList.remove('lm-layout-frozen');
        }
      }
    }
    this._frozenGroups = [];
  }

  private _handleMoved = new Signal<any, void>(this);
  private _pressData: Private.IPressData | null = null;
  private _nodeCountThreshold = Private.DEFAULT_NODE_COUNT_THRESHOLD;
  private _frozenGroups: Private.IFrozenElement[][] = [];
  private _refreshTimerId = 0;
  private _refreshRAFId = 0;
  private _intervalId = 0;
}

/**
 * The namespace for the `SplitPanel` class statics.
 */
export namespace SplitPanel {
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
  export type IRenderer = SplitLayout.IRenderer;

  /**
   * An options object for initializing a split panel.
   */
  export interface IOptions {
    /**
     * The renderer to use for the split panel.
     *
     * The default is a shared renderer instance.
     */
    renderer?: IRenderer;

    /**
     * The layout orientation of the panel.
     *
     * The default is `'horizontal'`.
     */
    orientation?: Orientation;

    /**
     * The content alignment of the panel.
     *
     * The default is `'start'`.
     */
    alignment?: Alignment;

    /**
     * The spacing between items in the panel.
     *
     * The default is `4`.
     */
    spacing?: number;

    /**
     * The split layout to use for the split panel.
     *
     * If this is provided, the other options are ignored.
     *
     * The default is a new `SplitLayout`.
     */
    layout?: SplitLayout;

    /**
     * The number of DOM nodes in a child widget above which the
     * panel will apply CSS containment during handle dragging to
     * prevent expensive child relayout.
     *
     * Additionally, if a layout update takes longer than 16ms,
     * containment is applied reactively for all children regardless
     * of this threshold.
     *
     * The default is `5000`.
     */
    nodeCountThreshold?: number;
  }

  /**
   * The default implementation of `IRenderer`.
   */
  export class Renderer implements IRenderer {
    /**
     * Create a new handle for use with a split panel.
     *
     * @returns A new handle element for a split panel.
     */
    createHandle(): HTMLDivElement {
      let handle = document.createElement('div');
      handle.className = 'lm-SplitPanel-handle';
      return handle;
    }
  }

  /**
   * The default `Renderer` instance.
   */
  export const defaultRenderer = new Renderer();

  /**
   * Get the split panel stretch factor for the given widget.
   *
   * @param widget - The widget of interest.
   *
   * @returns The split panel stretch factor for the widget.
   */
  export function getStretch(widget: Widget): number {
    return SplitLayout.getStretch(widget);
  }

  /**
   * Set the split panel stretch factor for the given widget.
   *
   * @param widget - The widget of interest.
   *
   * @param value - The value for the stretch factor.
   */
  export function setStretch(widget: Widget, value: number): void {
    SplitLayout.setStretch(widget, value);
  }

}

/**
 * The namespace for the module implementation details.
 */
namespace Private {
  /**
   * An object which holds mouse press data.
   */
  export interface IPressData {
    /**
     * The index of the pressed handle.
     */
    index: number;

    /**
     * The offset of the press in handle coordinates.
     */
    delta: number;

    /**
     * The disposable which will clear the override cursor.
     */
    override: IDisposable;
  }

  /**
   * An object which holds the original styles for a frozen element.
   */
  export interface IFrozenElement {
    /**
     * The frozen DOM element.
     */
    element: HTMLElement;

    /**
     * Whether this entry is a frozen group head.
     */
    isHead: boolean;

    /**
     * The original `contain` style value.
     */
    prevContain: string;

    /**
     * The original `width` style value.
     */
    prevWidth: string;

    /**
     * The original `minWidth` style value.
     */
    prevMinWidth: string;

    /**
     * The original `maxWidth` style value.
     */
    prevMaxWidth: string;

    /**
     * The original `height` style value.
     */
    prevHeight: string;

    /**
     * The original `minHeight` style value.
     */
    prevMinHeight: string;

    /**
     * The original `maxHeight` style value.
     */
    prevMaxHeight: string;

    /**
     * The original `contentVisibility` style value.
     */
    prevContentVisibility: string;

    /**
     * The original `containIntrinsicWidth` style value.
     */
    prevContainIntrinsicWidth: string;

    /**
     * The original `containIntrinsicHeight` style value.
     */
    prevContainIntrinsicHeight: string;
  }

  /**
   * The default node count threshold for content isolation.
   */
  export const DEFAULT_NODE_COUNT_THRESHOLD = 5000;

  /**
   * The delay (in ms) after the last pointer move before refreshing
   * frozen element sizes.
   */
  export const REFRESH_DEBOUNCE_MS = 300;

  /**
   * The periodic interval (in ms) for refreshing frozen element
   * sizes during long continuous drags.
   */
  export const REFRESH_INTERVAL_MS = 3000;

  /**
   * The minimum total text length in a widget's subtree to
   * consider it heavy, independent of node count.
   */
  export const DEFAULT_TEXT_LENGTH_THRESHOLD = 25000;

  /**
   * Determine whether a DOM subtree is heavy enough to warrant
   * containment. A subtree is heavy if it has many nodes or a
   * large amount of text content.
   */
  export function isDOMHeavy(
    el: HTMLElement,
    nodeCountThreshold: number,
    textLengthThreshold: number = DEFAULT_TEXT_LENGTH_THRESHOLD
  ): boolean {
    if (el.querySelectorAll('*').length >= nodeCountThreshold) {
      return true;
    }
    if ((el.textContent?.length ?? 0) >= textLengthThreshold) {
      return true;
    }
    return false;
  }

  /**
   * Recursively find the deepest widgets whose subtree is heavy
   * but whose child widgets are all individually light. This
   * places containment as low in the DOM tree as possible.
   */
  export function collectHeavyWidgets(
    widget: Widget,
    threshold: number,
    result: Widget[]
  ): void {
    if (!isDOMHeavy(widget.node, threshold)) {
      return;
    }
    let layout = widget.layout;
    if (!layout) {
      // Leaf widget that is heavy — freeze it.
      result.push(widget);
      return;
    }
    // Check if any child widget is individually heavy.
    let anyChildHeavy = false;
    for (let child of layout) {
      if (isDOMHeavy(child.node, threshold)) {
        anyChildHeavy = true;
        break;
      }
    }
    if (anyChildHeavy) {
      // Recurse into children — we can push containment deeper.
      for (let child of layout) {
        collectHeavyWidgets(child, threshold, result);
      }
    } else {
      // No child is individually heavy, but this widget is.
      // This is the deepest heavy boundary — freeze here.
      result.push(widget);
    }
  }

  /**
   * Create a split layout for the given panel options.
   */
  export function createLayout(options: SplitPanel.IOptions): SplitLayout {
    return (
      options.layout ||
      new SplitLayout({
        renderer: options.renderer || SplitPanel.defaultRenderer,
        orientation: options.orientation,
        alignment: options.alignment,
        spacing: options.spacing
      })
    );
  }
}
