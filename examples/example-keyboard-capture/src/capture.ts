// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { KeycodeLayout } from '@lumino/keyboard';
import { Message } from '@lumino/messaging';
import { ISignal, Signal } from '@lumino/signaling';
import { Widget } from '@lumino/widgets';

/**
 * A widget for capturing a keyboard layout.
 */
export class CaptureWidget extends Widget {
  /**
   *
   */
  constructor(options?: Widget.IOptions) {
    super(options);
    this.addClass('lm-keyboardCaptureArea');
    if (!options || !options.node) {
      this.node.tabIndex = 0;
    }
  }

  extractLayout(name: string): KeycodeLayout {
    return new KeycodeLayout(
      name,
      this._keyCodeMap,
      Array.from(this._modifierKeys),
      this._codeMap
    );
  }

  formatMap(): string {
    return `codes: ${Private.formatCodeMap(
      this._codeMap
    )}\n\nmodifiers: [${Array.from(this._modifierKeys)
      .map(k => `"${k}"`)
      .sort()
      .join(', ')}]${
      Private.isCodeMapEmpty(this._keyCodeMap)
        ? ''
        : `\n\nkeyCodes${Private.formatCodeMap(this._keyCodeMap)}`
    }`;
  }

  clear(): void {
    this._codeMap = {};
    this._keyCodeMap = {};
    this._modifierKeys.clear();
  }

  node: HTMLInputElement;

  get dataAdded(): ISignal<this, CaptureWidget.Entry> {
    return this._dataAdded;
  }

  /**
   * Handle the DOM events for the widget.
   *
   * @param event - The DOM event sent to the element.
   */
  handleEvent(event: Event): void {
    switch (event.type) {
      case 'keydown':
        this._onKeyDown(event as KeyboardEvent);
        break;
      case 'keyup':
        this._onKeyUp(event as KeyboardEvent);
        break;
    }
  }

  /**
   * A message handler invoked on a `'before-attach'` message.
   */
  protected onBeforeAttach(msg: Message): void {
    this.node.addEventListener('keydown', this);
    this.node.addEventListener('keyup', this);
    super.onBeforeAttach(msg);
  }

  /**
   * A message handler invoked on an `'after-detach'` message.
   */
  protected onAfterDetach(msg: Message): void {
    super.onAfterDetach(msg);
    this.node.removeEventListener('keydown', this);
    this.node.removeEventListener('keyup', this);
  }

  private _onKeyDown(event: KeyboardEvent): void {
    event.stopPropagation();
    event.preventDefault();
    if (event.getModifierState(event.key)) {
      this._modifierKeys.add(event.key);
      this._dataAdded.emit({ key: event.key, type: 'modifier' });
    }
  }

  private _onKeyUp(event: KeyboardEvent): void {
    event.stopPropagation();
    event.preventDefault();
    if (event.getModifierState(event.key)) {
      this._modifierKeys.add(event.key);
      this._dataAdded.emit({ key: event.key, type: 'modifier' });
      return;
    }
    let { key, code } = event;
    if (key === 'Dead') {
      console.log('Dead key', event);
      return;
    }
    if ((!code || code === 'Unidentified') && event.keyCode) {
      console.log('Unidentified code', event);
      this._keyCodeMap[event.keyCode] = key;
      this._dataAdded.emit({ key, code: event.keyCode, type: 'keyCode' });
    } else {
      this._codeMap[code] = key;
      this._dataAdded.emit({ key, code, type: 'code' });
    }
  }

  private _codeMap: { [key: string]: string } = {};
  private _keyCodeMap: { [key: number]: string } = {};
  private _modifierKeys: Set<string> = new Set();
  private _dataAdded = new Signal<this, CaptureWidget.Entry>(this);
}

namespace CaptureWidget {
  export type Entry = { type: string; code?: string | number; key: string };
}

namespace Private {
  export function isCodeMapEmpty(
    codemap: { [key: string]: string } | { [key: number]: string }
  ): boolean {
    return !Object.keys(codemap).length;
  }
  export function formatCodeMap(
    codemap: { [key: string]: string } | { [key: number]: string }
  ): string {
    return `{\n${Object.keys(codemap)
      .sort()
      .map(
        k =>
          `  "${k}": "${
            (codemap as any)[k] &&
            (codemap as any)[k][0].toUpperCase() + (codemap as any)[k].slice(1)
          }"`
      )
      .join(',\n')}\n}`;
  }
}
