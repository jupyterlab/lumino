// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
import { findIndex, topologicSort } from '@lumino/algorithm';

import { CommandRegistry } from '@lumino/commands';

import { PromiseDelegate, Token } from '@lumino/coreutils';

import { ContextMenu, Menu, Widget } from '@lumino/widgets';

/**
 * A user-defined application plugin.
 *
 * @typeparam T - The type for the application.
 *
 * @typeparam U - The service type, if the plugin `provides` one.
 *
 * #### Notes
 * Plugins are the foundation for building an extensible application.
 *
 * Plugins consume and provide "services", which are nothing more than
 * concrete implementations of interfaces and/or abstract types.
 *
 * Unlike regular imports and exports, which tie the service consumer
 * to a particular implementation of the service, plugins decouple the
 * service producer from the service consumer, allowing an application
 * to be easily customized by third parties in a type-safe fashion.
 */
export interface IPlugin<T extends Application, U> {
  /**
   * The human readable ID of the plugin.
   *
   * #### Notes
   * This must be unique within an application.
   */
  id: string;

  /**
   * Plugin description.
   *
   * #### Notes
   * This can be used to provide user documentation on the feature
   * brought by a plugin.
   */
  description?: string;

  /**
   * Whether the plugin should be activated on application start.
   *
   * #### Notes
   * The default is `false`.
   */
  autoStart?: boolean;

  /**
   * The types of required services for the plugin, if any.
   *
   * #### Notes
   * These tokens correspond to the services that are required by
   * the plugin for correct operation.
   *
   * When the plugin is activated, a concrete instance of each type
   * will be passed to the `activate()` function, in the order they
   * are specified in the `requires` array.
   */
  requires?: Token<any>[];

  /**
   * The types of optional services for the plugin, if any.
   *
   * #### Notes
   * These tokens correspond to the services that can be used by the
   * plugin if available, but are not necessarily required.
   *
   * The optional services will be passed to the `activate()` function
   * following all required services. If an optional service cannot be
   * resolved, `null` will be passed in its place.
   */
  optional?: Token<any>[];

  /**
   * The type of service provided by the plugin, if any.
   *
   * #### Notes
   * This token corresponds to the service exported by the plugin.
   *
   * When the plugin is activated, the return value of `activate()`
   * is used as the concrete instance of the type.
   */
  provides?: Token<U> | null;

  /**
   * A function invoked to activate the plugin.
   *
   * @param app - The application which owns the plugin.
   *
   * @param args - The services specified by the `requires` property.
   *
   * @returns The provided service, or a promise to the service.
   *
   * #### Notes
   * This function will be called whenever the plugin is manually
   * activated, or when another plugin being activated requires
   * the service it provides.
   *
   * This function will not be called unless all of its required
   * services can be fulfilled.
   */
  activate: (app: T, ...args: any[]) => U | Promise<U>;

  /**
   * A function invoked to deactivate the plugin.
   *
   * @param app - The application which owns the plugin.
   *
   * @param args - The services specified by the `requires` property.
   */
  deactivate?: ((app: T, ...args: Token<any>[]) => void | Promise<void>) | null;
}

/**
 * A class for creating pluggable applications.
 *
 * @typeparam T - The type of the application shell.
 *
 * #### Notes
 * The `Application` class is useful when creating large, complex
 * UI applications with the ability to be safely extended by third
 * party code via plugins.
 */
export class Application<T extends Widget = Widget> {
  /**
   * Construct a new application.
   *
   * @param options - The options for creating the application.
   */
  constructor(options: Application.IOptions<T>) {
    // Initialize the application state.
    this.commands = new CommandRegistry();
    this.contextMenu = new ContextMenu({
      commands: this.commands,
      renderer: options.contextMenuRenderer
    });
    this.shell = options.shell;
  }

  /**
   * The application command registry.
   */
  readonly commands: CommandRegistry;

  /**
   * The application context menu.
   */
  readonly contextMenu: ContextMenu;

