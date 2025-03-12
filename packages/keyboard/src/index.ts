// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
/**
 * @packageDocumentation
 * @module keyboard
 */

import { MODIFIER_KEYS, SPECIAL_KEYS } from './special-keys';

/**
 * An object which represents an abstract keyboard layout.
 */
export interface IKeyboardLayout {
  /**
   * The human readable name of the layout.
   *
   * This value is used primarily for display and debugging purposes.
   */
  readonly name: string;

  /**
   * Get an array of all key values supported by the layout.
   *
   * @returns A new array of the supported key values.
   *
   * #### Notes
   * This can be useful for authoring tools and debugging, when it's
   * necessary to know which keys are available for shortcut use.
   */
  keys(): string[];

  /**
   * Test whether the given key is a valid value for the layout.
   *
   * @param key - The user provided key to test for validity.
   *
   * @returns `true` if the key is valid, `false` otherwise.
   */
  isValidKey(key: string): boolean;

  /**
   * Test whether the given key is a modifier key.
   *
   * @param key - The user provided key.
   *
   * @returns `true` if the key is a modifier key, `false` otherwise.
   *
   * #### Notes
   * This is necessary so that we don't process modifier keys pressed
   * in the middle of the key sequence.
   * E.g. "Shift C Ctrl P" is actually 4 keydown events:
   *   "Shift", "Shift P", "Ctrl", "Ctrl P",
   * and events for "Shift" and "Ctrl" should be ignored.
   */
  isModifierKey(key: string): boolean;

  /**
   * Get the key for a `'keydown'` event.
   *
   * @param event - The event object for a `'keydown'` event.
   *
   * @returns The associated key value, or an empty string if the event
   *   does not represent a valid primary key.
   */
  keyForKeydownEvent(event: KeyboardEvent): string;
}

/**
 * Get the global application keyboard layout instance.
 *
 * @returns The keyboard layout for use by the application.
 *
 * #### Notes
 * The default keyboard layout is US-English.
 */
export function getKeyboardLayout(): IKeyboardLayout {
  return Private.keyboardLayout;
}

/**
 * Set the global application keyboard layout instance.
 *
 * @param layout The keyboard layout for use by the application.
 *
 * #### Notes
 * The keyboard layout should typically be set on application startup
 * to a layout which is appropriate for the user's system.
 */
export function setKeyboardLayout(layout: IKeyboardLayout): void {
  try {
    Private.unsubscribeBrowserUpdates();
  } catch (e) {
    // Ignore exceptions in experimental code
  }
  Private.keyboardLayout = layout;
}

/**
 * A concrete implementation of {@link IKeyboardLayout} based on keycodes.
 *
 * The `keyCode` property of a `'keydown'` event is a browser and OS
 * specific representation of the physical key (not character) which
 * was pressed on a keyboard. While not the most convenient API, it
 * is currently the only one which works reliably on all browsers.
 *
 * This class accepts a user-defined mapping of keycode to key, which
 * allows for reliable shortcuts tailored to the user's system.
 */
export class KeycodeLayout implements IKeyboardLayout {
  /**
   * Construct a new keycode layout.
   *
   * @param name - The human readable name for the layout.
   *
   * @param keyCodes - A mapping of legacy keycodes to key values.
   *
   * @param modifierKeys - Array of modifier key names
   *
   * @param codes - A mapping of modern keycodes to key values.
   *
   * #### Notes
   * The legacy mapping is from KeyboardEvent.keyCode values to key
   * strings, while the modern mapping is from KeyboardEvent.code
   * values to key strings. While `keyCodes` is required and `codes`
   * is optional for API backwards-compatability, it is recommended
   * to always pass the modern mapping, and it should then be safe to
   * leave the `keyCodes` mapping empty.
   */
  constructor(
    name: string,
    keyCodes: KeycodeLayout.CodeMap,
    modifierKeys: string[] = [],
    codes: KeycodeLayout.ModernCodeMap = {}
  ) {
    this.name = name;
    this._legacyCodes = keyCodes;
    this._modernCodes = codes;
    this._keys = KeycodeLayout.extractKeys(keyCodes, codes);
    this._modifierKeys = KeycodeLayout.convertToKeySet(modifierKeys);
  }

  /**
   * The human readable name of the layout.
   */
  readonly name: string;

