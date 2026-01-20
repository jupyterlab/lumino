// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
import { expect } from 'chai';

import {
  EN_US,
  getKeyboardLayout,
  KeycodeLayout,
  setKeyboardLayout
} from '@lumino/keyboard';

const MODIFIER_KEYS = [
  'Alt',
  'AltGraph',
  'CapsLock',
  'Control',
  'Fn',
  'FnLock',
  'Meta',
  'NumLock',
  'ScrollLock',
  'Shift',
  'Symbol',
  'SymbolLock'
];

/**
 * A common Norwegian keyboard layout.
 *
 * Note that this does not include Apple's magic Keyboards, as they map
 * the keys next to the Enter key differently (BracketRight and
 * Backslash on en-US).
 */
export const NB_NO = new KeycodeLayout('nb-NO', {}, MODIFIER_KEYS, {
  AltLeft: 'Alt',
  AltRight: 'AltGraph',
  Backquote: '|',
  Backslash: "'",
  Backspace: 'Backspace',
  BracketLeft: 'Å',
  CapsLock: 'CapsLock',
  Comma: ',',
  ContextMenu: 'ContextMenu',
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
  Enter: 'Enter',
  Equal: '\\',
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
  IntlBackslash: '<',
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
  MetaLeft: 'Meta', // chrome
  MetaRight: 'Meta', // chrome
  Minus: '+',
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
  Quote: 'Æ',
  ScrollLock: 'ScrollLock',
  Semicolon: 'Ø',
  ShiftLeft: 'Shift',
  ShiftRight: 'Shift',
  Slash: '-',
  Space: ' ',
  Tab: 'Tab'
});

/**
 * A common French keyboard layout
 */
export const FR_FR = new KeycodeLayout('fr-FR', {}, MODIFIER_KEYS, {
  AltLeft: 'Alt',
  AltRight: 'AltGraph',
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  ArrowUp: 'ArrowUp',
  Backquote: '²',
  Backslash: '*',
  Backspace: 'Backspace',
  BracketRight: '$',
  Comma: ';',
  ControlLeft: 'Control',
  ControlRight: 'Control',
  Delete: 'Delete',
  Digit0: 'À',
  Digit1: '&',
  Digit2: 'É',
  Digit3: '"',
  Digit4: "'",
  Digit5: '(',
  Digit6: '-',
  Digit7: 'È',
  Digit8: '_',
  Digit9: 'Ç',
  End: 'End',
  Enter: 'Enter',
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
  IntlBackslash: '<',
  KeyA: 'Q',
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
  KeyM: ',',
  KeyN: 'N',
  KeyO: 'O',
  KeyP: 'P',
  KeyQ: 'A',
  KeyR: 'R',
  KeyS: 'S',
  KeyT: 'T',
  KeyU: 'U',
  KeyV: 'V',
  KeyW: 'Z',
  KeyX: 'X',
  KeyY: 'Y',
  KeyZ: 'W',
  Minus: ')',
  Numpad0: '0',
  Numpad1: '1',
  Numpad2: '2',
  Numpad3: '3',
  Numpad4: '4',
  Numpad5: '5',
  Numpad6: '6',
  Numpad7: '7',
  Numpad8: '8',
  Numpad9: '9',
  NumpadAdd: '+',
  NumpadDecimal: '.',
  NumpadDivide: '/',
  NumpadEnter: 'Enter',
  NumpadMultiply: '*',
  NumpadSubtract: '-',
  PageDown: 'PageDown',
  PageUp: 'PageUp',
  Period: ':',
  Quote: 'Ù',
  ScrollLock: 'ScrollLock',
  Semicolon: 'M',
  ShiftLeft: 'Shift',
  ShiftRight: 'Shift',
  Slash: '!',
  Tab: 'Tab'
});

