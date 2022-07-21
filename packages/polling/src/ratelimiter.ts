// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { PromiseDelegate } from '@lumino/coreutils';

import { IRateLimiter } from './index';

import { Poll } from './poll';

/**
 * A base class to implement rate limiters with different invocation strategies.
 *
 * @typeparam T - The resolved type of the underlying function.
 *
 * @typeparam U - The rejected type of the underlying function.
 *
 * @typeparam V - Arguments for the underlying function.
 */
export abstract class RateLimiter<T, U, V extends any[]>
  implements IRateLimiter<T, U, V> {
  /**
   * Instantiate a rate limiter.
   *
   * @param fn - The function to rate limit.
   *
   * @param limit - The rate limit; defaults to 500ms.
   */
  constructor(fn: (...args: V) => T | Promise<T>, limit = 500) {
    this.limit = limit;
    this.poll = new Poll({
      auto: false,
      factory: async () => {
        const { args } = this;
        this.args = undefined;
        return fn(...args!);
      },
      frequency: { backoff: false, interval: Poll.NEVER, max: Poll.NEVER },
      standby: 'never'
    });
    this.payload = new PromiseDelegate();
    this.poll.ticked.connect((_, state) => {
      const { payload } = this;

      if (state.phase === 'resolved') {
        this.payload = new PromiseDelegate();
        payload!.resolve(state.payload as T);
        return;
      }

      if (state.phase === 'rejected' || state.phase === 'stopped') {
        this.payload = new PromiseDelegate();
        payload!.promise.catch(_ => undefined);
        payload!.reject(state.payload as U);
        return;
      }
    }, this);
  }

  /**
   * Whether the rate limiter is disposed.
   */
  get isDisposed(): boolean {
    return this.payload === null;
  }

  /**
   * Disposes the rate limiter.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this.args = undefined;
    this.payload = null;
    this.poll.dispose();
  }

  /**
   * The rate limit in milliseconds.
   */
  readonly limit: number;

  /**
   * Invoke the rate limited function.
   */
  abstract invoke(...args: V): Promise<T>;

  /**
   * Stop the function if it is mid-flight.
   */
  async stop(): Promise<void> {
    return this.poll.stop();
  }

  /**
   * Arguments for the underlying function.
   */
  protected args: V | undefined = undefined;

  /**
   * A promise that resolves on each successful invocation.
   */
  protected payload: PromiseDelegate<T> | null = null;

  /**
   * The underlying poll instance used by the rate limiter.
   */
  protected poll: Poll<T, U, 'invoked'>;
}

/**
 * Wraps and debounces a function that can be called multiple times and only
 * executes the underlying function one `interval` after the last invocation.
 *
 * @typeparam T - The resolved type of the underlying function. Defaults to any.
 *
 * @typeparam U - The rejected type of the underlying function. Defaults to any.
 *
 * @typeparam V - Arguments for the underlying function. Defaults to any[].
 */
export class Debouncer<
  T = any,
  U = any,
  V extends any[] = any[]
> extends RateLimiter<T, U, V> {
  /**
   * Invokes the function and only executes after rate limit has elapsed.
   * Each invocation resets the timer.
   */
  invoke(...args: V): Promise<T> {
    this.args = args;
    void this.poll.schedule({ interval: this.limit, phase: 'invoked' });
    return this.payload!.promise;
  }
}

/**
 * Wraps and throttles a function that can be called multiple times and only
 * executes the underlying function once per `interval`.
 *
 * @typeparam T - The resolved type of the underlying function. Defaults to any.
 *
 * @typeparam U - The rejected type of the underlying function. Defaults to any.
 *
 * @typeparam V - Arguments for the underlying function. Defaults to any[].
 */
export class Throttler<
  T = any,
  U = any,
  V extends any[] = any[]
> extends RateLimiter<T, U, V> {
  /**
   * Instantiate a throttler.
   *
   * @param fn - The function being throttled.
   *
   * @param options - Throttling configuration or throttling limit in ms.
   *
   * #### Notes
   * The `edge` defaults to `leading`; the `limit` defaults to `500`.
   */
  constructor(
    fn: (...args: V) => T | Promise<T>,
    options?: Throttler.IOptions | number
  ) {
    super(fn, typeof options === 'number' ? options : options && options.limit);
    if (typeof options !== 'number' && options && options.edge === 'trailing') {
      this._trailing = true;
    }
    this._interval = this._trailing ? this.limit : Poll.IMMEDIATE;
  }

  /**
   * Throttles function invocations if one is currently in flight.
   */
  invoke(...args: V): Promise<T> {
    const idle = this.poll.state.phase !== 'invoked';
    if (idle || this._trailing) {
      this.args = args;
    }
    if (idle) {
      void this.poll.schedule({ interval: this._interval, phase: 'invoked' });
    }
    return this.payload!.promise;
  }

  private _interval: number;
  private _trailing = false;
}

/**
 * A namespace for `Throttler` interfaces.
 */
export namespace Throttler {
  /**
   * Instantiation options for a `Throttler`.
   */
  export interface IOptions {
    /**
     * The throttling limit; defaults to 500ms.
     */
    limit?: number;

    /**
     * Whether to invoke at the leading or trailing edge of throttle cycle.
     * Defaults to `leading`.
     */
    edge?: 'leading' | 'trailing';
  }
}
