// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
import { MimeData } from '@lumino/coreutils';

import { DisposableDelegate, IDisposable } from '@lumino/disposable';

/**
 * A type alias which defines the possible independent drop actions.
 *
 * @deprecated This type will be renamed Drag.DropAction in @lumino/dragdrop@^2.0.0
 */
export type DropAction = 'none' | 'copy' | 'link' | 'move';

/**
 * A type alias which defines the possible supported drop actions.
 *
 * @deprecated This type will be renamed Drag.SupportedActions in @lumino/dragdrop@^2.0.0
 */
export type SupportedActions =
  | DropAction
  | 'copy-link'
  | 'copy-move'
  | 'link-move'
  | 'all';

/**
 * A custom event type used for drag-drop operations.
 *
 * #### Notes
 * In order to receive `'lm-dragover'`, `'lm-dragleave'`, or `'lm-drop'`
 * events, a drop target must cancel the `'lm-dragenter'` event by
 * calling the event's `preventDefault()` method.
 *
 * This interface will be deprecated in @lumino/dragdrop@^2.0.0 in favor of
 * `Drag.Event`.
 */
export interface IDragEvent extends MouseEvent {
  /**
   * The drop action supported or taken by the drop target.
   *
   * #### Notes
   * At the start of each event, this value will be `'none'`. During a
   * `'lm-dragover'` event, the drop target must set this value to one
   * of the supported actions, or the drop event will not occur.
   *
   * When handling the drop event, the drop target should set this
   * to the action which was *actually* taken. This value will be
   * reported back to the drag initiator.
   */
  dropAction: DropAction;

  /**
   * The drop action proposed by the drag initiator.
   *
   * #### Notes
   * This is the action which is *preferred* by the drag initiator. The
   * drop target is not required to perform this action, but should if
   * it all possible.
   */
  readonly proposedAction: DropAction;

  /**
   * The drop actions supported by the drag initiator.
   *
   * #### Notes
   * If the `dropAction` is not set to one of the supported actions
   * during the `'lm-dragover'` event, the drop event will not occur.
   */
  readonly supportedActions: SupportedActions;

  /**
   * The mime data associated with the event.
   *
   * #### Notes
   * This is mime data provided by the drag initiator. Drop targets
   * should use this data to determine if they can handle the drop.
   */
  readonly mimeData: MimeData;

  /**
   * The source object of the drag, as provided by the drag initiator.
   *
   * #### Notes
   * For advanced applications, the drag initiator may wish to expose
   * a source object to the drop targets. That will be provided here
   * if given by the drag initiator, otherwise it will be `null`.
   */
  readonly source: any;
}

/**
 * An object which manages a drag-drop operation.
 *
 * A drag object dispatches four different events to drop targets:
 *
 * - `'lm-dragenter'` - Dispatched when the mouse enters the target
 *   element. This event must be canceled in order to receive any
 *   of the other events.
 *
 * - `'lm-dragover'` - Dispatched when the mouse moves over the drop
 *   target. It must cancel the event and set the `dropAction` to one
 *   of the supported actions in order to receive drop events.
 *
 * - `'lm-dragleave'` - Dispatched when the mouse leaves the target
 *   element. This includes moving the mouse into child elements.
 *
 * - `'lm-drop'`- Dispatched when the mouse is released over the target
 *   element when the target indicates an appropriate drop action. If
 *   the event is canceled, the indicated drop action is returned to
 *   the initiator through the resolved promise.
 *
 * A drag operation can be terminated at any time by pressing `Escape`
 * or by disposing the drag object.
 *
 * A drag object has the ability to automatically scroll a scrollable
 * element when the mouse is hovered near one of its edges. To enable
 * this, add the `data-lm-dragscroll` attribute to any element which
 * the drag object should consider for scrolling.
 *
 * #### Notes
 * This class is designed to be used when dragging and dropping custom
 * data *within* a single application. It is *not* a replacement for
 * the native drag-drop API. Instead, it provides an API which allows
 * drag operations to be initiated programmatically and enables the
 * transfer of arbitrary non-string objects; features which are not
 * possible with the native drag-drop API.
 */
export class Drag implements IDisposable {
  /**
   * Construct a new drag object.
   *
   * @param options - The options for initializing the drag.
   */
  constructor(options: Drag.IOptions) {
    this.document = options.document || document;
    this.mimeData = options.mimeData;
    this.dragImage = options.dragImage || null;
    this.proposedAction = options.proposedAction || 'copy';
    this.supportedActions = options.supportedActions || 'all';
    this.source = options.source || null;
  }

