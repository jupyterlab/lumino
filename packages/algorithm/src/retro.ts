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
 * An object which can produce a reverse iterator over its values.
 */
export interface IRetroable<T> {
  /**
   * Get a reverse iterator over the object's values.
   *
   * @returns An iterator which yields the object's values in reverse.
   */
  retro(): IterableIterator<T>;
}

/**
 * Create an iterator for a retroable object.
 *
 * @param object - The retroable or array-like object of interest.
 *
 * @returns An iterator which traverses the object's values in reverse.
 *
 * #### Example
 * ```typescript
 * import { retro } from '@lumino/algorithm';
 *
 * let data = [1, 2, 3, 4, 5, 6];
 *
 * let stream = retro(data);
 *
 * Array.from(stream);  // [6, 5, 4, 3, 2, 1]
 * ```
 */
export function retro<T>(
  object: IRetroable<T> | ArrayLike<T>
): IterableIterator<T> {
  if (typeof (object as any).retro === 'function') {
    return (object as IRetroable<T>).retro();
  }
  return (function* (object) {
    for (let index = object.length - 1; ~index; index--) {
      yield object[index];
    }
  })(object as ArrayLike<T>);
}