  /**
   * Get an array of the key values supported by the layout.
   *
   * @returns A new array of the supported key values.
   */
  keys(): string[] {
    return Object.keys(this._keys);
  }

  /**
   * Test whether the given key is a valid value for the layout.
   *
   * @param key - The user provided key to test for validity.
   *
   * @returns `true` if the key is valid, `false` otherwise.
   */
  isValidKey(key: string): boolean {
    key = Private.normalizeCtrl(key);
    return key in this._keys || Private.isSpecialCharacter(key);
  }

  /**
   * Test whether the given key is a modifier key.
   *
   * @param key - The user provided key.
   *
   * @returns `true` if the key is a modifier key, `false` otherwise.
   */
  isModifierKey(key: string): boolean {
    key = Private.normalizeCtrl(key);
    return key in this._modifierKeys;
  }

  /**
   * Get the key for a `'keydown'` event.
   *
   * @param event - The event object for a `'keydown'` event.
   *
   * @returns The associated key value, or an empty string if
   *   the event does not represent a valid primary key.
   */
  keyForKeydownEvent(event: KeyboardEvent): string {
    if (
      event.code !== '' &&
      event.code !== 'Unidentified' &&
      event.code in this._modernCodes
    ) {
      return this._modernCodes[event.code];
    }
    return (
      this._legacyCodes[event.keyCode] ||
      (Private.isSpecialCharacter(event.key) ? event.key : '')
    );
  }

  private _keys: KeycodeLayout.KeySet;
  private _legacyCodes: KeycodeLayout.CodeMap;
  private _modernCodes: KeycodeLayout.ModernCodeMap;
  private _modifierKeys: KeycodeLayout.KeySet;
}

/**
 * The namespace for the `KeycodeLayout` class statics.
 */
export namespace KeycodeLayout {
  /**
   * A type alias for a keycode map.
   */
  export type CodeMap = { readonly [keyCode: number]: string };

  /**
   * A type alias for a code map.
   */
  export type ModernCodeMap = { readonly [code: string]: string };

  /**
   * A type alias for a key set.
   */
  export type KeySet = { readonly [key: string]: boolean };

  /**
   * Extract the set of keys from a code map.
   *
   * @param keyCodes - A legacy code map mapping form event.keyCode to key.
   * @param codes - A modern code map mapping from event.code to key.
   *
   * @returns A set of the keys in the code map.
   */
  export function extractKeys(
    keyCodes: CodeMap,
    codes: ModernCodeMap = {}
  ): KeySet {
    let keys: any = Object.create(null);
    for (let c in keyCodes) {
      keys[keyCodes[c]] = true;
    }
    for (let c in codes) {
      keys[codes[c]] = true;
    }
    return keys as KeySet;
  }

  /**
   * Convert array of keys to a key set.
   *
   * @param keys - The array that needs to be converted
   *
   * @returns A set of the keys in the array.
   */
  export function convertToKeySet(keys: string[]): KeySet {
    let keySet = Object(null);
    for (let i = 0, n = keys.length; i < n; ++i) {
      keySet[keys[i]] = true;
    }
    return keySet;
  }
}

/**
 * A keycode-based keyboard layout for US English keyboards.
 *
 * This layout is valid for the following OS/Browser combinations.
 *
 * - Windows
 *   - Chrome
 *   - Firefox
 *   - IE
 *
 * - OSX
 *   - Chrome
 *   - Firefox
 *   - Safari
 *
 * - Linux
 *   - Chrome
 *   - Firefox
 *
 * Other combinations may also work, but are untested.
 */
