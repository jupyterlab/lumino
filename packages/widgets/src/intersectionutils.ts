// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

/**
 * Shared multiplier for intersection hit testing tolerance.
 */
export const INTERSECTION_TOLERANCE_MULTIPLIER = 4;

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
    const seen = new Set<HTMLDivElement>();

    for (const handle of [first, second]) {
      if (!handle || seen.has(handle)) {
        continue;
      }
      handle.classList[action](this._className);
      seen.add(handle);
    }
  }

  private readonly _className = 'lm-mod-intersection';
  private _primary: HTMLDivElement | null = null;
  private _secondary: HTMLDivElement | null = null;
}
