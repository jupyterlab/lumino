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
  fn: (value: T, index: number, object: Iterable<T>) => boolean | void
): void {
  let index = 0;
  for (const value of object) {
    if (false === fn(value, index++, object)) {
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
  fn: (value: T, index: number, object: Iterable<T>) => boolean
): boolean {
  let index = 0;
  for (const value of object) {
    if (false === fn(value, index++, object)) {
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
  fn: (value: T, index: number, object: Iterable<T>) => boolean
): boolean {
  let index = 0;
  for (const value of object) {
    if (fn(value, index++, object)) {
      return true;
    }
  }
  return false;
}

/**
 * Create an array from an iterable of values.
 *
 * @param object - The iterable object of interest.
 *
 * @returns A new array of values from the given object.
 */
export function toArray<T>(object: Iterable<T>): T[] {
  return [...object];
}

/**
 * An iterator for the keys in an object.
 *
 * #### Notes
 * This iterator can be used for any JS object.
 */
export class KeyIterator implements IIterator<string> {
  /**
   * Construct a new key iterator.
   *
   * @param source - The object of interest.
   *
   * @param keys - The keys to iterate, if known.
   */
  constructor(
    source: { readonly [key: string]: any },
    keys = Object.keys(source)
  ) {
    this._source = source;
    this._keys = keys;
  }

  /**
   * Get an iterator over the object's values.
   *
   * @returns An iterator which yields the object's values.
   */
  iter(): IIterator<string> {
    return this;
  }

  /**
   * Create an independent clone of the iterator.
   *
   * @returns A new independent clone of the iterator.
   */
  clone(): IIterator<string> {
    let result = new KeyIterator(this._source, this._keys);
    result._index = this._index;
    return result;
  }

  /**
   * Get the next value from the iterator.
   *
   * @returns The next value from the iterator, or `undefined`.
   */
  next(): string | undefined {
    if (this._index >= this._keys.length) {
      return undefined;
    }
    let key = this._keys[this._index++];
    if (key in this._source) {
      return key;
    }
    return this.next();
  }

  private _index = 0;
  private _keys: string[];
  private _source: { readonly [key: string]: any };
}

/**
 * An iterator for the values in an object.
 *
 * #### Notes
 * This iterator can be used for any JS object.
 */
export class ValueIterator<T> implements IIterator<T> {
  /**
   * Construct a new value iterator.
   *
   * @param source - The object of interest.
   *
   * @param keys - The keys to iterate, if known.
   */
  constructor(
    source: { readonly [key: string]: T },
    keys = Object.keys(source)
  ) {
    this._source = source;
    this._keys = keys;
  }

  /**
   * Get an iterator over the object's values.
   *
   * @returns An iterator which yields the object's values.
   */
  iter(): IIterator<T> {
    return this;
  }

  /**
   * Create an independent clone of the iterator.
   *
   * @returns A new independent clone of the iterator.
   */
  clone(): IIterator<T> {
    let result = new ValueIterator<T>(this._source, this._keys);
    result._index = this._index;
    return result;
  }

  /**
   * Get the next value from the iterator.
   *
   * @returns The next value from the iterator, or `undefined`.
   */
  next(): T | undefined {
    if (this._index >= this._keys.length) {
      return undefined;
    }
    let key = this._keys[this._index++];
    if (key in this._source) {
      return this._source[key];
    }
    return this.next();
  }

  private _index = 0;
  private _keys: string[];
  private _source: { readonly [key: string]: T };
}

/**
 * An iterator for the items in an object.
 *
 * #### Notes
 * This iterator can be used for any JS object.
 */
export class ItemIterator<T> implements IIterator<[string, T]> {
  /**
   * Construct a new item iterator.
   *
   * @param source - The object of interest.
   *
   * @param keys - The keys to iterate, if known.
   */
  constructor(
    source: { readonly [key: string]: T },
    keys = Object.keys(source)
  ) {
    this._source = source;
    this._keys = keys;
  }

  /**
   * Get an iterator over the object's values.
   *
   * @returns An iterator which yields the object's values.
   */
  iter(): IIterator<[string, T]> {
    return this;
  }

  /**
   * Create an independent clone of the iterator.
   *
   * @returns A new independent clone of the iterator.
   */
  clone(): IIterator<[string, T]> {
    let result = new ItemIterator<T>(this._source, this._keys);
    result._index = this._index;
    return result;
  }

  /**
   * Get the next value from the iterator.
   *
   * @returns The next value from the iterator, or `undefined`.
   */
  next(): [string, T] | undefined {
    if (this._index >= this._keys.length) {
      return undefined;
    }
    let key = this._keys[this._index++];
    if (key in this._source) {
      return [key, this._source[key]];
    }
    return this.next();
  }

  private _index = 0;
  private _keys: string[];
  private _source: { readonly [key: string]: T };
}

/**
 * An iterator for an iterator-like function.
 */
export class FnIterator<T> implements IIterator<T> {
  /**
   * Construct a new function iterator.
   *
   * @param fn - The iterator-like function of interest.
   */
  constructor(fn: () => T | undefined) {
    this._fn = fn;
  }

  /**
   * Get an iterator over the object's values.
   *
   * @returns An iterator which yields the object's values.
   */
  iter(): IIterator<T> {
    return this;
  }

  /**
   * Create an independent clone of the iterator.
   *
   * @returns A new independent clone of the iterator.
   */
  clone(): IIterator<T> {
    throw new Error('An `FnIterator` cannot be cloned.');
  }

  /**
   * Get the next value from the iterator.
   *
   * @returns The next value from the iterator, or `undefined`.
   */
  next(): T | undefined {
    return this._fn.call(undefined);
  }

  private _fn: () => T | undefined;
}