  /**
   * Dispose of the resources held by the drag object.
   *
   * #### Notes
   * This will cancel the drag operation if it is active.
   */
  dispose(): void {
    // Do nothing if the drag object is already disposed.
    if (this._disposed) {
      return;
    }
    this._disposed = true;

    // If there is a current target, dispatch a drag leave event.
    if (this._currentTarget) {
      let event = Private.createMouseEvent('pointerup', -1, -1);
      Private.dispatchDragLeave(this, this._currentTarget, null, event);
    }

    // Finalize the drag object with `'none'`.
    this._finalize('none');
  }

  /**
   * The mime data for the drag object.
   */
  readonly mimeData: MimeData;

  /**
   * The target document for dragging events.
   */
  readonly document: Document | ShadowRoot;

  /**
   * The drag image element for the drag object.
   */
  readonly dragImage: HTMLElement | null;

  /**
   * The proposed drop action for the drag object.
   */
  readonly proposedAction: DropAction;

  /**
   * The supported drop actions for the drag object.
   */
  readonly supportedActions: SupportedActions;

  /**
   * Get the drag source for the drag object.
   */
  readonly source: any;

  /**
   * Test whether the drag object is disposed.
   */
  get isDisposed(): boolean {
    return this._disposed;
  }

  /**
   * Start the drag operation at the specified client position.
   *
   * @param clientX - The client X position for the drag start.
   *
   * @param clientY - The client Y position for the drag start.
   *
   * @returns A promise which resolves to the result of the drag.
   *
   * #### Notes
   * If the drag has already been started, the promise created by the
   * first call to `start` is returned.
   *
   * If the drag operation has ended, or if the drag object has been
   * disposed, the returned promise will resolve to `'none'`.
   *
   * The drag object will be automatically disposed when drag operation
   * completes. This means `Drag` objects are for single-use only.
   *
   * This method assumes the left mouse button is already held down.
   */
  start(clientX: number, clientY: number): Promise<DropAction> {
    // If the drag object is already disposed, resolve to `None`.
    if (this._disposed) {
      return Promise.resolve('none' as DropAction);
    }

    // If the drag has already been started, return the promise.
    if (this._promise) {
      return this._promise;
    }

    // Install the document listeners for the drag object.
    this._addListeners();

    // Attach the drag image at the specified client position.
    this._attachDragImage(clientX, clientY);

    // Create the promise which will be resolved on completion.
    this._promise = new Promise<DropAction>((resolve, reject) => {
      this._resolve = resolve;
    });

    // Trigger a fake move event to kick off the drag operation.
    let event = Private.createMouseEvent('pointermove', clientX, clientY);
    document.dispatchEvent(event);

    // Return the pending promise for the drag operation.
    return this._promise;
  }

  /**
   * Handle the DOM events for the drag operation.
   *
   * @param event - The DOM event sent to the drag object.
   *
   * #### Notes
   * This method implements the DOM `EventListener` interface and is
   * called in response to events on the document. It should not be
   * called directly by user code.
   */
  handleEvent(event: Event): void {
    switch (event.type) {
      case 'mousemove': // <DEPRECATED>
        this._evtMouseMove(event as MouseEvent);
        break;
      case 'mouseup': // <DEPRECATED>
        this._evtMouseUp(event as MouseEvent);
        break;
      case 'pointermove':
        this._evtMouseMove(event as MouseEvent);
        break;
      case 'pointerup':
        this._evtMouseUp(event as MouseEvent);
        break;
      case 'keydown':
        this._evtKeyDown(event as KeyboardEvent);
        break;
      default:
        // Stop all other events during drag-drop.
        event.preventDefault();
        event.stopPropagation();
        break;
    }
  }

  /**
   * Move the drag image element to the specified location.
   *
   * This is a no-op if there is no drag image element.
   */
  protected moveDragImage(clientX: number, clientY: number): void {
    if (!this.dragImage) {
      return;
    }
    let style = this.dragImage.style;
    style.top = `${clientY}px`;
    style.left = `${clientX}px`;
  }

  /**
   * Handle the `'mousemove'` event for the drag object.
   */
  private _evtMouseMove(event: MouseEvent): void {
    // Stop all input events during drag-drop.
    event.preventDefault();
    event.stopPropagation();

    // Update the current target node and dispatch enter/leave events.
    this._updateCurrentTarget(event);

    // Update the drag scroll element.
    this._updateDragScroll(event);

    // Move the drag image to the specified client position. This is
    // performed *after* dispatching to prevent unnecessary reflows.
    this.moveDragImage(event.clientX, event.clientY);
  }

