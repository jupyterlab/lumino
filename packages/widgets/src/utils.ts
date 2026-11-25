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
   * Adopt a node into the document of a parent node.
   *
   * Use this to update `node.ownerDocument` before inserting the node.
   * This is a no-op if the node already belongs to that document.
   */
  export function adoptNode(node: Node, parent: Node): void {
    const doc = parent.ownerDocument;
    if (doc && node.ownerDocument !== doc) {
      doc.adoptNode(node);
    }
  }

  /**
   * Whether a pointer event came from touch input.
   */
  export function isTouchEvent(event: PointerEvent | MouseEvent): boolean {
    return 'pointerType' in event && event.pointerType === 'touch';
  }
}

export default Utils;
