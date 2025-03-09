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

import { IKeyboardLayout, KeycodeLayout } from './core';
export { IKeyboardLayout, KeycodeLayout } from './core';

export { EN_US } from './layouts';
import { EN_US } from './layouts';
import * as Layouts from './layouts';
import { MODIFIER_KEYS } from './special-keys';

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
  try {
    Private.unsubscribeBrowserUpdates();
  } catch (e) {
    // Ignore exceptions in experimental code
  }
  Private.keyboardLayout = layout;
}

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
  const keyboardApi = (navigator as any)?.keyboard;
  // avoid updating if already set
  if (Private.keyboardLayout.name !== Private.INTERNAL_BROWSER_LAYOUT_NAME) {
    if (!(await Private.updateBrowserLayout())) {
      return false;
    }
  }
  if (keyboardApi?.addEventListener) {
    keyboardApi.addEventListener('layoutchange', Private.updateBrowserLayout);
  }
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
   * Set the active layout to that of the browser at this instant.
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
   * Unsubscribe any browser updates
   */
  export function unsubscribeBrowserUpdates(): void {
    const keyboardApi = (navigator as any)?.keyboard;
    if (keyboardApi?.removeEventListener) {
      keyboardApi.removeEventListener(updateBrowserLayout);
    }
  }
}