  /**
   * Handle the `'mouseup'` event for the drag object.
   */
  private _evtMouseUp(event: MouseEvent): void {
    // Stop all input events during drag-drop.
    event.preventDefault();
    event.stopPropagation();

    // Do nothing if the left button is not released.
    if (event.button !== 0) {
      return;
    }

    // Update the current target node and dispatch enter/leave events.
    // This prevents a subtle issue where the DOM mutates under the
    // cursor after the last move event but before the drop event.
    this._updateCurrentTarget(event);

    // If there is no current target, finalize with `'none'`.
    if (!this._currentTarget) {
      this._finalize('none');
      return;
    }

    // If the last drop action was `'none'`, dispatch a leave event
    // to the current target and finalize the drag with `'none'`.
    if (this._dropAction === 'none') {
      Private.dispatchDragLeave(this, this._currentTarget, null, event);
      this._finalize('none');
      return;
    }

    // Dispatch the drop event at the current target and finalize
    // with the resulting drop action.
    let action = Private.dispatchDrop(this, this._currentTarget, event);
    this._finalize(action);
  }

  /**
   * Handle the `'keydown'` event for the drag object.
   */
  private _evtKeyDown(event: KeyboardEvent): void {
    // Stop all input events during drag-drop.
    event.preventDefault();
    event.stopPropagation();

    // Cancel the drag if `Escape` is pressed.
    if (event.keyCode === 27) {
      this.dispose();
    }
  }

  /**
   * Add the document event listeners for the drag object.
   */
  private _addListeners(): void {
    document.addEventListener('mousedown', this, true); // <DEPRECATED>
    document.addEventListener('mousemove', this, true); // <DEPRECATED>
    document.addEventListener('mouseup', this, true); // <DEPRECATED>
    document.addEventListener('mouseenter', this, true); // <DEPRECATED>
    document.addEventListener('mouseleave', this, true); // <DEPRECATED>
    document.addEventListener('mouseover', this, true); // <DEPRECATED>
    document.addEventListener('mouseout', this, true); // <DEPRECATED>
    document.addEventListener('pointerdown', this, true);
    document.addEventListener('pointermove', this, true);
    document.addEventListener('pointerup', this, true);
    document.addEventListener('pointerenter', this, true);
    document.addEventListener('pointerleave', this, true);
    document.addEventListener('pointerover', this, true);
    document.addEventListener('pointerout', this, true);
    document.addEventListener('keydown', this, true);
    document.addEventListener('keyup', this, true);
    document.addEventListener('keypress', this, true);
    document.addEventListener('contextmenu', this, true);
  }

  /**
   * Remove the document event listeners for the drag object.
   */
  private _removeListeners(): void {
    document.removeEventListener('mousedown', this, true); // <DEPRECATED>
    document.removeEventListener('mousemove', this, true); // <DEPRECATED>
    document.removeEventListener('mouseup', this, true); // <DEPRECATED>
    document.removeEventListener('mouseenter', this, true); // <DEPRECATED>
    document.removeEventListener('mouseleave', this, true); // <DEPRECATED>
    document.removeEventListener('mouseover', this, true); // <DEPRECATED>
    document.removeEventListener('mouseout', this, true); // <DEPRECATED>
    document.removeEventListener('pointerdown', this, true);
    document.removeEventListener('pointermove', this, true);
    document.removeEventListener('pointerup', this, true);
    document.removeEventListener('pointerenter', this, true);
    document.removeEventListener('pointerleave', this, true);
    document.removeEventListener('pointerover', this, true);
    document.removeEventListener('pointerout', this, true);
    document.removeEventListener('keydown', this, true);
    document.removeEventListener('keyup', this, true);
    document.removeEventListener('keypress', this, true);
    document.removeEventListener('contextmenu', this, true);
  }

  /**
   * Update the drag scroll element under the mouse.
   */
  private _updateDragScroll(event: MouseEvent): void {
    // Find the scroll target under the mouse.
    let target = Private.findScrollTarget(event);

    // Bail if there is nothing to scroll.
    if (!this._scrollTarget && !target) {
      return;
    }

    // Start the scroll loop if needed.
    if (!this._scrollTarget) {
      setTimeout(this._onScrollFrame, 500);
    }

    // Update the scroll target.
    this._scrollTarget = target;
  }

