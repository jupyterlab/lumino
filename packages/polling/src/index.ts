// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { IDisposable } from '@lumino/disposable';

import { ISignal } from '@lumino/signaling';

export { Poll } from './poll';

export { Debouncer, RateLimiter, Throttler } from './ratelimiter';

/**
 * A readonly poll that calls an asynchronous function with each tick.
 *
 * @typeparam T - The resolved type of the factory's promises.
 *
 * @typeparam U - The rejected type of the factory's promises.
 *
 * @typeparam V - The type to extend the phases supported by a poll.
 */
export interface IPoll<T, U, V extends string> {
  /**
   * A signal emitted when the poll is disposed.
   */
  readonly disposed: ISignal<this, void>;

  /**
   * The polling frequency data.
   */
  readonly frequency: IPoll.Frequency;

  /**
   * Whether the poll is disposed.
   */
  readonly isDisposed: boolean;

  /**
   * The name of the poll.
   */
  readonly name: string;

  /**
   * The poll state, which is the content of the currently-scheduled poll tick.
   */
  readonly state: IPoll.State<T, U, V>;

  /**
   * A promise that resolves when the currently-scheduled tick completes.
   *
   * #### Notes
   * Usually this will resolve after `state.interval` milliseconds from
   * `state.timestamp`. It can resolve earlier if the user starts or refreshes the
   * poll, etc.
   */
  readonly tick: Promise<IPoll<T, U, V>>;

  /**
   * A signal emitted when the poll state changes, i.e., a new tick is scheduled.
   */
  readonly ticked: ISignal<IPoll<T, U, V>, IPoll.State<T, U, V>>;
}

/**
 * A namespace for `IPoll` types.
 */
export namespace IPoll {
  /**
   * The polling frequency parameters.
   *
   * #### Notes
   * We implement the "decorrelated jitter" strategy from
   * https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/.
   * Essentially, if consecutive retries are needed, we choose an integer:
   * `sleep = min(max, rand(interval, backoff * sleep))`
   * This ensures that the poll is never less than `interval`, and nicely
   * spreads out retries for consecutive tries. Over time, if (interval < max),
   * the random number will be above `max` about (1 - 1/backoff) of the time
   * (sleeping the `max`), and the rest of the time the sleep will be a random
   * number below `max`, decorrelating our trigger time from other pollers.
   */
  export type Frequency = {
    /**
     * Whether poll frequency backs off (boolean) or the backoff growth rate
     * (float > 1).
     *
     * #### Notes
     * If `true`, the default backoff growth rate is `3`.
     */
    readonly backoff: boolean | number;

    /**
     * The basic polling interval in milliseconds (integer).
     */
    readonly interval: number;

    /**
     * The maximum milliseconds (integer) between poll requests.
     */
    readonly max: number;
  };

  /**
   * The phase of the poll when the current tick was scheduled.
   *
   * @typeparam T - A type for any additional tick phases a poll supports.
   */
  export type Phase<T extends string> =
    | T
    | 'constructed'
    | 'disposed'
    | 'reconnected'
    | 'refreshed'
    | 'rejected'
    | 'resolved'
    | 'standby'
    | 'started'
    | 'stopped';

  /**
   * Definition of poll state at any given time.
   *
   * @typeparam T - The resolved type of the factory's promises.
   *
   * @typeparam U - The rejected type of the factory's promises.
   *
   * @typeparam V - The type to extend the phases supported by a poll.
   */
  export type State<T, U, V extends string> = {
    /**
     * The number of milliseconds until the current tick resolves.
     */
    readonly interval: number;

    /**
     * The payload of the last poll resolution or rejection.
     *
     * #### Notes
     * The payload is `null` unless the `phase` is `'reconnected`, `'resolved'`,
     * or `'rejected'`. Its type is `T` for resolutions and `U` for rejections.
     */
    readonly payload: T | U | null;

    /**
     * The current poll phase.
     */
    readonly phase: Phase<V>;

    /**
     * The timestamp for when this tick was scheduled.
     */
    readonly timestamp: number;
  };
}

/**
 * A function whose invocations are rate limited and can be stopped after
 * invocation before it has fired.
 *
 * @typeparam T - The resolved type of the underlying function. Defaults to any.
 *
 * @typeparam U - The rejected type of the underlying function. Defaults to any.
 *
 * @typeparam V - Arguments for the underlying function. Defaults to any[].
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface IRateLimiter<T = any, U = any, V extends any[] = any[]>
  extends IDisposable {
  /**
   * The rate limit in milliseconds.
   */
  readonly limit: number;

  /**
   * Invoke the rate limited function.
   */
  invoke(...args: V): Promise<T>;

  /**
   * Stop the function if it is mid-flight.
   */
  stop(): Promise<void>;
}