export const EN_US: IKeyboardLayout = new KeycodeLayout(
  'en-us',
  {
    8: 'Backspace',
    9: 'Tab',
    13: 'Enter',
    16: 'Shift',
    17: 'Control',
    18: 'Alt',
    19: 'Pause',
    27: 'Escape',
    32: 'Space',
    33: 'PageUp',
    34: 'PageDown',
    35: 'End',
    36: 'Home',
    37: 'ArrowLeft',
    38: 'ArrowUp',
    39: 'ArrowRight',
    40: 'ArrowDown',
    45: 'Insert',
    46: 'Delete',
    48: '0',
    49: '1',
    50: '2',
    51: '3',
    52: '4',
    53: '5',
    54: '6',
    55: '7',
    56: '8',
    57: '9',
    59: ';', // firefox
    61: '=', // firefox
    65: 'A',
    66: 'B',
    67: 'C',
    68: 'D',
    69: 'E',
    70: 'F',
    71: 'G',
    72: 'H',
    73: 'I',
    74: 'J',
    75: 'K',
    76: 'L',
    77: 'M',
    78: 'N',
    79: 'O',
    80: 'P',
    81: 'Q',
    82: 'R',
    83: 'S',
    84: 'T',
    85: 'U',
    86: 'V',
    87: 'W',
    88: 'X',
    89: 'Y',
    90: 'Z',
    91: 'Meta', // non-firefox
    93: 'ContextMenu',
    96: '0', // numpad
    97: '1', // numpad
    98: '2', // numpad
    99: '3', // numpad
    100: '4', // numpad
    101: '5', // numpad
    102: '6', // numpad
    103: '7', // numpad
    104: '8', // numpad
    105: '9', // numpad
    106: '*', // numpad
    107: '+', // numpad
    109: '-', // numpad
    110: '.', // numpad
    111: '/', // numpad
    112: 'F1',
    113: 'F2',
    114: 'F3',
    115: 'F4',
    116: 'F5',
    117: 'F6',
    118: 'F7',
    119: 'F8',
    120: 'F9',
    121: 'F10',
    122: 'F11',
    123: 'F12',
    173: '-', // firefox
    186: ';', // non-firefox
    187: '=', // non-firefox
    188: ',',
    189: '-', // non-firefox
    190: '.',
    191: '/',
    192: '`',
    219: '[',
    220: '\\',
    221: ']',
    222: "'",
    224: 'Meta' // firefox
  },
  MODIFIER_KEYS,
  {
    AltLeft: 'Alt',
    AltRight: 'Alt',
    ArrowDown: 'ArrowDown',
    ArrowLeft: 'ArrowLeft',
    ArrowRight: 'ArrowRight',
    ArrowUp: 'ArrowUp',
    Backquote: '`',
    Backslash: '\\',
    Backspace: 'Backspace',
    BracketLeft: '[',
    BracketRight: ']',
    CapsLock: 'CapsLock',
    Comma: ',',
    ControlLeft: 'Control',
    ControlRight: 'Control',
    Delete: 'Delete',
    Digit0: '0',
    Digit1: '1',
    Digit2: '2',
    Digit3: '3',
    Digit4: '4',
    Digit5: '5',
    Digit6: '6',
    Digit7: '7',
    Digit8: '8',
    Digit9: '9',
    End: 'End',
    Equal: '=',
    Escape: 'Escape',
    F1: 'F1',
    F10: 'F10',
    F11: 'F11',
    F12: 'F12',
    F2: 'F2',
    F3: 'F3',
    F4: 'F4',
    F5: 'F5',
    F6: 'F6',
    F7: 'F7',
    F8: 'F8',
    F9: 'F9',
    Home: 'Home',
    Insert: 'Insert',
    KeyA: 'A',
    KeyB: 'B',
    KeyC: 'C',
    KeyD: 'D',
    KeyE: 'E',
    KeyF: 'F',
    KeyG: 'G',
    KeyH: 'H',
    KeyI: 'I',
    KeyJ: 'J',
    KeyK: 'K',
    KeyL: 'L',
    KeyM: 'M',
    KeyN: 'N',
    KeyO: 'O',
    KeyP: 'P',
    KeyQ: 'Q',
    KeyR: 'R',
    KeyS: 'S',
    KeyT: 'T',
    KeyU: 'U',
    KeyV: 'V',
    KeyW: 'W',
    KeyX: 'X',
    KeyY: 'Y',
    KeyZ: 'Z',
    MetaLeft: 'Meta',
    MetaRight: 'Meta',
    Minus: '-',
    NumLock: 'NumLock',
    Numpad0: 'Insert',
    Numpad1: 'End',
    Numpad2: 'ArrowDown',
    Numpad3: 'PageDown',
    Numpad4: 'ArrowLeft',
    Numpad5: 'Clear',
    Numpad6: 'ArrowRight',
    Numpad7: 'Home',
    Numpad8: 'ArrowUp',
    Numpad9: 'PageUp',
    NumpadAdd: '+',
    NumpadDecimal: 'Delete',
    NumpadDivide: '/',
    NumpadEnter: 'Enter',
    NumpadMultiply: '*',
    NumpadSubtract: '-',
    OSLeft: 'OS', // firefox
    OSRight: 'OS', // firefox
    PageDown: 'PageDown',
    PageUp: 'PageUp',
    Pause: 'Pause',
    Period: '.',
    PrintScreen: 'PrintScreen',
    Quote: "'",
    Semicolon: ';',
    ShiftLeft: 'Shift',
    ShiftRight: 'Shift',
    Slash: '/',
    Tab: 'Tab'
  }
);

