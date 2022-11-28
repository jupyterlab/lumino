// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { CommandRegistry } from '@lumino/commands';
import { Menu, MenuBar, PanelLayout, Widget } from '@lumino/widgets';

import '../style/index.css';

/**
 * Wrapper widget containing the example application.
 */
class Application extends Widget {
  constructor() {
    super({ tag: 'main' });
  }
}

/**
 * Skip link to jump to the main content.
 */
class SkipLink extends Widget {
  /**
   * Create a HTMLElement that statically links to "#content".
   */
  static createNode(): HTMLElement {
    const node = document.createElement('a');
    node.setAttribute('href', '#content');
    node.innerHTML = 'Skip to the main content';
    node.classList.add('lm-example-skip-link');
    return node;
  }

  constructor() {
    super({ node: SkipLink.createNode() });
  }
}

/**
 * A Widget containing some content to provide context example.
 */
class Article extends Widget {
  /**
   * Create the content structure.
   */
  static createNode(): HTMLElement {
    const node = document.createElement('div');
    node.setAttribute('id', 'content');
    node.setAttribute('tabindex', '-1');
    const h1 = document.createElement('h1');
    h1.innerHTML = 'MenuBar Example';
    node.appendChild(h1);
    const button = document.createElement('button');
    button.innerHTML = 'A button you can tab to out of the menubar';
    node.appendChild(button);
    return node;
  }

  constructor() {
    super({ node: Article.createNode() });
  }
}

/**
 * Helper Function to add menu items.
 */
function addMenuItem(
  commands: CommandRegistry,
  menu: Menu,
  command: string,
  label: string,
  log: string
): void {
  commands.addCommand(command, {
    label: label,
    execute: () => {
      console.log(log);
    }
  });
  menu.addItem({
    type: 'command',
    command: command
  });
}

/**
 * Create the MenuBar example application.
 */
function main(): void {
  const app = new Application();
  const appLayout = new PanelLayout();
  app.layout = appLayout;

  const skipLink = new SkipLink();

  const menubar = new MenuBar();
  const commands = new CommandRegistry();

  const fileMenu = new Menu({ commands: commands });
  fileMenu.title.label = 'File';
  addMenuItem(commands, fileMenu, 'new', 'New', 'File > New');
  addMenuItem(commands, fileMenu, 'open', 'Open', 'File > Open');
  addMenuItem(commands, fileMenu, 'save', 'Save', 'File > Save');

  const recentMenu = new Menu({ commands: commands });
  recentMenu.title.label = 'Open Recent';
  addMenuItem(
    commands,
    recentMenu,
    'file1',
    'File1.txt',
    'File > Open Recent > File1.txt'
  );
  addMenuItem(
    commands,
    recentMenu,
    'file2',
    'File2.md',
    'File > Open Recent > File2.md'
  );
  addMenuItem(
    commands,
    recentMenu,
    'file3',
    'File3.xml',
    'File > Open Recent > File3.xml'
  );
  addMenuItem(
    commands,
    recentMenu,
    'file4',
    'File4.txt',
    'File > Open Recent > File4.txt'
  );
  fileMenu.addItem({
    type: 'submenu',
    submenu: recentMenu
  });

  menubar.addMenu(fileMenu);

  const editMenu = new Menu({ commands: commands });
  editMenu.title.label = 'Edit';
  addMenuItem(commands, editMenu, 'cut', 'Cut', 'Edit > Cut');
  addMenuItem(commands, editMenu, 'copy', 'Copy', 'Edit > Copy');
  addMenuItem(commands, editMenu, 'paste', 'Paste', 'Edit > Paste');
  menubar.addMenu(editMenu);

  const article = new Article();

  appLayout.addWidget(skipLink);
  appLayout.addWidget(menubar);
  appLayout.addWidget(article);

  Widget.attach(app, document.body);
}

window.onload = main;
