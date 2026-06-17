// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import type { IPlugin } from '@lumino/coreutils';

import { IApp, IGreeting } from './tokens';

/**
 * A plugin that *provides* the `IGreeting` service.
 *
 */
const plugin: IPlugin<IApp, IGreeting> = {
  id: '@lumino/example-plugin-registry-server:hello',
  autoStart: true,
  provides: IGreeting,
  activate: (app: IApp): IGreeting => {
    app.log('[hello] providing IGreeting');
    return {
      greet: (name: string) => `Hello, ${name}! (from the hello plugin)`
    };
  }
};

export default plugin;
