// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/

import { type IKeyboardLayout, KeycodeLayout } from '../core';

import { MODIFIER_KEYS } from '../special-keys';

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
  'en-US',
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
