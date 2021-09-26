// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2019, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/

import { Message } from '@lumino/messaging';

import { Widget } from '@lumino/widgets';

/**
 * A widget which implements a notification popup.
 */
export class Notification extends Widget {
  /**
   * Construct a new notification.
   *
   * @param options - The options for initializing the notification.
   */
  constructor(options: Notification.IOptions) {
    super({ node: Private.createNode() });
    this.addClass('lm-DataGrid-notification');
    this.setFlag(Widget.Flag.DisallowLayout);

    this._target = options.target;
    this._message = options.message || '';
    this._placement = options.placement || 'bottom';

    Widget.attach(this, document.body);

    if (options.timeout && options.timeout > 0) {
      setTimeout(() => {
        this.close();
      }, options.timeout);
    }
  }

  /**
   * Handle the DOM events for the notification.
   *
   * @param event - The DOM event sent to the notification.
   *
   * #### Notes
   * This method implements the DOM `EventListener` interface and is
   * called in response to events on the notification's DOM node.
   *
   * This should not be called directly by user code.
   */
  handleEvent(event: Event): void {
    switch (event.type) {
      case 'mousedown':
        this._evtMouseDown(event as MouseEvent);
        break;
      case 'contextmenu':
        event.preventDefault();
        event.stopPropagation();
        break;
    }
  }

  /**
   * Get the placement of the notification.
   */
  get placement(): Notification.Placement {
    return this._placement;
  }

  /**
   * Set the placement of the notification.
   */
  set placement(value: Notification.Placement) {
    // Do nothing if the placement does not change.
    if (this._placement === value) {
      return;
    }

    // Update the internal placement.
    this._placement = value;

    // Schedule an update for notification.
    this.update();
  }

  /**
   * Get the current value of the message.
   */
  get message(): string {
    return this._message;
  }

  /**
   * Set the current value of the message.
   *
   */
  set message(value: string) {
    // Do nothing if the value does not change.
    if (this._message === value) {
      return;
    }

    // Update the internal value.
    this._message = value;

    // Schedule an update for notification.
    this.update();
  }

  /**
   * Get the node presenting the message.
   */
  get messageNode(): HTMLSpanElement {
    return this.node.getElementsByClassName(
      'lm-DataGrid-notificationMessage'
    )[0] as HTMLSpanElement;
  }

  /**
   * A method invoked on a 'before-attach' message.
   */
  protected onBeforeAttach(msg: Message): void {
    this.node.addEventListener('mousedown', this);
    this.update();
  }

  /**
   * A method invoked on an 'after-detach' message.
   */
  protected onAfterDetach(msg: Message): void {
    this.node.removeEventListener('mousedown', this);
  }

  /**
   * A method invoked on an 'update-request' message.
   */
  protected onUpdateRequest(msg: Message): void {
    const targetRect = this._target.getBoundingClientRect();
    const style = this.node.style;

    switch (this._placement) {
      case 'bottom':
        style.left = targetRect.left + 'px';
        style.top = targetRect.bottom + 'px';
        break;
      case 'top':
        style.left = targetRect.left + 'px';
        style.height = targetRect.top + 'px';
        style.top = '0';
        style.alignItems = 'flex-end';
        style.justifyContent = 'flex-end';
        break;
      case 'left':
        style.left = '0';
        style.width = targetRect.left + 'px';
        style.top = targetRect.top + 'px';
        style.alignItems = 'flex-end';
        style.justifyContent = 'flex-end';
        break;
      case 'right':
        style.left = targetRect.right + 'px';
        style.top = targetRect.top + 'px';
        break;
    }

    this.messageNode.innerHTML = this._message;
  }

  /**
   * Handle the `'mousedown'` event for the notification.
   */
  private _evtMouseDown(event: MouseEvent): void {
    // Do nothing if it's not a left mouse press.
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.close();
  }

  private _target: HTMLElement;
  private _message: string = '';
  private _placement: Notification.Placement;
}

/**
 * The namespace for the `Notification` class statics.
 */
export namespace Notification {
  /**
   * A type alias for a notification placement.
   */
  export type Placement = 'top' | 'bottom' | 'left' | 'right';

  /**
   * An options object for creating a notification.
   */
  export interface IOptions {
    /**
     * Target element to attach notification to.
     *
     */
    target: HTMLElement;

    /**
     * The message to show on notification.
     */
    message?: string;

    /**
     * The placement of the notification.
     *
     * The default is `'bottom'`.
     */
    placement?: Placement;

    /**
     * Duration in ms after which to close notification popup.
     *
     * The default is undefined, and notification is kept visible
     * Timeout value needs to be greater than zero
     */
    timeout?: number;
  }
}

/**
 * The namespace for the module implementation details.
 */
namespace Private {
  /**
   * Create the DOM node for notification.
   */
  export function createNode(): HTMLElement {
    const node = document.createElement('div');
    const container = document.createElement('div');
    container.className = 'lm-DataGrid-notificationContainer';
    const message = document.createElement('span');
    message.className = 'lm-DataGrid-notificationMessage';
    container.appendChild(message);
    node.appendChild(container);

    return node;
  }
}
