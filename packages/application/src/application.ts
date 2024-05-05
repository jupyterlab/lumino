// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { CommandRegistry } from '@lumino/commands';

import { PromiseDelegate } from '@lumino/coreutils';

import { ContextMenu, Menu, Widget } from '@lumino/widgets';
import { PluginRegistry } from './plugins';

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
export class Application<T extends Widget = Widget> extends PluginRegistry {
  /**
   * Construct a new application.
   *
   * @param options - The options for creating the application.
   */
  constructor(options: Application.IOptions<T>) {
    super();
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
    await this.activatePlugins('startUp', options);

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

    /**
     * Whether to capture keydown event at bubbling or capturing (default) phase for
     * keyboard shortcuts.
     *
     * @experimental
     */
    bubblingKeydown?: boolean;
  }
}
