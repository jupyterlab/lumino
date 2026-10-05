/*
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */

export namespace Utils {
  /**
   * Clamp a dimension value to an integer >= 0.
   */
  export function clampDimension(value: number): number {
    return Math.max(0, Math.floor(value));
  }

  /**
   * Whether a pointer event came from touch input.
   */
  export function isTouchEvent(event: PointerEvent | MouseEvent): boolean {
    return 'pointerType' in event && event.pointerType === 'touch';
  }
}

export default Utils;