  /**
   * Update the current target node using the given mouse event.
   */
  private _updateCurrentTarget(event: MouseEvent): void {
    // Fetch common local state.
    let prevTarget = this._currentTarget;
    let currTarget = this._currentTarget;
    let prevElem = this._currentElement;

    // Find the current indicated element at the given position.
    let currElem = this.document.elementFromPoint(event.clientX, event.clientY);

    // Update the current element reference.
    this._currentElement = currElem;

    // If the indicated element changes from the previous iteration,
    // and is different from the current target, dispatch the exit
    // event to the target.
    if (currElem !== prevElem && currElem !== currTarget) {
      Private.dispatchDragExit(this, currTarget, currElem, event);
    }

    // If the indicated element changes from the previous iteration,
    // and is different from the current target, dispatch the enter
    // event and compute the new target element.
    if (currElem !== prevElem && currElem !== currTarget) {
      currTarget = Private.dispatchDragEnter(this, currElem, currTarget, event);
    }

    // If the current target element has changed, update the current
    // target reference and dispatch the leave event to the old target.
    if (currTarget !== prevTarget) {
      this._currentTarget = currTarget;
      Private.dispatchDragLeave(this, prevTarget, currTarget, event);
    }

    // Dispatch the drag over event and update the drop action.
    let action = Private.dispatchDragOver(this, currTarget, event);
    this._setDropAction(action);
  }

  /**
   * Attach the drag image element at the specified location.
   *
   * This is a no-op if there is no drag image element.
   */
  private _attachDragImage(clientX: number, clientY: number): void {
    if (!this.dragImage) {
      return;
    }
    this.dragImage.classList.add('lm-mod-drag-image');
    /* <DEPRECATED> */
    this.dragImage.classList.add('p-mod-drag-image');
    /* </DEPRECATED> */
    let style = this.dragImage.style;
    style.pointerEvents = 'none';
    style.position = 'fixed';
    style.top = `${clientY}px`;
    style.left = `${clientX}px`;
    const body =
      this.document instanceof Document
        ? this.document.body
        : (this.document.firstElementChild as HTMLElement);
    body.appendChild(this.dragImage);
  }

  /**
   * Detach the drag image element from the DOM.
   *
   * This is a no-op if there is no drag image element.
   */
  private _detachDragImage(): void {
    if (!this.dragImage) {
      return;
    }
    let parent = this.dragImage.parentNode;
    if (!parent) {
      return;
    }
    parent.removeChild(this.dragImage);
  }

  /**
   * Set the internal drop action state and update the drag cursor.
   */
  private _setDropAction(action: DropAction): void {
    action = Private.validateAction(action, this.supportedActions);
    if (this._override && this._dropAction === action) {
      return;
    }
    switch (action) {
      case 'none':
        this._dropAction = action;
        this._override = Drag.overrideCursor('no-drop', this.document);
        break;
      case 'copy':
        this._dropAction = action;
        this._override = Drag.overrideCursor('copy', this.document);
        break;
      case 'link':
        this._dropAction = action;
        this._override = Drag.overrideCursor('alias', this.document);
        break;
      case 'move':
        this._dropAction = action;
        this._override = Drag.overrideCursor('move', this.document);
        break;
    }
  }

  /**
   * Finalize the drag operation and resolve the drag promise.
   */
  private _finalize(action: DropAction): void {
    // Store the resolve function as a temp variable.
    let resolve = this._resolve;

    // Remove the document event listeners.
    this._removeListeners();

    // Detach the drag image.
    this._detachDragImage();

    // Dispose of the cursor override.
    if (this._override) {
      this._override.dispose();
      this._override = null;
    }

    // Clear the mime data.
    this.mimeData.clear();

    // Clear the rest of the internal drag state.
    this._disposed = true;
    this._dropAction = 'none';
    this._currentTarget = null;
    this._currentElement = null;
    this._scrollTarget = null;
    this._promise = null;
    this._resolve = null;

    // Finally, resolve the promise to the given drop action.
    if (resolve) {
      resolve(action);
    }
  }

  /**
   * The scroll loop handler function.
   */
  private _onScrollFrame = () => {
    // Bail early if there is no scroll target.
    if (!this._scrollTarget) {
      return;
    }

    // Unpack the scroll target.
    let { element, edge, distance } = this._scrollTarget;

    // Calculate the scroll delta using nonlinear acceleration.
    let d = Private.SCROLL_EDGE_SIZE - distance;
    let f = Math.pow(d / Private.SCROLL_EDGE_SIZE, 2);
    let s = Math.max(1, Math.round(f * Private.SCROLL_EDGE_SIZE));

    // Scroll the element in the specified direction.
    switch (edge) {
      case 'top':
        element.scrollTop -= s;
        break;
      case 'left':
        element.scrollLeft -= s;
        break;
      case 'right':
        element.scrollLeft += s;
        break;
      case 'bottom':
        element.scrollTop += s;
        break;
    }

    // Request the next cycle of the scroll loop.
    requestAnimationFrame(this._onScrollFrame);
  };

