// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { Message } from '@lumino/messaging';
import { ISignal, Signal } from '@lumino/signaling';
import { Widget } from '@lumino/widgets';

export class OutputWidget extends Widget {
  /**
   *
   */
  constructor(options?: Widget.IOptions) {
    super(options);
    this._output = document.createElement('div');
    this._exportButton = document.createElement('button');
    this._exportButton.innerText = 'Show';
    this._copyButton = document.createElement('button');
    this._copyButton.innerText = 'Copy';
    this._clearButton = document.createElement('button');
    this._clearButton.innerText = 'Clear';
    this.node.appendChild(this._exportButton);
    this.node.appendChild(this._copyButton);
    this.node.appendChild(this._clearButton);
    this.node.appendChild(this._output);
    this.addClass('lm-keyboardCaptureOutputArea');
  }

  set value(content: string) {
    this._output.innerHTML = content;
  }

  get action(): ISignal<this, 'display' | 'clipboard' | 'clear'> {
    return this._action;
  }

  /**
   * Handle the DOM events for the widget.
   *
   * @param event - The DOM event sent to the element.
   */
  handleEvent(event: Event): void {
    switch (event.type) {
      case 'click':
        if (event.target === this._exportButton) {
          event.stopPropagation();
          this._action.emit('display');
        } else if (event.target === this._copyButton) {
          event.stopPropagation();
          this._action.emit('clipboard');
        } else if (event.target === this._clearButton) {
          event.stopPropagation();
          this._action.emit('clear');
        }
        break;
    }
  }

  /**
   * A message handler invoked on a `'before-attach'` message.
   */
  protected onBeforeAttach(msg: Message): void {
    this._exportButton.addEventListener('click', this);
    this._copyButton.addEventListener('click', this);
    this._clearButton.addEventListener('click', this);
    super.onBeforeAttach(msg);
  }

  /**
   * A message handler invoked on an `'after-detach'` message.
   */
  protected onAfterDetach(msg: Message): void {
    super.onAfterDetach(msg);
    this._exportButton.removeEventListener('click', this);
    this._copyButton.removeEventListener('click', this);
    this._clearButton.removeEventListener('click', this);
  }

  private _output: HTMLElement;
  private _exportButton: HTMLButtonElement;
  private _copyButton: HTMLButtonElement;
  private _clearButton: HTMLButtonElement;
  private _action = new Signal<this, 'display' | 'clipboard' | 'clear'>(this);
}