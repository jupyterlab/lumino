export namespace Utils {
  /**
   * Clamp a dimension value to an integer >= 0.
   */
  export function clampDimension(value: number): number {
    return Math.max(0, Math.floor(value));
  }
}

export default Utils;