  private _disposed = false;
  private _dropAction: DropAction = 'none';
  private _override: IDisposable | null = null;
  private _currentTarget: Element | null = null;
  private _currentElement: Element | null = null;
  private _promise: Promise<DropAction> | null = null;
  private _scrollTarget: Private.IScrollTarget | null = null;
  private _resolve: ((value: DropAction) => void) | null = null;
}

/**
 * The namespace for the `Drag` class statics.
 */
export namespace Drag {
  /**
   * An options object for initializing a `Drag` object.
   */
  export interface IOptions {
    /**
     * The root element for dragging DOM artifacts (defaults to document).
     */
    document?: Document | ShadowRoot;

    /**
     * The populated mime data for the drag operation.
     */
    mimeData: MimeData;

    /**
     * An optional drag image which follows the mouse cursor.
     *
     * #### Notes
     * The drag image can be any DOM element. It is not limited to
     * image or canvas elements as with the native drag-drop APIs.
     *
     * If provided, this will be positioned at the mouse cursor on each
     * mouse move event. A CSS transform can be used to offset the node
     * from its specified position.
     *
     * The drag image will automatically have the `lm-mod-drag-image`
     * class name added.
     *
     * The default value is `null`.
     */
    dragImage?: HTMLElement;

    /**
     * The optional proposed drop action for the drag operation.
     *
     * #### Notes
     * This can be provided as a hint to the drop targets as to which
     * drop action is preferred.
     *
     * The default value is `'copy'`.
     */
    proposedAction?: DropAction;

    /**
     * The drop actions supported by the drag initiator.
     *
     * #### Notes
     * A drop target must indicate that it intends to perform one of the
     * supported actions in order to receive a drop event. However, it is
     * not required to *actually* perform that action when handling the
     * drop event. Therefore, the initiator must be prepared to handle
     * any drop action performed by a drop target.
     *
     * The default value is `'all'`.
     */
    supportedActions?: SupportedActions;

    /**
     * An optional object which indicates the source of the drag.
     *
     * #### Notes
     * For advanced applications, the drag initiator may wish to expose
     * a source object to the drop targets. That object can be specified
     * here and will be carried along with the drag events.
     *
     * The default value is `null`.
     */
    source?: any;
  }

  /**
   * Override the cursor icon for the entire document.
   *
   * @param cursor - The string representing the cursor style.
   *
   * @returns A disposable which will clear the override when disposed.
   *
   * #### Notes
   * The most recent call to `overrideCursor` takes precedence.
   * Disposing an old override has no effect on the current override.
   *
   * This utility function is used by the `Drag` class to override the
   * mouse cursor during a drag-drop operation, but it can also be used
   * by other classes to fix the cursor icon during normal mouse drags.
   *
   * #### Example
   * ```typescript
   * import { Drag } from '@lumino/dragdrop';
   *
   * // Force the cursor to be 'wait' for the entire document.
   * let override = Drag.overrideCursor('wait');
   *
   * // Clear the override by disposing the return value.
   * override.dispose();
   * ```
   */
  export function overrideCursor(
    cursor: string,
    doc: Document | ShadowRoot = document
  ): IDisposable {
    let id = ++overrideCursorID;
    const body =
      doc instanceof Document
        ? doc.body
        : (doc.firstElementChild as HTMLElement);
    body.style.cursor = cursor;
    body.classList.add('lm-mod-override-cursor');
    /* <DEPRECATED> */
    body.classList.add('p-mod-override-cursor');
    /* </DEPRECATED> */
    return new DisposableDelegate(() => {
      if (id === overrideCursorID) {
        body.style.cursor = '';
        body.classList.remove('lm-mod-override-cursor');
        /* <DEPRECATED> */
        body.classList.remove('p-mod-override-cursor');
        /* </DEPRECATED> */
      }
    });
  }

  /**
   * The internal id for the active cursor override.
   */
  let overrideCursorID = 0;
}

/**
 * The namespace for the module implementation details.
 */
namespace Private {
  /**
   * The size of a drag scroll edge, in pixels.
   */
  export const SCROLL_EDGE_SIZE = 20;

  /**
   * Validate the given action is one of the supported actions.
   *
   * Returns the given action or `'none'` if the action is unsupported.
   */
  export function validateAction(
    action: DropAction,
    supported: SupportedActions
  ): DropAction {
    return actionTable[action] & supportedTable[supported] ? action : 'none';
  }

