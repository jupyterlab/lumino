// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/

import { SPECIAL_KEYS } from './special-keys';

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
 * A concrete implementation of [[IKeyboardLayout]] based on keycodes.
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
   * @param codes - A mapping of keycode to key value.
   *
   * @param modifierKeys - Array of modifier key names
   */
  constructor(
    name: string,
    keyCodes: KeycodeLayout.CodeMap,
    modifierKeys: string[] = [],
    codes: KeycodeLayout.ModernCodeMap = {}
  ) {
    this.name = name;
    this._keyCodes = keyCodes;
    this._codes = codes;
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
      event.code in this._codes
    ) {
      return this._codes[event.code];
    }
    return (
      this._keyCodes[event.keyCode] ||
      (Private.isSpecialCharacter(event.key) ? event.key : '')
    );
  }

  private _keys: KeycodeLayout.KeySet;
  private _keyCodes: KeycodeLayout.CodeMap;
  private _codes: KeycodeLayout.ModernCodeMap;
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
   * @param code - The code map of interest.
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
 * The namespace for the module implementation details.
 */
namespace Private {
  /**
   * Whether the key value can be considered a special character.
   *
   * @param key - The key value that is to be considered
   */
  export function isSpecialCharacter(key: string): boolean {
    // If the value starts with an uppercase latin character and is followed by one
    // or more alphanumeric basic latin characters, it is likely a special key.
    return SPECIAL_KEYS.indexOf(key) !== -1;
  }
}