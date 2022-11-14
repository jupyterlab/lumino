// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { CommandRegistry } from '@lumino/commands';
import { Menu, MenuBar, PanelLayout, Widget } from '@lumino/widgets';

import '../style/index.css';

class Application extends Widget {
  constructor() {
    super({ tag: 'main' });
  }
}

class SkipLink extends Widget {
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

class Article extends Widget {
  static createNode(): HTMLElement {
    const node = document.createElement('div');
    node.setAttribute('id', 'content');
    node.setAttribute('tabindex', '-1');
    const h1 = document.createElement('h1');
    h1.innerHTML = 'Menubar Example';
    node.appendChild(h1);
    const label = document.createElement('label');
    label.appendChild(
      document.createTextNode('A textarea to demonstrate the tab handling.')
    );
    const textarea = document.createElement('textarea');
    textarea.setAttribute('autocomplete', 'off');
    label.appendChild(textarea);
    node.appendChild(label);
    return node;
  }

  constructor() {
    super({ node: Article.createNode() });
  }
}

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

function main(): void {
  const app = new Application();
  const appLayout = new PanelLayout();
  app.layout = appLayout;

  const skipLink = new SkipLink();
  appLayout.addWidget(skipLink);

  const menubar = new MenuBar();
  const commands = new CommandRegistry();

  const fileMenu = new Menu({ commands: commands });
  fileMenu.title.label = 'File';
  addMenuItem(commands, fileMenu, 'new', 'New', 'File > New');
  addMenuItem(commands, fileMenu, 'open', 'Open', 'File > Open');
  addMenuItem(commands, fileMenu, 'save', 'Save', 'File > Save');
  menubar.addMenu(fileMenu);

  const editMenu = new Menu({ commands: commands });
  editMenu.title.label = 'Edit';
  addMenuItem(commands, editMenu, 'cut', 'Cut', 'Edit > Cut');
  addMenuItem(commands, editMenu, 'copy', 'Copy', 'Edit > Copy');
  addMenuItem(commands, editMenu, 'paste', 'Paste', 'Edit > Paste');
  menubar.addMenu(editMenu);
  appLayout.addWidget(menubar);

  const article = new Article();
  appLayout.addWidget(article);

  Widget.attach(app, document.body);
}

window.onload = main;
