// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

/**
 * A composite type for callback handles, useful for unscheduling the callback.
 */
type Handle =
  | ReturnType<typeof requestAnimationFrame>
  | ReturnType<typeof setImmediate>
  | ReturnType<typeof setTimeout>;

/**
 * Whether the client is a brower and can request animation frames.
 */
const BROWSER =
  typeof document !== 'undefined' &&
  typeof requestAnimationFrame === 'function';

/**
 * Schedules a function for invocation as soon as possible asynchronously.
 *
 * @param fn The function to invoke when called back.
 *
 * @returns A handle that can be used to `unschedule` the `fn` if possible.
 */
export function schedule(fn: () => unknown): Handle {
  if (BROWSER && document.visibilityState === 'hidden') {
    return setTimeout(fn);
  }
  if (BROWSER) {
    return requestAnimationFrame(fn);
  }
  return setImmediate(fn);
}

/**
 * Unschedules a function invocation if possible.
 *
 * @param handle The handle for the callback to unschedule.
 */
export function unschedule(handle: Handle): void {
  if (BROWSER && document.visibilityState === 'hidden') {
    return clearTimeout(handle as ReturnType<typeof setTimeout>);
  }
  if (BROWSER) {
    return cancelAnimationFrame(handle as number);
  }
  return clearImmediate(handle as ReturnType<typeof setImmediate>);
}