  /**
   * Create a left mouse event at the given position.
   *
   * @param type - The event type for the mouse event.
   *
   * @param clientX - The client X position.
   *
   * @param clientY - The client Y position.
   *
   * @returns A newly created and initialized mouse event.
   */
  export function createMouseEvent(
    type: string,
    clientX: number,
    clientY: number
  ): MouseEvent {
    let event = document.createEvent('MouseEvent');
    event.initMouseEvent(
      type,
      true,
      true,
      window,
      0,
      0,
      0,
      clientX,
      clientY,
      false,
      false,
      false,
      false,
      0,
      null
    );
    return event;
  }

  /**
   * An object which holds the scroll target data.
   */
  export interface IScrollTarget {
    /**
     * The element to be scrolled.
     */
    element: Element;

    /**
     * The scroll edge underneath the mouse.
     */
    edge: 'top' | 'left' | 'right' | 'bottom';

    /**
     * The distance from the mouse to the scroll edge.
     */
    distance: number;
  }

  /**
   * Find the drag scroll target under the mouse, if any.
   */
  export function findScrollTarget(event: MouseEvent): IScrollTarget | null {
    // Look up the client mouse position.
    let x = event.clientX;
    let y = event.clientY;

    // Get the element under the mouse.
    let element: Element | null = document.elementFromPoint(x, y);

    // Search for a scrollable target based on the mouse position.
    // The null assert in third clause of for-loop is required due to:
    // https://github.com/Microsoft/TypeScript/issues/14143
    for (; element; element = element!.parentElement) {
      // Ignore elements which are not marked as scrollable.
      let scrollable = element.hasAttribute('data-lm-dragscroll');
      /* <DEPRECATED> */
      scrollable = scrollable || element.hasAttribute('data-p-dragscroll');
      /* </DEPRECATED> */
      if (!scrollable) {
        continue;
      }

      // Set up the coordinate offsets for the element.
      let offsetX = 0;
      let offsetY = 0;
      if (element === document.body) {
        offsetX = window.pageXOffset;
        offsetY = window.pageYOffset;
      }

      // Get the element bounds in viewport coordinates.
      let r = element.getBoundingClientRect();
      let top = r.top + offsetY;
      let left = r.left + offsetX;
      let right = left + r.width;
      let bottom = top + r.height;

      // Skip the element if it's not under the mouse.
      if (x < left || x >= right || y < top || y >= bottom) {
        continue;
      }

      // Compute the distance to each edge.
      let dl = x - left + 1;
      let dt = y - top + 1;
      let dr = right - x;
      let db = bottom - y;

      // Find the smallest of the edge distances.
      let distance = Math.min(dl, dt, dr, db);

      // Skip the element if the mouse is not within a scroll edge.
      if (distance > SCROLL_EDGE_SIZE) {
        continue;
      }

      // Set up the edge result variable.
      let edge: 'top' | 'left' | 'right' | 'bottom';

      // Find the edge for the computed distance.
      switch (distance) {
        case db:
          edge = 'bottom';
          break;
        case dt:
          edge = 'top';
          break;
        case dr:
          edge = 'right';
          break;
        case dl:
          edge = 'left';
          break;
        default:
          throw 'unreachable';
      }

      // Compute how much the element can scroll in width and height.
      let dsw = element.scrollWidth - element.clientWidth;
      let dsh = element.scrollHeight - element.clientHeight;

      // Determine if the element should be scrolled for the edge.
      let shouldScroll: boolean;
      switch (edge) {
        case 'top':
          shouldScroll = dsh > 0 && element.scrollTop > 0;
          break;
        case 'left':
          shouldScroll = dsw > 0 && element.scrollLeft > 0;
          break;
        case 'right':
          shouldScroll = dsw > 0 && element.scrollLeft < dsw;
          break;
        case 'bottom':
          shouldScroll = dsh > 0 && element.scrollTop < dsh;
          break;
        default:
          throw 'unreachable';
      }

      // Skip the element if it should not be scrolled.
      if (!shouldScroll) {
        continue;
      }

      // Return the drag scroll target.
      return { element, edge, distance };
    }

    // No drag scroll target was found.
    return null;
  }