describe('@lumino/keyboard', () => {
  describe('getKeyboardLayout()', () => {
    it('should return the global keyboard layout', () => {
      expect(getKeyboardLayout()).to.equal(EN_US);
    });
  });

  describe('setKeyboardLayout()', () => {
    it('should set the global keyboard layout', () => {
      let layout = new KeycodeLayout('ab-cd', {});
      setKeyboardLayout(layout);
      expect(getKeyboardLayout()).to.equal(layout);
      setKeyboardLayout(EN_US);
      expect(getKeyboardLayout()).to.equal(EN_US);
    });
  });

  describe('KeycodeLayout', () => {
    describe('#constructor()', () => {
      it('should construct a new keycode layout', () => {
        let layout = new KeycodeLayout('ab-cd', {});
        expect(layout).to.be.an.instanceof(KeycodeLayout);
      });
    });

    describe('#name', () => {
      it('should be a human readable name of the layout', () => {
        let layout = new KeycodeLayout('ab-cd', {});
        expect(layout.name).to.equal('ab-cd');
      });
    });

    describe('#keys()', () => {
      it('should get an array of all key values supported by the layout', () => {
        let layout = new KeycodeLayout('ab-cd', { 100: 'F' }, [], { F4: 'F4' });
        let keys = layout.keys();
        expect(keys.length).to.equal(2);
        expect(keys[0]).to.equal('F', 'F4');
      });
    });

    describe('#isValidKey()', () => {
      it('should test whether the key is valid for the layout', () => {
        let layout = new KeycodeLayout('foo', { 100: 'F' }, [], { F4: 'F4' });
        expect(layout.isValidKey('F')).to.equal(true);
        expect(layout.isValidKey('F4')).to.equal(true);
        expect(layout.isValidKey('A')).to.equal(false);
      });

      it('should treat unmodified special keys as valid', () => {
        let layout = new KeycodeLayout('foo', { 100: 'F' }, [], { F4: 'F4' });
        expect(layout.isValidKey('MediaPlayPause')).to.equal(true);
      });

      it('should treat modifier keys as valid', () => {
        let layout = new KeycodeLayout('foo', { 100: 'F', 101: 'A' }, ['A']);
        expect(layout.isValidKey('A')).to.equal(true);
      });
    });

    describe('#isModifierKey()', () => {
      it('should test whether the key is modifier for the layout', () => {
        let layout = new KeycodeLayout('foo', { 100: 'F', 101: 'A' }, ['A']);
        expect(layout.isModifierKey('F')).to.equal(false);
        expect(layout.isModifierKey('A')).to.equal(true);
      });

      it('should return false for keys that are not in the layout', () => {
        let layout = new KeycodeLayout('foo', { 100: 'F', 101: 'A' }, ['A']);
        expect(layout.isModifierKey('B')).to.equal(false);
      });
    });

    describe('#keyForKeydownEvent()', () => {
      it('should get the key for a `keydown` event', () => {
        let layout = new KeycodeLayout('foo', { 100: 'F' });
        let event = new KeyboardEvent('keydown', { keyCode: 100 });
        let key = layout.keyForKeydownEvent(event as KeyboardEvent);
        expect(key).to.equal('F');
      });

      it('should return an empty string if the code is not valid', () => {
        let layout = new KeycodeLayout('foo', { 100: 'F' });
        let event = new KeyboardEvent('keydown', { keyCode: 101 });
        let key = layout.keyForKeydownEvent(event as KeyboardEvent);
        expect(key).to.equal('');
      });

      it('should get the key from a `code` value', () => {
        let layout = new KeycodeLayout('foo', { 100: 'F' }, [], {
          Escape: 'Escape'
        });
        let event = new KeyboardEvent('keydown', { code: 'Escape' });
        let key = layout.keyForKeydownEvent(event as KeyboardEvent);
        expect(key).to.equal('Escape');
      });

      it('should fall back to keyCode for Unidentified', () => {
        let layout = new KeycodeLayout('foo', { 100: 'F' }, [], {
          Escape: 'Escape'
        });
        let event = new KeyboardEvent('keydown', {
          code: 'Unidentified',
          keyCode: 100
        });
        let key = layout.keyForKeydownEvent(event as KeyboardEvent);
        expect(key).to.equal('F');
      });

      it('should treat special keys as valid', () => {
        let layout = new KeycodeLayout('foo', { 100: 'F' }, [], { F4: 'F4' });
        let event = new KeyboardEvent('keydown', {
          code: 'Unidentified',
          ctrlKey: true,
          key: 'MediaPlayPause',
          keyCode: 170
        });
        let key = layout.keyForKeydownEvent(event as KeyboardEvent);
        expect(key).to.equal('MediaPlayPause');
      });

      it('should use keyCode over special key value', () => {
        let layout = new KeycodeLayout('foo', { 100: 'F' }, [], { F4: 'F4' });
        let event = new KeyboardEvent('keydown', {
          code: 'Unidentified',
          key: 'MediaPlayPause',
          keyCode: 100
        });
        let key = layout.keyForKeydownEvent(event as KeyboardEvent);
        expect(key).to.equal('F');
      });
    });

    describe('.extractKeys()', () => {
      it('should extract the keys from a code map', () => {
        let keys: KeycodeLayout.CodeMap = { 70: 'F', 71: 'G', 72: 'H' };
        let goal: KeycodeLayout.KeySet = { F: true, G: true, H: true };
        expect(KeycodeLayout.extractKeys(keys)).to.deep.equal(goal);
      });
    });

    describe('.convertToKeySet()', () => {
      it('should convert key array to key set', () => {
        let keys: string[] = ['F', 'G', 'H'];
        let goal: KeycodeLayout.KeySet = { F: true, G: true, H: true };
        expect(KeycodeLayout.convertToKeySet(keys)).to.deep.equal(goal);
      });
    });
  });

  describe('EN_US', () => {
    it('should be a keycode layout', () => {
      expect(EN_US).to.be.an.instanceof(KeycodeLayout);
    });

    it('should have standardized keys', () => {
      expect(EN_US.isValidKey('A')).to.equal(true);
      expect(EN_US.isValidKey('Z')).to.equal(true);
      expect(EN_US.isValidKey('0')).to.equal(true);
      expect(EN_US.isValidKey('a')).to.equal(false);
    });

    it('should have modifier keys', () => {
      expect(EN_US.isValidKey('Shift')).to.equal(true);
      expect(EN_US.isValidKey('Control')).to.equal(true);
      expect(EN_US.isValidKey('Alt')).to.equal(true);
      expect(EN_US.isValidKey('Meta')).to.equal(true);
    });

    it('should correctly detect modifier keys', () => {
      expect(EN_US.isModifierKey('Shift')).to.equal(true);
      expect(EN_US.isModifierKey('Control')).to.equal(true);
      expect(EN_US.isModifierKey('Alt')).to.equal(true);
      expect(EN_US.isModifierKey('Meta')).to.equal(true);
    });
  });

  describe('FR_FR', () => {
    it('should be a keycode layout', () => {
      expect(FR_FR).to.be.an.instanceof(KeycodeLayout);
    });

    it('should have standardized keys', () => {
      expect(FR_FR.isValidKey('A')).to.equal(true);
      expect(FR_FR.isValidKey('Z')).to.equal(true);
      expect(FR_FR.isValidKey('0')).to.equal(true);
      expect(FR_FR.isValidKey('a')).to.equal(false);
      expect(FR_FR.isValidKey('Ù')).to.equal(true);
    });

    it('should have modifier keys', () => {
      expect(FR_FR.isValidKey('Shift')).to.equal(true);
      expect(FR_FR.isValidKey('Control')).to.equal(true);
      expect(FR_FR.isValidKey('Alt')).to.equal(true);
      expect(NB_NO.isValidKey('AltGraph')).to.equal(true);
      expect(FR_FR.isValidKey('Meta')).to.equal(true);
    });

    it('should correctly detect modifier keys', () => {
      expect(FR_FR.isModifierKey('Shift')).to.equal(true);
      expect(FR_FR.isModifierKey('Control')).to.equal(true);
      expect(FR_FR.isModifierKey('Alt')).to.equal(true);
      expect(FR_FR.isModifierKey('Meta')).to.equal(true);
    });
  });

  describe('NB_NO', () => {
    it('should be a keycode layout', () => {
      expect(NB_NO).to.be.an.instanceof(KeycodeLayout);
    });

    it('should have standardized keys', () => {
      expect(NB_NO.isValidKey('A')).to.equal(true);
      expect(NB_NO.isValidKey('Z')).to.equal(true);
      expect(NB_NO.isValidKey('0')).to.equal(true);
      expect(NB_NO.isValidKey('a')).to.equal(false);
      expect(NB_NO.isValidKey('Æ')).to.equal(true);
    });

    it('should have modifier keys', () => {
      expect(NB_NO.isValidKey('Shift')).to.equal(true);
      expect(NB_NO.isValidKey('Control')).to.equal(true);
      expect(NB_NO.isValidKey('Alt')).to.equal(true);
      expect(NB_NO.isValidKey('AltGraph')).to.equal(true);
      expect(NB_NO.isValidKey('Meta')).to.equal(true);
    });

    it('should correctly detect modifier keys', () => {
      expect(NB_NO.isModifierKey('Shift')).to.equal(true);
      expect(NB_NO.isModifierKey('Control')).to.equal(true);
      expect(NB_NO.isModifierKey('Alt')).to.equal(true);
      expect(NB_NO.isModifierKey('AltGraph')).to.equal(true);
      expect(NB_NO.isModifierKey('Meta')).to.equal(true);
    });
  });
});
