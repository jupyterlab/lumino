// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
/**
 * @packageDocumentation
 * @module application
 */

import { CommandRegistry } from '@lumino/commands';

import {
  type IPlugin,
  PluginRegistry,
  PromiseDelegate,
  type Token
} from '@lumino/coreutils';

import { ContextMenu, Menu, Widget } from '@lumino/widgets';

// Export IPlugin for API backward compatibility
/**
 * @deprecated You should import it from @lumino/coreutils.
 */
export { type IPlugin };

/**
 * A class for creating pluggable applications.
 *
 * @typeParam T - The type of the application shell.
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
    this.pluginRegistry =
      options.pluginRegistry ?? new PluginRegistry<this>(options);
    this.pluginRegistry.application = this;

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
   * The list of all the deferred plugins.
   */
  get deferredPlugins(): string[] {
    return this.pluginRegistry.deferredPlugins;
  }

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
   * Activate all the deferred plugins.
   *
   * @returns A promise which will resolve when each plugin is activated
   * or rejects with an error if one cannot be activated.
   */
  async activateDeferredPlugins(): Promise<void> {
    await this.pluginRegistry.activatePlugins('defer');
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
    return this.pluginRegistry.activatePlugin(id);
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
    return this.pluginRegistry.deactivatePlugin(id);
  }

  /**
   * Deregister a plugin with the application.
   *
   * @param id - The ID of the plugin of interest.
   *
   * @param force - Whether to deregister the plugin even if it is active.
   */
  deregisterPlugin(id: string, force?: boolean): void {
    this.pluginRegistry.deregisterPlugin(id, force);
  }

  /**
   * Get a plugin description.
   *
   * @param id - The ID of the plugin of interest.
   *
   * @returns The plugin description.
   */
  getPluginDescription(id: string): string {
    return this.pluginRegistry.getPluginDescription(id);
  }

  /**
   * Test whether a plugin is registered with the application.
   *
   * @param id - The ID of the plugin of interest.
   *
   * @returns `true` if the plugin is registered, `false` otherwise.
   */
  hasPlugin(id: string): boolean {
    return this.pluginRegistry.hasPlugin(id);
  }

  /**
   * Test whether a plugin is activated with the application.
   *
   * @param id - The ID of the plugin of interest.
   *
   * @returns `true` if the plugin is activated, `false` otherwise.
   */
  isPluginActivated(id: string): boolean {
    return this.pluginRegistry.isPluginActivated(id);
  }

  /**
   * List the IDs of the plugins registered with the application.
   *
   * @returns A new array of the registered plugin IDs.
   */
  listPlugins(): string[] {
    return this.pluginRegistry.listPlugins();
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
    this.pluginRegistry.registerPlugin(plugin);
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
    this.pluginRegistry.registerPlugins(plugins);
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
    return this.pluginRegistry.resolveOptionalService<U>(token);
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
    return this.pluginRegistry.resolveRequiredService<U>(token);
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
  async start(options: Application.IStartOptions = {}): Promise<void> {
    // Return immediately if the application is already started.
    if (this._started) {
      return this._delegate.promise;
    }

    // Mark the application as started;
    this._started = true;

    this._bubblingKeydown = options.bubblingKeydown ?? false;

    // Parse the host ID for attaching the shell.
    const hostID = options.hostID ?? '';

    // Wait for the plugins to activate, then finalize startup.
    await this.pluginRegistry.activatePlugins('startUp', options);

    this.attachShell(hostID);
    this.addEventListeners();
    this._delegate.resolve();
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
      case 'keyup':
        this.evtKeyup(event as KeyboardEvent);
        break;
      case 'contextmenu':
        this.evtContextMenu(event as PointerEvent);
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
    document.addEventListener('keydown', this, !this._bubblingKeydown);
    document.addEventListener('keyup', this, !this._bubblingKeydown);
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
   * A method invoked on a document `'keyup'` event.
   *
   * #### Notes
   * The default implementation of this method invokes the key up
   * processing method of the application command registry.
   *
   * A subclass may reimplement this method as needed.
   */
  protected evtKeyup(event: KeyboardEvent): void {
    this.commands.processKeyupEvent(event);
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
  protected evtContextMenu(event: PointerEvent): void {
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

  /**
   * Application plugin registry.
   */
  protected pluginRegistry: PluginRegistry;
  private _delegate = new PromiseDelegate<void>();
  private _started = false;
  private _bubblingKeydown = false;
}

/**
 * The namespace for the `Application` class statics.
 */
export namespace Application {
  /**
   * An options object for creating an application.
   */
  export interface IOptions<T extends Widget> extends PluginRegistry.IOptions {
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

    /**
     * Application plugin registry.
     *
     * If defined the options related to the plugin registry will
     * be ignored.
     */
    pluginRegistry?: PluginRegistry;
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

    /**
     * Whether to capture keydown event at bubbling or capturing (default) phase for
     * keyboard shortcuts.
     *
     * @experimental
     */
    bubblingKeydown?: boolean;
  }
}