  /**
   * Dispatch a drag enter event to the indicated element.
   *
   * @param drag - The drag object associated with the action.
   *
   * @param currElem - The currently indicated element, or `null`. This
   *   is the "immediate user selection" from the whatwg spec.
   *
   * @param currTarget - The current drag target element, or `null`. This
   *   is the "current target element" from the whatwg spec.
   *
   * @param event - The mouse event related to the action.
   *
   * @returns The element to use as the current drag target. This is the
   *   "current target element" from the whatwg spec, and may be `null`.
   *
   * #### Notes
   * This largely implements the drag enter portion of the whatwg spec:
   * https://html.spec.whatwg.org/multipage/interaction.html#drag-and-drop-processing-model
   */
  export function dispatchDragEnter(
    drag: Drag,
    currElem: Element | null,
    currTarget: Element | null,
    event: MouseEvent
  ): Element | null {
    // If the current element is null, return null as the new target.
    if (!currElem) {
      return null;
    }

    // Dispatch a drag enter event to the current element.
    let dragEvent = createDragEvent('lm-dragenter', drag, event, currTarget);
    let canceled = !currElem.dispatchEvent(dragEvent);

    // If the event was canceled, use the current element as the new target.
    if (canceled) {
      return currElem;
    }

    /* <DEPRECATED> */
    dragEvent = createDragEvent('p-dragenter', drag, event, currTarget);
    canceled = !currElem.dispatchEvent(dragEvent);
    if (canceled) {
      return currElem;
    }
    /* </DEPRECATED> */

    // If the current element is the document body, keep the original target.
    const body =
      drag.document instanceof Document
        ? drag.document.body
        : (drag.document.firstElementChild as HTMLElement);

    if (currElem === body) {
      return currTarget;
    }

    // Dispatch a drag enter event on the document body.
    dragEvent = createDragEvent('lm-dragenter', drag, event, currTarget);
    body.dispatchEvent(dragEvent);

    /* <DEPRECATED> */
    dragEvent = createDragEvent('p-dragenter', drag, event, currTarget);
    body.dispatchEvent(dragEvent);
    /* </DEPRECATED> */

    // Ignore the event cancellation, and use the body as the new target.
    return body;
  }

  /**
   * Dispatch a drag exit event to the indicated element.
   *
   * @param drag - The drag object associated with the action.
   *
   * @param prevTarget - The previous target element, or `null`. This
   *   is the previous "current target element" from the whatwg spec.
   *
   * @param currTarget - The current drag target element, or `null`. This
   *   is the "current target element" from the whatwg spec.
   *
   * @param event - The mouse event related to the action.
   *
   * #### Notes
   * This largely implements the drag exit portion of the whatwg spec:
   * https://html.spec.whatwg.org/multipage/interaction.html#drag-and-drop-processing-model
   */
  export function dispatchDragExit(
    drag: Drag,
    prevTarget: Element | null,
    currTarget: Element | null,
    event: MouseEvent
  ): void {
    // If the previous target is null, do nothing.
    if (!prevTarget) {
      return;
    }

    // Dispatch the drag exit event to the previous target.
    let dragEvent = createDragEvent('lm-dragexit', drag, event, currTarget);
    prevTarget.dispatchEvent(dragEvent);

    /* <DEPRECATED> */
    dragEvent = createDragEvent('p-dragexit', drag, event, currTarget);
    prevTarget.dispatchEvent(dragEvent);
    /* </DEPRECATED> */
  }

  /**
   * Dispatch a drag leave event to the indicated element.
   *
   * @param drag - The drag object associated with the action.
   *
   * @param prevTarget - The previous target element, or `null`. This
   *   is the previous "current target element" from the whatwg spec.
   *
   * @param currTarget - The current drag target element, or `null`. This
   *   is the "current target element" from the whatwg spec.
   *
   * @param event - The mouse event related to the action.
   *
   * #### Notes
   * This largely implements the drag leave portion of the whatwg spec:
   * https://html.spec.whatwg.org/multipage/interaction.html#drag-and-drop-processing-model
   */
  export function dispatchDragLeave(
    drag: Drag,
    prevTarget: Element | null,
    currTarget: Element | null,
    event: MouseEvent
  ): void {
    // If the previous target is null, do nothing.
    if (!prevTarget) {
      return;
    }

    // Dispatch the drag leave event to the previous target.
    let dragEvent = createDragEvent('lm-dragleave', drag, event, currTarget);
    prevTarget.dispatchEvent(dragEvent);

    /* <DEPRECATED> */
    dragEvent = createDragEvent('p-dragleave', drag, event, currTarget);
    prevTarget.dispatchEvent(dragEvent);
    /* </DEPRECATED> */
  }

