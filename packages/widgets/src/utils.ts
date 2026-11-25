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

  /**
   * Move a child of the parent before another child, or to the end when
   * `child` is `null`.
   *
   * #### Notes
   * Where the browser has `moveBefore`, the moved node keeps its focus,
   * its scroll positions and the documents of its iframes.
   */
  export function moveBefore(
    parent: HTMLElement,
    node: Node,
    child: Node | null
  ): void {
    const target = parent as HTMLElement & {
      moveBefore?: (node: Node, child: Node | null) => void;
    };
    // Only a node in the document has focus, scroll and iframes to keep.
    if (target.moveBefore && parent.isConnected) {
      target.moveBefore(node, child);
    } else {
      parent.insertBefore(node, child);
    }
  }
}

export default Utils;
