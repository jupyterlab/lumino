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
        if (this._pressData) {
          this._evtPointerMove(event as PointerEvent);
        } else {
          this._evtPointerHoverMove(event as PointerEvent);
        }
        break;
      case 'pointerleave':
        this._clearHoverCursor();
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
    this.node.addEventListener('pointermove', this);
    this.node.addEventListener('pointerleave', this);
  }

  /**
   * A message handler invoked on an `'after-detach'` message.
   */
  protected onAfterDetach(msg: Message): void {
    this.node.removeEventListener('pointerdown', this);
    this.node.removeEventListener('pointermove', this);
    this.node.removeEventListener('pointerleave', this);
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

    // Check whether an adjacent widget is an orthogonal SplitPanel and has
    // a handle that intersects the cursor position in the cross-axis.
    let innerPanel: SplitPanel | undefined;
    let innerIndex: number | undefined;
    let innerDelta: number | undefined;

    const layoutWidgets = this.widgets;
    for (const candidate of [layoutWidgets[index], layoutWidgets[index + 1]]) {
      if (!(candidate instanceof SplitPanel)) {
        continue;
      }
      // The inner panel must have the orthogonal orientation.
      if (candidate.orientation === layout.orientation) {
        continue;
      }
      const innerLayout = candidate.layout as SplitLayout;
      const tol = (innerLayout as any)._spacing ?? 4;
      for (let i = 0; i < innerLayout.handles.length; i++) {
        const h = innerLayout.handles[i];
        if (h.classList.contains('lm-mod-hidden')) {
          continue;
        }
        const hRect = h.getBoundingClientRect();
        if (layout.orientation === 'horizontal') {
          // Outer is horizontal (vertical bars); cross-axis is Y.
          // Expand inner rect by tolerance to bridge the gap at the intersection.
          if (event.clientY >= hRect.top - tol && event.clientY <= hRect.bottom + tol) {
            innerPanel = candidate;
            innerIndex = i;
            innerDelta = Math.max(0, event.clientY - hRect.top);
            break;
          }
        } else {
          // Outer is vertical (horizontal bars); cross-axis is X.
          if (event.clientX >= hRect.left - tol && event.clientX <= hRect.right + tol) {
            innerPanel = candidate;
            innerIndex = i;
            innerDelta = Math.max(0, event.clientX - hRect.left);
            break;
          }
        }
      }
      if (innerPanel) {
        break;
      }
    }

    // Use 'all-scroll' at intersections; otherwise use the handle's cursor.
    if (innerPanel) {
      override.dispose();
      override = Drag.overrideCursor('all-scroll');
    }

    // Clear hover cursor — drag override takes over.
    this._clearHoverCursor();

    this._pressData = { index, delta, override, innerPanel, innerIndex, innerDelta };
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

    // Move the handle as close to the desired position as possible.
    layout.moveHandle(this._pressData!.index, pos);

    // Also move the inner panel's intersecting handle in the cross-axis.
    if (this._pressData!.innerPanel) {
      const innerPanel = this._pressData!.innerPanel!;
      const innerLayout = innerPanel.layout as SplitLayout;
      const innerRect = innerPanel.node.getBoundingClientRect();
      let innerPos: number;
      if (layout.orientation === 'horizontal') {
        // Outer is horizontal; inner is vertical, so move in Y.
        innerPos = event.clientY - innerRect.top - this._pressData!.innerDelta!;
      } else {
        // Outer is vertical; inner is horizontal, so move in X.
        innerPos = event.clientX - innerRect.left - this._pressData!.innerDelta!;
      }
      innerLayout.moveHandle(this._pressData!.innerIndex!, innerPos);
    }
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
   * Update the cursor on a handle when the pointer hovers near an intersection
   * with an orthogonal child SplitPanel's handle.
   */
  private _evtPointerHoverMove(event: PointerEvent): void {
    if (this._pressData) {
      return; // drag in progress
    }
    const layout = this.layout as SplitLayout;
    const target = event.target as HTMLElement;
    const handleIndex = ArrayExt.findFirstIndex(layout.handles, h =>
      h.contains(target)
    );

    if (handleIndex !== -1) {
      const handle = layout.handles[handleIndex];
      const layoutWidgets = this.widgets;
      const tol = (layout as any)._spacing ?? 4;
      let found = false;

      for (const candidate of [
        layoutWidgets[handleIndex],
        layoutWidgets[handleIndex + 1]
      ]) {
        if (!(candidate instanceof SplitPanel)) {
          continue;
        }
        if (candidate.orientation === layout.orientation) {
          continue;
        }
        const innerLayout = candidate.layout as SplitLayout;
        for (let i = 0; i < innerLayout.handles.length; i++) {
          const h = innerLayout.handles[i];
          if (h.classList.contains('lm-mod-hidden')) {
            continue;
          }
          const hRect = h.getBoundingClientRect();
          const inCross =
            layout.orientation === 'horizontal'
              ? event.clientY >= hRect.top - tol &&
                event.clientY <= hRect.bottom + tol
              : event.clientX >= hRect.left - tol &&
                event.clientX <= hRect.right + tol;
          if (inCross) {
            found = true;
            break;
          }
        }
        if (found) {
          break;
        }
      }

      if (found) {
        if (this._hoveredHandle !== handle) {
          this._clearHoverCursor();
          this._hoveredHandle = handle;
          handle.style.cursor = 'all-scroll';
        }
        return;
      }
    }

    this._clearHoverCursor();
  }

  /**
   * Restore the cursor on whichever handle had the intersection hover cursor.
   */
  private _clearHoverCursor(): void {
    if (this._hoveredHandle) {
      this._hoveredHandle.style.cursor = '';
      this._hoveredHandle = null;
    }
  }

  private _handleMoved = new Signal<any, void>(this);
  private _pressData: Private.IPressData | null = null;
  private _hoveredHandle: HTMLDivElement | null = null;
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

    /**
     * The orthogonally-oriented child SplitPanel whose handle intersects
     * the pressed outer handle, if any.
     *
     * When set, this panel's handle is also moved during pointermove,
     * enabling simultaneous two-axis resizing for nested SplitPanels.
     */
    innerPanel?: SplitPanel;

    /**
     * The index of the intersecting handle within the inner panel's layout.
     */
    innerIndex?: number;

    /**
     * The offset of the press within the inner handle's cross-axis coordinate.
     */
    innerDelta?: number;
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