  /**
   * Dispatch a drag over event to the indicated element.
   *
   * @param drag - The drag object associated with the action.
   *
   * @param currTarget - The current drag target element, or `null`. This
   *   is the "current target element" from the whatwg spec.
   *
   * @param event - The mouse event related to the action.
   *
   * @returns The `DropAction` result of the drag over event.
   *
   * #### Notes
   * This largely implements the drag over portion of the whatwg spec:
   * https://html.spec.whatwg.org/multipage/interaction.html#drag-and-drop-processing-model
   */
  export function dispatchDragOver(
    drag: Drag,
    currTarget: Element | null,
    event: MouseEvent
  ): DropAction {
    // If there is no current target, the drop action is none.
    if (!currTarget) {
      return 'none';
    }

    // Dispatch the drag over event to the current target.
    let dragEvent = createDragEvent('lm-dragover', drag, event, null);
    let canceled = !currTarget.dispatchEvent(dragEvent);

    // If the event was canceled, return the drop action result.
    if (canceled) {
      return dragEvent.dropAction;
    }

    /* <DEPRECATED> */
    dragEvent = createDragEvent('p-dragover', drag, event, null);
    canceled = !currTarget.dispatchEvent(dragEvent);
    if (canceled) {
      return dragEvent.dropAction;
    }
    /* </DEPRECATED> */

    // Otherwise, the effective drop action is none.
    return 'none';
  }

  /**
   * Dispatch a drop event to the indicated element.
   *
   * @param drag - The drag object associated with the action.
   *
   * @param currTarget - The current drag target element, or `null`. This
   *   is the "current target element" from the whatwg spec.
   *
   * @param event - The mouse event related to the action.
   *
   * @returns The `DropAction` result of the drop event.
   *
   * #### Notes
   * This largely implements the drag over portion of the whatwg spec:
   * https://html.spec.whatwg.org/multipage/interaction.html#drag-and-drop-processing-model
   */
  export function dispatchDrop(
    drag: Drag,
    currTarget: Element | null,
    event: MouseEvent
  ): DropAction {
    // If there is no current target, the drop action is none.
    if (!currTarget) {
      return 'none';
    }

    // Dispatch the drop event to the current target.
    let dragEvent = createDragEvent('lm-drop', drag, event, null);
    let canceled = !currTarget.dispatchEvent(dragEvent);

    // If the event was canceled, return the drop action result.
    if (canceled) {
      return dragEvent.dropAction;
    }

    /* <DEPRECATED> */
    dragEvent = createDragEvent('p-drop', drag, event, null);
    canceled = !currTarget.dispatchEvent(dragEvent);
    if (canceled) {
      return dragEvent.dropAction;
    }
    /* </DEPRECATED> */

    // Otherwise, the effective drop action is none.
    return 'none';
  }

  /**
   * A lookup table from drop action to bit value.
   */
  const actionTable: { [key: string]: number } = {
    none: 0x0,
    copy: 0x1,
    link: 0x2,
    move: 0x4
  };

  /**
   * A lookup table from supported action to drop action bit mask.
   */
  const supportedTable: { [key: string]: number } = {
    none: actionTable['none'],
    copy: actionTable['copy'],
    link: actionTable['link'],
    move: actionTable['move'],
    'copy-link': actionTable['copy'] | actionTable['link'],
    'copy-move': actionTable['copy'] | actionTable['move'],
    'link-move': actionTable['link'] | actionTable['move'],
    all: actionTable['copy'] | actionTable['link'] | actionTable['move']
  };

  /**
   * Create a new initialized `IDragEvent` from the given data.
   *
   * @param type - The event type for the drag event.
   *
   * @param drag - The drag object to use for seeding the drag data.
   *
   * @param event - The mouse event to use for seeding the mouse data.
   *
   * @param related - The related target for the event, or `null`.
   *
   * @returns A new object which implements `IDragEvent`.
   */
  function createDragEvent(
    type: string,
    drag: Drag,
    event: MouseEvent,
    related: Element | null
  ): IDragEvent {
    // Create a new mouse event to use as the drag event. Currently,
    // JS engines do now allow user-defined Event subclasses.
    let dragEvent = document.createEvent('MouseEvent');

    // Initialize the mouse event data.
    dragEvent.initMouseEvent(
      type,
      true,
      true,
      window,
      0,
      event.screenX,
      event.screenY,
      event.clientX,
      event.clientY,
      event.ctrlKey,
      event.altKey,
      event.shiftKey,
      event.metaKey,
      event.button,
      related
    );

    // Forcefully add the custom drag event properties.
    (dragEvent as any).dropAction = 'none';
    (dragEvent as any).mimeData = drag.mimeData;
    (dragEvent as any).proposedAction = drag.proposedAction;
    (dragEvent as any).supportedActions = drag.supportedActions;
    (dragEvent as any).source = drag.source;

    // Return the fully initialized drag event.
    return dragEvent as IDragEvent;
  }
}
