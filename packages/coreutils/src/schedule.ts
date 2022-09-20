// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

/**
 * Test whether the client is a brower and can request animation frames.
 */
const BROWSER =
  typeof document !== 'undefined' &&
  typeof requestAnimationFrame === 'function';

/**
 * A composite type for callback handles, useful for unscheduling the callback.
 */
export type ScheduleHandle =
  | ReturnType<typeof requestAnimationFrame> // (DOM) number
  | ReturnType<typeof setImmediate> // (node) NodeJS.Immediate
  | ReturnType<typeof setTimeout>; // (DOM) number | (node) NodeJS.Timeout

/**
 * Schedules a function for invocation as soon as possible asynchronously.
 *
 * @param fn The function to invoke when called back.
 *
 * @param background Whether run if the document is hidden. Defaults to `false`.
 *
 * @returns A handle that can be used to `unschedule` the `fn` if possible.
 *
 * #### Notes
 * The `background` argument is only relevant in the browser context. If set to
 * `true`, the function will be scheduled using `setTimeout` so that it executes
 * even when the document is in a background tab. If left `false`, the function
 * is scheduled using `requestAnimationFrame`, which is faster than `setTimeout`
 * but paused when the document is in a background tab.
 *
 * A client should not switch back and forth between the two modes if the order
 * of scheduled functions is important and when the ability to unschedule a
 * function is important.
 */
export function schedule(
  fn: () => unknown,
  background = false
): ScheduleHandle {
  if (BROWSER && background) {
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
 *
 * @param background The value when `handle` was scheduled. Defaults to `false`.
 */
export function unschedule(handle: ScheduleHandle, background = false): void {
  if (BROWSER && background) {
    return clearTimeout(handle as ReturnType<typeof setTimeout>);
  }
  if (BROWSER) {
    return cancelAnimationFrame(handle as number);
  }
  return clearImmediate(handle as ReturnType<typeof setImmediate>);
}
