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
 * Invoke a function for each value in an iterable.
 *
 * @param object - The iterable object of interest.
 *
 * @param fn - The callback function to invoke for each value.
 *
 * #### Notes
 * Iteration can be terminated early by returning `false` from the
 * callback function.
 *
 * #### Complexity
 * Linear.
 *
 * #### Example
 * ```typescript
 * import { each } from '@lumino/algorithm';
 *
 * let data = [5, 7, 0, -2, 9];
 *
 * each(data, value => { console.log(value); });
 * ```
 */
export function each<T>(
  object: Iterable<T>,
  fn: (value: T, index: number) => boolean | void
): void {
  let index = 0;
  for (const value of object) {
    if (false === fn(value, index++)) {
      return;
    }
  }
}

/**
 * Test whether all values in an iterable satisfy a predicate.
 *
 * @param object - The iterable object of interest.
 *
 * @param fn - The predicate function to invoke for each value.
 *
 * @returns `true` if all values pass the test, `false` otherwise.
 *
 * #### Notes
 * Iteration terminates on the first `false` predicate result.
 *
 * #### Complexity
 * Linear.
 *
 * #### Example
 * ```typescript
 * import { every } from '@lumino/algorithm';
 *
 * let data = [5, 7, 1];
 *
 * every(data, value => value % 2 === 0);  // false
 * every(data, value => value % 2 === 1);  // true
 * ```
 */
export function every<T>(
  object: Iterable<T>,
  fn: (value: T, index: number) => boolean
): boolean {
  let index = 0;
  for (const value of object) {
    if (false === fn(value, index++)) {
      return false;
    }
  }
  return true;
}

/**
 * Test whether any value in an iterable satisfies a predicate.
 *
 * @param object - The iterable object of interest.
 *
 * @param fn - The predicate function to invoke for each value.
 *
 * @returns `true` if any value passes the test, `false` otherwise.
 *
 * #### Notes
 * Iteration terminates on the first `true` predicate result.
 *
 * #### Complexity
 * Linear.
 *
 * #### Example
 * ```typescript
 * import { some } from '@lumino/algorithm';
 *
 * let data = [5, 7, 1];
 *
 * some(data, value => value === 7);  // true
 * some(data, value => value === 3);  // false
 * ```
 */
export function some<T>(
  object: Iterable<T>,
  fn: (value: T, index: number) => boolean
): boolean {
  let index = 0;
  for (const value of object) {
    if (fn(value, index++)) {
      return true;
    }
  }
  return false;
}
