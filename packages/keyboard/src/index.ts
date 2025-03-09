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

import { IKeyboardLayout } from './core';
export { IKeyboardLayout, KeycodeLayout } from './core';

export { EN_US } from './layouts';
import { EN_US } from './layouts';
import * as Layouts from './layouts';

export const KeyboardLayouts = Object.values(Layouts);

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
  Private.keyboardLayout = layout;
}

/**
 * The namespace for the module implementation details.
 */
namespace Private {
  /**
   * The global keyboard layout instance.
   */
  export let keyboardLayout = EN_US;
}