  /**
   * The application shell widget.
   *
   * #### Notes
   * The shell widget is the root "container" widget for the entire
   * application. It will typically expose an API which allows the
   * application plugins to insert content in a variety of places.
   */
  readonly shell: T;

  /**
   * A promise which resolves after the application has started.
   *
   * #### Notes
   * This promise will resolve after the `start()` method is called,
   * when all the bootstrapping and shell mounting work is complete.
   */
  get started(): Promise<void> {
    return this._delegate.promise;
  }

  /**
   * Get a plugin description.
   *
   * @param id - The ID of the plugin of interest.
   *
   * @returns The plugin description.
   */
  getPluginDescription(id: string): string {
    const plugin = this._pluginMap[id];
    return plugin ? plugin.description || '' : '';
  }

  /**
   * Test whether a plugin is registered with the application.
   *
   * @param id - The ID of the plugin of interest.
   *
   * @returns `true` if the plugin is registered, `false` otherwise.
   */
  hasPlugin(id: string): boolean {
    return id in this._pluginMap;
  }

  /**
   * Test whether a plugin is activated with the application.
   *
   * @param id - The ID of the plugin of interest.
   *
   * @returns `true` if the plugin is activated, `false` otherwise.
   */
  isPluginActivated(id: string): boolean {
    const plugin = this._pluginMap[id];
    return plugin ? plugin.activated : false;
  }

  /**
   * List the IDs of the plugins registered with the application.
   *
   * @returns A new array of the registered plugin IDs.
   */
  listPlugins(): string[] {
    return Object.keys(this._pluginMap);
  }

  /**
   * Register a plugin with the application.
   *
   * @param plugin - The plugin to register.
   *
   * #### Notes
   * An error will be thrown if a plugin with the same ID is already
   * registered, or if the plugin has a circular dependency.
   *
   * If the plugin provides a service which has already been provided
   * by another plugin, the new service will override the old service.
   */
  registerPlugin(plugin: IPlugin<this, any>): void {
    // Throw an error if the plugin id is already registered.
    if (plugin.id in this._pluginMap) {
      throw new Error(`Plugin '${plugin.id}' is already registered.`);
    }

    // Create the normalized plugin data.
    const data = Private.createPluginData(plugin);

    // Ensure the plugin does not cause a cyclic dependency.
    Private.ensureNoCycle(data, this._pluginMap, this._serviceMap);

    // Add the service token to the service map.
    if (data.provides) {
      this._serviceMap.set(data.provides, data.id);
    }

    // Add the plugin to the plugin map.
    this._pluginMap[data.id] = data;
  }

  /**
   * Register multiple plugins with the application.
   *
   * @param plugins - The plugins to register.
   *
   * #### Notes
   * This calls `registerPlugin()` for each of the given plugins.
   */
  registerPlugins(plugins: IPlugin<this, any>[]): void {
    for (const plugin of plugins) {
      this.registerPlugin(plugin);
    }
  }

  /**
   * Deregister a plugin with the application.
   *
   * @param id - The ID of the plugin of interest.
   *
   * @param force - Whether to deregister the plugin even if it is active.
   */
  deregisterPlugin(id: string, force?: boolean): void {
    const plugin = this._pluginMap[id];
    if (!plugin) {
      return;
    }

    if (plugin.activated && !force) {
      throw new Error(`Plugin '${id}' is still active.`);
    }

    delete this._pluginMap[id];
  }

  /**
   * Activate the plugin with the given ID.
   *
   * @param id - The ID of the plugin of interest.
   *
   * @returns A promise which resolves when the plugin is activated
   *   or rejects with an error if it cannot be activated.
   */
  async activatePlugin(id: string): Promise<void> {
    // Reject the promise if the plugin is not registered.
    const plugin = this._pluginMap[id];
    if (!plugin) {
      return Promise.reject(new Error(`Plugin '${id}' is not registered.`));
    }

    // Resolve immediately if the plugin is already activated.
    if (plugin.activated) {
      return;
    }

    // Return the pending resolver promise if it exists.
    if (plugin.promise) {
      return plugin.promise;
    }

    // Resolve the required services for the plugin.
    const required = plugin.requires.map(t => this.resolveRequiredService(t));

    // Resolve the optional services for the plugin.
    const optional = plugin.optional.map(t => this.resolveOptionalService(t));

    // Setup the resolver promise for the plugin.
    plugin.promise = Promise.all([...required, ...optional])
      .then(services => plugin!.activate.apply(undefined, [this, ...services]))
      .then(service => {
        plugin!.service = service;
        plugin!.activated = true;
        plugin!.promise = null;
      })
      .catch(error => {
        plugin!.promise = null;
        throw error;
      });

    // Return the pending resolver promise.
    return plugin.promise;
  }

