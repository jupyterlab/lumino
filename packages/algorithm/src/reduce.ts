// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
import { iter, IterableOrArrayLike } from './iter';

/**
 * Summarize all values in an iterable using a reducer function.
 *
 * @param object - The iterable or array-like object of interest.
 *
 * @param fn - The reducer function to invoke for each value.
 *
 * @param initial - The initial value to start accumulation.
 *
 * @returns The final accumulated value.
 *
 * #### Notes
 * The `reduce` function follows the conventions of `Array#reduce`.
 *
 * If the iterator is empty, an initial value is required. That value
 * will be used as the return value. If no initial value is provided,
 * an error will be thrown.
 *
 * If the iterator contains a single item and no initial value is
 * provided, the single item is used as the return value.
 *
 * Otherwise, the reducer is invoked for each element in the iterable.
 * If an initial value is not provided, the first element will be used
 * as the initial accumulated value.
 *
 * #### Complexity
 * Linear.
 *
 * #### Example
 * ```typescript
 * import { reduce } from '@lumino/algorithm';
 *
 * let data = [1, 2, 3, 4, 5];
 *
 * let sum = reduce(data, (a, value) => a + value);  // 15
 * ```
 */
export function reduce<T>(
  object: IterableOrArrayLike<T>,
  fn: (accumulator: T, value: T, index: number) => T
): T;
export function reduce<T, U>(
  object: IterableOrArrayLike<T>,
  fn: (accumulator: U, value: T, index: number) => U,
  initial: U
): U;
export function reduce<T>(
  object: IterableOrArrayLike<T>,
  fn: (accumulator: any, value: T, index: number) => any,
  initial?: unknown
): any {
  // Setup the iterator and fetch the first value.
  let index = 0;
  let it = iter(object);
  let first = it.next();

  // An empty iterator and no initial value is an error.
  if (first === undefined && initial === undefined) {
    throw new TypeError('Reduce of empty iterable with no initial value.');
  }

  // If the iterator is empty, return the initial value.
  if (first === undefined) {
    return initial;
  }

  // If the iterator has a single item and no initial value, the
  // reducer is not invoked and the first item is the return value.
  let second = it.next();
  if (second === undefined && initial === undefined) {
    return first;
  }

  // If iterator has a single item and an initial value is provided,
  // the reducer is invoked and that result is the return value.
  if (second === undefined) {
    return fn(initial, first, index++);
  }

  // Setup the initial accumlated value.
  let accumulator: any;
  if (initial === undefined) {
    accumulator = fn(first, second, index++);
  } else {
    accumulator = fn(fn(initial, first, index++), second, index++);
  }

  // Iterate the rest of the values, updating the accumulator.
  let next: T | undefined;
  while ((next = it.next()) !== undefined) {
    accumulator = fn(accumulator, next, index++);
  }

  // Return the final accumulated value.
  return accumulator;
}
