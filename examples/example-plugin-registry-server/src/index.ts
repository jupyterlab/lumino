// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { PluginRegistry } from '@lumino/coreutils';

import greeter from './greeter';
import hello from './hello';
import { IApp } from './tokens';

/**
 * Run the Lumino `PluginRegistry` on the server.
 *
 */
async function main(): Promise<void> {
  const registry = new PluginRegistry<IApp>();
  registry.application = { log: message => console.log(message) };
  registry.registerPlugins([hello, greeter]);
  await registry.activatePlugins('startUp');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