  /**
   * Deactivate the plugin and its downstream dependents if and only if the
   * plugin and its dependents all support `deactivate`.
   *
   * @param id - The ID of the plugin of interest.
   *
   * @returns A list of IDs of downstream plugins deactivated with this one.
   */
  async deactivatePlugin(id: string): Promise<string[]> {
    // Reject the promise if the plugin is not registered.
    const plugin = this._pluginMap[id];
    if (!plugin) {
      throw new ReferenceError(`Plugin '${id}' is not registered.`);
    }

    // Bail early if the plugin is not activated.
    if (!plugin.activated) {
      return [];
    }

    // Check that this plugin can deactivate.
    if (!plugin.deactivate) {
      throw new TypeError(`Plugin '${id}'#deactivate() method missing`);
    }

    // Find the optimal deactivation order for plugins downstream of this one.
    const manifest = Private.findDependents(
      id,
      this._pluginMap,
      this._serviceMap
    );
    const downstream = manifest.map(id => this._pluginMap[id]!);

    // Check that all downstream plugins can deactivate.
    for (const plugin of downstream) {
      if (!plugin.deactivate) {
        throw new TypeError(
          `Plugin ${plugin.id}#deactivate() method missing (depends on ${id})`
        );
      }
    }

    // Deactivate all downstream plugins.
    for (const plugin of downstream) {
      const services = [...plugin.requires, ...plugin.optional].map(service => {
        const id = this._serviceMap.get(service);
        return id ? this._pluginMap[id]!.service : null;
      });

      // Await deactivation so the next plugins only receive active services.
      await plugin.deactivate!(this, ...services);
      plugin.service = null;
      plugin.activated = false;
    }

    // Remove plugin ID and return manifest of deactivated plugins.
    manifest.pop();
    return manifest;
  }

  /**
   * Resolve a required service of a given type.
   *
   * @param token - The token for the service type of interest.
   *
   * @returns A promise which resolves to an instance of the requested
   *   service, or rejects with an error if it cannot be resolved.
   *
   * #### Notes
   * Services are singletons. The same instance will be returned each
   * time a given service token is resolved.
   *
   * If the plugin which provides the service has not been activated,
   * resolving the service will automatically activate the plugin.
   *
   * User code will not typically call this method directly. Instead,
   * the required services for the user's plugins will be resolved
   * automatically when the plugin is activated.
   */
  async resolveRequiredService<U>(token: Token<U>): Promise<U> {
    // Reject the promise if there is no provider for the type.
    const id = this._serviceMap.get(token);
    if (!id) {
      return Promise.reject(new Error(`No provider for: ${token.name}.`));
    }

    // Activate the plugin if necessary.
    const plugin = this._pluginMap[id]!;
    if (!plugin.activated) {
      await this.activatePlugin(id);
    }

    return plugin.service;
  }

  /**
   * Resolve an optional service of a given type.
   *
   * @param token - The token for the service type of interest.
   *
   * @returns A promise which resolves to an instance of the requested
   *   service, or `null` if it cannot be resolved.
   *
   * #### Notes
   * Services are singletons. The same instance will be returned each
   * time a given service token is resolved.
   *
   * If the plugin which provides the service has not been activated,
   * resolving the service will automatically activate the plugin.
   *
   * User code will not typically call this method directly. Instead,
   * the optional services for the user's plugins will be resolved
   * automatically when the plugin is activated.
   */
  async resolveOptionalService<U>(token: Token<U>): Promise<U | null> {
    // Resolve with `null` if there is no provider for the type.
    const id = this._serviceMap.get(token);
    if (!id) {
      return null;
    }

    // Activate the plugin if necessary.
    const plugin = this._pluginMap[id]!;
    if (!plugin.activated) {
      try {
        await this.activatePlugin(id);
      } catch (reason) {
        console.error(reason);
        return null;
      }
    }

    return plugin.service;
  }

