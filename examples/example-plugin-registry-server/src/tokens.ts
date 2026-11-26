// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { Token } from '@lumino/coreutils';

/**
 * The application object passed to every plugin's `activate()`.
 */
export interface IApp {
  /**
   * Log a message.
   */
  log(message: string): void;
}

/**
 * A service that one plugin provides and another consumes.
 */
export interface IGreeting {
  /**
   * Return a greeting.
   */
  greet(): string;
}

/**
 * The token used to provide and require the {@link IGreeting} service.
 *
 */
export const IGreeting = new Token<IGreeting>(
  '@lumino/example-plugin-registry-server:IGreeting'
);
