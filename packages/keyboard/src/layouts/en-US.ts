import { type IKeyboardLayout, KeycodeLayout } from '../core';

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
    17: 'Ctrl',
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
  ['Shift', 'Ctrl', 'Alt', 'Meta'] // modifier keys
);