  /**
   * Start the application.
   *
   * @param options - The options for starting the application.
   *
   * @returns A promise which resolves when all bootstrapping work
   *   is complete and the shell is mounted to the DOM.
   *
   * #### Notes
   * This should be called once by the application creator after all
   * initial plugins have been registered.
   *
   * If a plugin fails to the load, the error will be logged and the
   * other valid plugins will continue to be loaded.
   *
   * Bootstrapping the application consists of the following steps:
   * 1. Activate the startup plugins
   * 2. Wait for those plugins to activate
   * 3. Attach the shell widget to the DOM
   * 4. Add the application event listeners
   */
  start(options: Application.IStartOptions = {}): Promise<void> {
    // Return immediately if the application is already started.
    if (this._started) {
      return this._delegate.promise;
    }

    // Mark the application as started;
    this._started = true;

    // Parse the host ID for attaching the shell.
    const hostID = options.hostID || '';

    // Collect the ids of the startup plugins.
    const startups = Private.collectStartupPlugins(this._pluginMap, options);

    // Generate the activation promises.
    const promises = startups.map(id => {
      return this.activatePlugin(id).catch(error => {
        console.error(`Plugin '${id}' failed to activate.`);
        console.error(error);
      });
    });

    // Wait for the plugins to activate, then finalize startup.
    Promise.all(promises).then(() => {
      this.attachShell(hostID);
      this.addEventListeners();
      this._delegate.resolve(undefined);
    });

    // Return the pending delegate promise.
    return this._delegate.promise;
  }

  /**
   * Handle the DOM events for the application.
   *
   * @param event - The DOM event sent to the application.
   *
   * #### Notes
   * This method implements the DOM `EventListener` interface and is
   * called in response to events registered for the application. It
   * should not be called directly by user code.
   */
  handleEvent(event: Event): void {
    switch (event.type) {
      case 'resize':
        this.evtResize(event);
        break;
      case 'keydown':
        this.evtKeydown(event as KeyboardEvent);
        break;
      case 'contextmenu':
        this.evtContextMenu(event as MouseEvent);
        break;
    }
  }

  /**
   * Attach the application shell to the DOM.
   *
   * @param id - The ID of the host node for the shell, or `''`.
   *
   * #### Notes
   * If the ID is not provided, the document body will be the host.
   *
   * A subclass may reimplement this method as needed.
   */
  protected attachShell(id: string): void {
    Widget.attach(
      this.shell,
      (id && document.getElementById(id)) || document.body
    );
  }

  /**
   * Add the application event listeners.
   *
   * #### Notes
   * The default implementation of this method adds listeners for
   * `'keydown'` and `'resize'` events.
   *
   * A subclass may reimplement this method as needed.
   */
  protected addEventListeners(): void {
    document.addEventListener('contextmenu', this);
    document.addEventListener('keydown', this, true);
    window.addEventListener('resize', this);
  }

  /**
   * A method invoked on a document `'keydown'` event.
   *
   * #### Notes
   * The default implementation of this method invokes the key down
   * processing method of the application command registry.
   *
   * A subclass may reimplement this method as needed.
   */
  protected evtKeydown(event: KeyboardEvent): void {
    this.commands.processKeydownEvent(event);
  }

