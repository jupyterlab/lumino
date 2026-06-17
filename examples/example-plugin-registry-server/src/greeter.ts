// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import type { IPlugin } from '@lumino/coreutils';

import { IApp, IGreeting } from './tokens';

/**
 * A plugin that *requires* the `IGreeting` service.
 */
const plugin: IPlugin<IApp, void> = {
  id: '@lumino/example-plugin-registry-server:greeter',
  autoStart: true,
  requires: [IGreeting],
  activate: (app: IApp, greeting: IGreeting): void => {
    app.log(`[greeter] ${greeting.greet('Jupyter')}`);
  }
};

export default plugin;
