// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

/**
 * Shared multiplier for intersection hit testing tolerance.
 */
export const INTERSECTION_TOLERANCE_MULTIPLIER = 4;

/**
 * Resolve the direct child of `node` which contains the given event target.
 *
 * @param node - The panel node which owns the split handles.
 *
 * @param target - The target of a pointer event.
 *
 * @returns The direct child of `node` containing `target`, or `null` if
 *   `target` is not a descendant of `node`.
 *
 * #### Notes
 * Split handles are always appended directly to their panel's node, so this
 * is used to reject the pointer events which cannot be on a handle without
 * scanning the handle collection. It walks up from the target once instead of
 * walking down from every handle.
 */
export function findDirectChild(
  node: HTMLElement,
  target: EventTarget | null
): HTMLElement | null {
  let child = target as HTMLElement | null;
  while (child && child.parentNode !== node) {
    child = child.parentElement;
  }
  return child;
}

/**
 * Manages an intersection hover class on up to two handles.
 */
export class IntersectionHoverStyler {
  /**
   * Set the handles which should render with intersection hover styling.
   */
  set(
    primary: HTMLDivElement | null,
    secondary: HTMLDivElement | null = null
  ): void {
    if (this._primary === primary && this._secondary === secondary) {
      return;
    }

    this._applyClass(this._primary, this._secondary, false);
    this._primary = primary;
    this._secondary = secondary;
    this._applyClass(this._primary, this._secondary, true);
  }

  /**
   * Clear intersection hover styling.
   */
  clear(): void {
    this.set(null, null);
  }

  /**
   * Apply or remove the managed class from up to two distinct handles.
   */
  private _applyClass(
    first: HTMLDivElement | null,
    second: HTMLDivElement | null,
    add: boolean
  ): void {
    const action = add ? 'add' : 'remove';

    if (first) {
      first.classList[action](this._className);
    }
    if (second && second !== first) {
      second.classList[action](this._className);
    }
  }

  private readonly _className = 'lm-mod-intersection';
  private _primary: HTMLDivElement | null = null;
  private _secondary: HTMLDivElement | null = null;
}