  /**
   * A method invoked on a document `'contextmenu'` event.
   *
   * #### Notes
   * The default implementation of this method opens the application
   * `contextMenu` at the current mouse position.
   *
   * If the application context menu has no matching content *or* if
   * the shift key is pressed, the default browser context menu will
   * be opened instead.
   *
   * A subclass may reimplement this method as needed.
   */
  protected evtContextMenu(event: MouseEvent): void {
    if (event.shiftKey) {
      return;
    }
    if (this.contextMenu.open(event)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  /**
   * A method invoked on a window `'resize'` event.
   *
   * #### Notes
   * The default implementation of this method updates the shell.
   *
   * A subclass may reimplement this method as needed.
   */
  protected evtResize(event: Event): void {
    this.shell.update();
  }

  private _started = false;
  private _pluginMap = Private.createPluginMap();
  private _serviceMap = Private.createServiceMap();
  private _delegate = new PromiseDelegate<void>();
}

/**
 * The namespace for the `Application` class statics.
 */
export namespace Application {
  /**
   * An options object for creating an application.
   */
  export interface IOptions<T extends Widget> {
    /**
     * The shell widget to use for the application.
     *
     * This should be a newly created and initialized widget.
     *
     * The application will attach the widget to the DOM.
     */
    shell: T;

    /**
     * A custom renderer for the context menu.
     */
    contextMenuRenderer?: Menu.IRenderer;
  }

  /**
   * An options object for application startup.
   */
  export interface IStartOptions {
    /**
     * The ID of the DOM node to host the application shell.
     *
     * #### Notes
     * If this is not provided, the document body will be the host.
     */
    hostID?: string;

    /**
     * The plugins to activate on startup.
     *
     * #### Notes
     * These will be *in addition* to any `autoStart` plugins.
     */
    startPlugins?: string[];

    /**
     * The plugins to **not** activate on startup.
     *
     * #### Notes
     * This will override `startPlugins` and any `autoStart` plugins.
     */
    ignorePlugins?: string[];
  }
}

/**
 * The namespace for the module implementation details.
 */
namespace Private {
  /**
   * An object which holds the full application state for a plugin.
   */
  export interface IPluginData {
    /**
     * The human readable ID of the plugin.
     */
    readonly id: string;

    /**
     * The description of the plugin.
     */
    readonly description: string;

    /**
     * Whether the plugin should be activated on application start.
     */
    readonly autoStart: boolean;

    /**
     * The types of required services for the plugin, or `[]`.
     */
    readonly requires: Token<any>[];

    /**
     * The types of optional services for the the plugin, or `[]`.
     */
    readonly optional: Token<any>[];

    /**
     * The type of service provided by the plugin, or `null`.
     */
    readonly provides: Token<any> | null;

    /**
     * The function which activates the plugin.
     */
    readonly activate: (app: any, ...args: any[]) => any;

    /**
     * The optional function which deactivates the plugin.
     */
    readonly deactivate:
      | ((app: Application, ...args: any[]) => void | Promise<void>)
      | null;

    /**
     * Whether the plugin has been activated.
     */
    activated: boolean;

    /**
     * The resolved service for the plugin, or `null`.
     */
    service: any | null;

    /**
     * The pending resolver promise, or `null`.
     */
    promise: Promise<void> | null;
  }

  /**
   * A type alias for a mapping of plugin id to plugin data.
   */
  export type PluginMap = { [id: string]: IPluginData };

  /**
   * A type alias for a mapping of service token to plugin id.
   */
  export type ServiceMap = Map<Token<any>, string>;

  /**
   * Create a new plugin map.
   */
  export function createPluginMap(): PluginMap {
    return Object.create(null);
  }

  /**
   * Create a new service map.
   */
  export function createServiceMap(): ServiceMap {
    return new Map<Token<any>, string>();
  }

  /**
   * Create a normalized plugin data object for the given plugin.
   */
  export function createPluginData(plugin: IPlugin<any, any>): IPluginData {
    return {
      id: plugin.id,
      description: plugin.description || '',
      service: null,
      promise: null,
      activated: false,
      activate: plugin.activate,
      deactivate: plugin.deactivate || null,
      provides: plugin.provides || null,
      autoStart: plugin.autoStart || false,
      requires: plugin.requires ? plugin.requires.slice() : [],
      optional: plugin.optional ? plugin.optional.slice() : []
    };
  }

  /**
   * Ensure no cycle is present in the plugin resolution graph.
   *
   * If a cycle is detected, an error will be thrown.
   */
  export function ensureNoCycle(
    plugin: IPluginData,
    plugins: PluginMap,
    services: ServiceMap
  ): void {
    const dependencies = [...plugin.requires, ...plugin.optional];
    const visit = (token: Token<any>): boolean => {
      if (token === plugin.provides) {
        return true;
      }
      const id = services.get(token);
      if (!id) {
        return false;
      }
      const visited = plugins[id]!;
      const dependencies = [...visited.requires, ...visited.optional];
      if (dependencies.length === 0) {
        return false;
      }
      trace.push(id);
      if (dependencies.some(visit)) {
        return true;
      }
      trace.pop();
      return false;
    };

    // Bail early if there cannot be a cycle.
    if (!plugin.provides || dependencies.length === 0) {
      return;
    }

    // Setup a stack to trace service resolution.
    const trace = [plugin.id];

    // Throw an exception if a cycle is present.
    if (dependencies.some(visit)) {
      throw new Error(`Cycle detected: ${trace.join(' -> ')}.`);
    }
  }

  /**
   * Find dependents in deactivation order.
   *
   * @param id - The ID of the plugin of interest.
   *
   * @param plugins - The map containing all plugins.
   *
   * @param services - The map containing all services.
   *
   * @returns A list of dependent plugin IDs in order of deactivation
   *
   * #### Notes
   * The final item of the returned list is always the plugin of interest.
   */
  export function findDependents(
    id: string,
    plugins: PluginMap,
    services: ServiceMap
  ): string[] {
    const edges = new Array<[string, string]>();
    const add = (id: string): void => {
      const plugin = plugins[id]!;
      // FIXME In the case of missing optional dependencies, we may consider
      // deactivating and reactivating the plugin without the missing service.
      const dependencies = [...plugin.requires, ...plugin.optional];
      edges.push(
        ...dependencies.reduce<[string, string][]>((acc, dep) => {
          const service = services.get(dep);
          if (service) {
            // An edge is oriented from dependent to provider.
            acc.push([id, service]);
          }
          return acc;
        }, [])
      );
    };

    for (const id in plugins) {
      add(id);
    }

    // Filter edges
    // - Get all packages that dependent on the package to be deactivated
    const newEdges = edges.filter(edge => edge[1] === id);
    let oldSize = 0;
    while (newEdges.length > oldSize) {
      const previousSize = newEdges.length;
      // Get all packages that dependent on packages that will be deactivated
      const packagesOfInterest = newEdges
        .map(edge => edge[0])
        .reduce<string[]>((agg, value) => {
          if (agg.indexOf(value) == -1) {
            agg.push(value);
          }
          return agg;
        }, []);
      for (const poi of packagesOfInterest) {
        edges
          .filter(edge => edge[1] === poi)
          .forEach(edge => {
            // We check it is not already included to deal with circular dependencies
            if (newEdges.indexOf(edge) == -1) {
              newEdges.push(edge);
            }
          });
      }
      oldSize = previousSize;
    }

    const sorted = topologicSort(newEdges);
    const index = findIndex(sorted, candidate => candidate === id);

    if (index === -1) {
      return [id];
    }

    return sorted.slice(0, index + 1);
  }

  /**
   * Collect the IDs of the plugins to activate on startup.
   */
  export function collectStartupPlugins(
    pluginMap: PluginMap,
    options: Application.IStartOptions
  ): string[] {
    // Create a map to hold the plugin IDs.
    const collection = new Map<string, boolean>();

    // Collect the auto-start plugins.
    for (const id in pluginMap) {
      if (pluginMap[id].autoStart) {
        collection.set(id, true);
      }
    }

    // Add the startup plugins.
    if (options.startPlugins) {
      for (const id of options.startPlugins) {
        collection.set(id, true);
      }
    }

    // Remove the ignored plugins.
    if (options.ignorePlugins) {
      for (const id of options.ignorePlugins) {
        collection.delete(id);
      }
    }

    // Return the collected startup plugins.
    return Array.from(collection.keys());
  }
}
