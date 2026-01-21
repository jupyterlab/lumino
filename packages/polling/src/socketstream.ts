// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { IDisposable } from '@lumino/disposable';

import { Signal, Stream } from '@lumino/signaling';

import { Poll } from '.';

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
   * Construct a new web socket stream.
   *
   * @param sender - The sender which owns the stream.
   *
   * @param connector - A factory that returns a new web socket connection.
   */
  constructor(
    sender: T,
    protected readonly connector: () => WebSocket
  ) {
    super(sender);
  }

  /**
   * Whether the stream is disposed.
   */
  get isDisposed() {
    return this.connection.isDisposed;
  }

  /**
   * Dispose the stream.
   */
  dispose() {
    const { connection, socket } = this;
    connection.dispose();
    if (socket) {
      socket.onclose = null;
      socket.onerror = null;
      socket.onmessage = null;
      socket.onopen = null;
      socket.close();
    }
    this.socket = null;
    Signal.clearData(this);
    super.stop();
  }

  /**
   * Send a message via the underlying web socket.
   *
   * @param data - The payload of the message sent via the web socket.
   */
  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    if (this.isDisposed) {
      return;
    }
    this.socket!.send(data);
  }

  /**
   * A handle to the socket connection poll.
   */
  protected readonly connection = new Poll({ factory: () => this.reconnect() });

  /**
   * The current active socket. This value is updated by the `reconnect` method.
   */
  protected socket: WebSocket | null = null;

  /**
   * (Re)open a web socket connection and subscribe to its updates.
   *
   * @returns A promise that rejects when the socket connection is closed.
   */
  protected async reconnect(): Promise<void> {
    if (this.isDisposed) {
      return;
    }
    return new Promise((_, reject) => {
      this.socket = this.connector();
      this.socket.onclose = () => reject(new Error('socket stream has closed'));
      this.socket.onmessage = ({ data }) => data && this.emit(JSON.parse(data));
    });
  }
}
