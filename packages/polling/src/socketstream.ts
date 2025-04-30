// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { IDisposable } from '@lumino/disposable';

import { Signal, Stream } from '@lumino/signaling';

import { Poll } from './poll';

/**
 * A utility class to wrap and augment a web socket. A socket stream emits web
 * socket messages as an async iterable and also as a Lumino signal. It uses
 * an internal poll instance to manage reconnection logic automatically.
 *
 * @typeparam T - The type of the stream owner (i.e., the `sender` of a signal).
 *
 * @typeparam U - The type of the socket stream's emissions.
 */
export class SocketStream<T, U> extends Stream<T, U> implements IDisposable {
  /**
   * Construct a new socket stream.
   *
   * @param sender - The sender which owns the stream.
   *
   * @param options = The socket stream instantiation options.
   */
  constructor(sender: T, options: SocketStream.IOptions) {
    super(sender);
    this.factory = () => new (options.WebSocket || WebSocket)(options.url);
    this.subscription = new Poll({ factory: () => this.subscribe() });
  }

  /**
   * Whether the stream is disposed.
   */
  get isDisposed() {
    return this.subscription.isDisposed;
  }

  /**
   * Dispose the stream.
   */
  dispose() {
    super.stop();
    this.subscription.dispose();
    const { socket } = this;
    if (socket) {
      this.socket = null;
      socket.onclose = () => undefined;
      socket.onerror = () => undefined;
      socket.onmessage = () => undefined;
      socket.onopen = () => undefined;
      socket.close();
    }
    Signal.clearData(this);
  }

  /**
   * Send a message to the underlying web socket.
   *
   * @param data - The payload of the message sent via the web socket.
   */
  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    this.socket?.send(data);
  }

  /**
   * A factory that generates a new web socket instance for subscription.
   */
  protected readonly factory: () => WebSocket;

  /**
   * The current active socket. This value is updated by the `subscribe` method.
   */
  protected socket: WebSocket | null = null;

  /**
   * The poll instance that mediates the web socket lifecycle.
   */
  protected readonly subscription: Poll;

  /**
   * Open a web socket and subscribe to its updates.
   *
   * @returns A promise that rejects when the socket connection is closed.
   */
  protected async subscribe(): Promise<void> {
    if (this.isDisposed) {
      return;
    }
    return new Promise<void>((_, reject) => {
      this.socket = this.factory();
      this.socket.onclose = () => reject(new Error('socket stream has closed'));
      this.socket.onmessage = ({ data }) => data && this.emit(JSON.parse(data));
    });
  }
}

/**
 * A namespace for `SocketStream` statics.
 */
export namespace SocketStream {
  /**
   * Instantiation options for a socket stream.
   */
  export interface IOptions {
    /**
     * The web socket URL to open.
     */
    url: string;

    /**
     * An optional web socket constructor.
     */
    WebSocket?: typeof WebSocket;
  }
}