/**
 * Whether the browser supports inspecting the keyboard layout.
 *
 * @alpha
 */
export function hasBrowserLayout(): boolean {
  return !!(navigator as any)?.keyboard?.getLayoutMap;
}

/**
 * Use the keyboard layout of the browser if it supports it.
 *
 * @alpha
 * @returns Whether the browser supports inspecting the keyboard layout.
 */
export async function useBrowserLayout(): Promise<boolean> {
  // avoid updating if already set
  if (Private.keyboardLayout.name !== Private.INTERNAL_BROWSER_LAYOUT_NAME) {
    if (!(await Private.updateBrowserLayout())) {
      return false;
    }
  }
  Private.subscribeBrowserUpdates();
  return true;
}

/**
 * The namespace for the module implementation details.
 */
namespace Private {
  /**
   * The global keyboard layout instance.
   */
  export let keyboardLayout = EN_US;

  /**
   * Internal name for browser-based keyboard layout.
   */
  export const INTERNAL_BROWSER_LAYOUT_NAME = '__lumino-internal-browser';

  /**
   * Whether the key value can be considered a special character.
   *
   * @param key - The key value that is to be considered
   */
  export function isSpecialCharacter(key: string): boolean {
    // If the value starts with an uppercase latin character and is followed by one
    // or more alphanumeric basic latin characters, it is likely a special key.
    return SPECIAL_KEYS.has(key);
  }

  /**
   * Normalize Ctrl to Control for backwards compatability.
   *
   * @param key - The key value that is to be normalized
   * @returns The normalized key string
   */
  export function normalizeCtrl(key: string): string {
    return key === 'Ctrl' ? 'Control' : key;
  }

  /**
   * Polyfill until Object.fromEntries is available.
   */
  function fromEntries<T>(entries: Iterable<[string, T]>) {
    const ret = {} as { [key: string]: T };
    for (const [key, value] of entries) {
      ret[key] = value;
    }
    return ret;
  }

  /**
   * Get the current browser keyboard layout, or null if unsupported.
   *
   * @returns The keyboard layout of the browser at this moment if supported, otherwise null.
   */
  export async function getBrowserKeyboardLayout(): Promise<
    IKeyboardLayout | undefined
  > {
    const keyboardApi = (navigator as any)?.keyboard;
    if (!keyboardApi) {
      return undefined;
    }
    const browserMap = await keyboardApi.getLayoutMap();
    if (!browserMap) {
      return undefined;
    }
    return new KeycodeLayout(
      INTERNAL_BROWSER_LAYOUT_NAME,
      {},
      MODIFIER_KEYS,
      fromEntries(
        browserMap
          .entries()
          .map(([k, v]: string[]) => [
            k,
            v.charAt(0).toUpperCase() + v.slice(1)
          ])
      )
    );
  }

  /**
   * Set the active layout to that of the browser at this moment.
   */
  export async function updateBrowserLayout(): Promise<boolean> {
    const initial = await getBrowserKeyboardLayout();
    if (!initial) {
      return false;
    }
    keyboardLayout = initial;
    return true;
  }

  /**
   * Subscribe to any browser updates to keyboard layout
   */
  export function subscribeBrowserUpdates(): void {
    const keyboardApi = (navigator as any)?.keyboard;
    if (keyboardApi?.addEventListener) {
      keyboardApi.addEventListener('layoutchange', Private.updateBrowserLayout);
    }
  }

  /**
   * Unsubscribe from any browser updates
   */
  export function unsubscribeBrowserUpdates(): void {
    const keyboardApi = (navigator as any)?.keyboard;
    if (keyboardApi?.removeEventListener) {
      keyboardApi.removeEventListener(updateBrowserLayout);
    }
  }
}
