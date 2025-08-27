/* eslint-disable @typescript-eslint/no-empty-function */
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
import { CommandRegistry } from '@lumino/commands';

import { Message, MessageLoop } from '@lumino/messaging';

import {
  BoxPanel,
  CommandPalette,
  ContextMenu,
  DockPanel,
  Menu,
  MenuBar,
  TabBar,
  Widget
} from '@lumino/widgets';

import '../style/index.css';

const commands = new CommandRegistry();

function createMenu(): Menu {
  let sub1 = new Menu({ commands });
  sub1.title.label = 'More...';
  sub1.title.mnemonic = 0;
  sub1.addItem({ command: 'example:one' });
  sub1.addItem({ command: 'example:two' });
  sub1.addItem({ command: 'example:three' });
  sub1.addItem({ command: 'example:four' });

  let sub2 = new Menu({ commands });
  sub2.title.label = 'More...';
  sub2.title.mnemonic = 0;
  sub2.addItem({ command: 'example:one' });
  sub2.addItem({ command: 'example:two' });
  sub2.addItem({ command: 'example:three' });
  sub2.addItem({ command: 'example:four' });
  sub2.addItem({ type: 'submenu', submenu: sub1 });

  let root = new Menu({ commands });
  root.addItem({ command: 'example:copy' });
  root.addItem({ command: 'example:cut' });
  root.addItem({ command: 'example:paste' });
  root.addItem({ type: 'separator' });
  root.addItem({ command: 'example:new-tab' });
  root.addItem({ command: 'example:close-tab' });
  root.addItem({ command: 'example:save-on-exit' });
  root.addItem({ type: 'separator' });
  root.addItem({ command: 'example:open-task-manager' });
  root.addItem({ type: 'separator' });
  root.addItem({ type: 'submenu', submenu: sub2 });
  root.addItem({ type: 'separator' });
  root.addItem({ command: 'example:close' });

  return root;
}

class ContentWidget extends Widget {
  static menuFocus: ContentWidget | null;

  static createNode(): HTMLElement {
    let node = document.createElement('div');
    let content = document.createElement('div');
    let input = document.createElement('input');
    input.placeholder = 'Placeholder...';
    content.appendChild(input);
    node.appendChild(content);
    return node;
  }

  constructor(name: string) {
    super({ node: ContentWidget.createNode() });
    this.setFlag(Widget.Flag.DisallowLayout);
    this.addClass('content');
    this.addClass(name.toLowerCase());
    this.title.label = name;
    this.title.closable = true;
    this.title.caption = `Long description for: ${name}`;
    let widget = this;
    this.node.addEventListener('contextmenu', (event: MouseEvent) => {
      ContentWidget.menuFocus = widget;
    });
  }

  get inputNode(): HTMLInputElement {
    return this.node.getElementsByTagName('input')[0] as HTMLInputElement;
  }

  protected onActivateRequest(msg: Message): void {
    if (this.isAttached) {
      this.inputNode.focus();
    }
  }

  protected onBeforeDetach(msg: Message): void {
    if (ContentWidget.menuFocus === this) {
      ContentWidget.menuFocus = null;
    }
  }
}

function main(): void {
  commands.addCommand('example:cut', {
    label: 'Cut',
    mnemonic: 1,
    iconClass: 'fa fa-cut',
    execute: () => {
      console.log('Cut');
    }
  });

  commands.addCommand('example:copy', {
    label: 'Copy File',
    mnemonic: 0,
    iconClass: 'fa fa-copy',
    execute: () => {
      console.log('Copy');
    }
  });

  commands.addCommand('example:paste', {
    label: 'Paste',
    mnemonic: 0,
    iconClass: 'fa fa-paste',
    execute: () => {
      console.log('Paste');
    }
  });

  commands.addCommand('example:new-tab', {
    label: 'New Tab',
    mnemonic: 0,
    caption: 'Open a new tab',
    execute: () => {
      console.log('New Tab');
    }
  });

  commands.addCommand('example:close-tab', {
    label: 'Close Tab',
    mnemonic: 2,
    caption: 'Close the current tab',
    execute: () => {
      console.log('Close Tab');
    }
  });

  commands.addCommand('example:save-on-exit', {
    label: 'Save on Exit',
    mnemonic: 0,
    caption: 'Toggle the save on exit flag',
    execute: () => {
      console.log('Save on Exit');
    }
  });

  commands.addCommand('example:open-task-manager', {
    label: 'Task Manager',
    mnemonic: 5,
    isEnabled: () => false,
    execute: () => {}
  });

  commands.addCommand('example:close', {
    label: 'Close',
    mnemonic: 0,
    iconClass: 'fa fa-close',
    execute: () => {
      console.log('Close');
    }
  });

  commands.addCommand('example:one', {
    label: 'One',
    execute: () => {
      console.log('One');
    }
  });

  commands.addCommand('example:two', {
    label: 'Two',
    execute: () => {
      console.log('Two');
    }
  });

  commands.addCommand('example:three', {
    label: 'Three',
    execute: () => {
      console.log('Three');
    }
  });

  commands.addCommand('example:four', {
    label: 'Four',
    execute: () => {
      console.log('Four');
    }
  });

  commands.addCommand('example:black', {
    label: 'Black',
    execute: () => {
      console.log('Black');
    }
  });

  commands.addCommand('example:clear-cell', {
    label: 'Clear Cell',
    execute: () => {
      console.log('Clear Cell');
    }
  });

  commands.addCommand('example:cut-cells', {
    label: 'Cut Cell(s)',
    execute: () => {
      console.log('Cut Cell(s)');
    }
  });

  commands.addCommand('example:run-cell', {
    label: 'Run Cell',
    execute: () => {
      console.log('Run Cell');
    }
  });

  commands.addCommand('example:cell-test', {
    label: 'Cell Test',
    execute: () => {
      console.log('Cell Test');
    }
  });

  commands.addCommand('notebook:new', {
    label: 'New Notebook',
    execute: () => {
      console.log('New Notebook');
    }
  });

  commands.addKeyBinding({
    keys: ['Accel X'],
    selector: 'body',
    command: 'example:cut'
  });

  commands.addKeyBinding({
    keys: ['Accel C'],
    selector: 'body',
    command: 'example:copy'
  });

  commands.addKeyBinding({
    keys: ['Accel V'],
    selector: 'body',
    command: 'example:paste'
  });

  commands.addKeyBinding({
    keys: ['Accel J', 'Accel J'],
    selector: 'body',
    command: 'example:new-tab'
  });

  commands.addKeyBinding({
    keys: ['Accel M'],
    selector: 'body',
    command: 'example:open-task-manager'
  });

  let menu1 = createMenu();
  menu1.title.label = 'File';
  menu1.title.mnemonic = 0;

  let menu2 = createMenu();
  menu2.title.label = 'Edit';
  menu2.title.mnemonic = 0;

  let menu3 = createMenu();
  menu3.title.label = 'View';
  menu3.title.mnemonic = 0;

  let emptyMenu = new Menu({ commands });
  emptyMenu.title.label = 'Empty Menu';
  emptyMenu.title.mnemonic = 0;

  let bar = new MenuBar();
  bar.addMenu(menu1);
  bar.addMenu(menu2);
  bar.addMenu(menu3);
  bar.addMenu(emptyMenu);
  bar.id = 'menuBar';

  let palette = new CommandPalette({ commands });
  palette.addItem({ command: 'example:cut', category: 'Edit' });
  palette.addItem({ command: 'example:copy', category: 'Edit' });
  palette.addItem({ command: 'example:paste', category: 'Edit' });
  palette.addItem({ command: 'example:one', category: 'Number' });
  palette.addItem({ command: 'example:two', category: 'Number' });
  palette.addItem({ command: 'example:three', category: 'Number' });
  palette.addItem({ command: 'example:four', category: 'Number' });
  palette.addItem({ command: 'example:black', category: 'Number' });
  palette.addItem({ command: 'example:new-tab', category: 'File' });
  palette.addItem({ command: 'example:close-tab', category: 'File' });
  palette.addItem({ command: 'example:save-on-exit', category: 'File' });
  palette.addItem({ command: 'example:open-task-manager', category: 'File' });
  palette.addItem({ command: 'example:close', category: 'File' });
  palette.addItem({
    command: 'example:clear-cell',
    category: 'Notebook Cell Operations'
  });
  palette.addItem({
    command: 'example:cut-cells',
    category: 'Notebook Cell Operations'
  });
  palette.addItem({
    command: 'example:run-cell',
    category: 'Notebook Cell Operations'
  });
  palette.addItem({ command: 'example:cell-test', category: 'Console' });
  palette.addItem({ command: 'notebook:new', category: 'Notebook' });
  palette.id = 'palette';

  let contextMenu = new ContextMenu({ commands });

  document.addEventListener('contextmenu', (event: MouseEvent) => {
    if (event.shiftKey) return;
    if (contextMenu.open(event)) {
      event.preventDefault();
    }
  });

  contextMenu.addItem({ command: 'example:cut', selector: '.content' });
  contextMenu.addItem({ command: 'example:copy', selector: '.content' });
  contextMenu.addItem({ command: 'example:paste', selector: '.content' });

  contextMenu.addItem({
    command: 'example:one',
    selector: '.lm-CommandPalette'
  });
  contextMenu.addItem({
    command: 'example:two',
    selector: '.lm-CommandPalette'
  });
  contextMenu.addItem({
    command: 'example:three',
    selector: '.lm-CommandPalette'
  });
  contextMenu.addItem({
    command: 'example:four',
    selector: '.lm-CommandPalette'
  });
  contextMenu.addItem({
    command: 'example:black',
    selector: '.lm-CommandPalette'
  });

  contextMenu.addItem({
    command: 'notebook:new',
    selector: '.lm-CommandPalette-input'
  });
  contextMenu.addItem({
    command: 'example:save-on-exit',
    selector: '.lm-CommandPalette-input'
  });
  contextMenu.addItem({
    command: 'example:open-task-manager',
    selector: '.lm-CommandPalette-input'
  });
  contextMenu.addItem({
    type: 'separator',
    selector: '.lm-CommandPalette-input'
  });

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    commands.processKeydownEvent(event);
  });

  let r1 = new ContentWidget('Red');
  let b1 = new ContentWidget('Blue');
  let g1 = new ContentWidget('Green');
  let y1 = new ContentWidget('Yellow');

  let r2 = new ContentWidget('Red');
  let b2 = new ContentWidget('Blue');
  // let g2 = new ContentWidget('Green');
  // let y2 = new ContentWidget('Yellow');

  let dock = new DockPanel();
  dock.addWidget(r1);
  dock.addWidget(b1, { mode: 'split-right', ref: r1 });
  dock.addWidget(y1, { mode: 'split-bottom', ref: b1 });
  dock.addWidget(g1, { mode: 'split-left', ref: y1 });
  dock.addWidget(r2, { ref: b1 });
  dock.addWidget(b2, { mode: 'split-right', ref: y1 });
  dock.id = 'dock';

  dock.addRequested.connect((sender: DockPanel, arg: TabBar<Widget>) => {
    let w = new ContentWidget('Green');
    sender.addWidget(w, { ref: arg.titles[0].owner });
  });

  let doSplit = (mode: DockPanel.InsertMode) => {
    let ref = ContentWidget.menuFocus;
    if (ref) {
      let name = ref.title.label;
      let widget = new ContentWidget(name);
      widget.inputNode.value = `${name} ${mode}`;
      dock.addWidget(widget, { mode: mode, ref: ref });
    }
  };

  commands.addCommand('example:split-left', {
    label: 'Split left',
    execute: () => doSplit('split-left')
  });

  commands.addCommand('example:split-right', {
    label: 'Split right',
    execute: () => doSplit('split-right')
  });

  commands.addCommand('example:split-top', {
    label: 'Split top',
    execute: () => doSplit('split-top')
  });

  commands.addCommand('example:split-bottom', {
    label: 'Split bottom',
    execute: () => doSplit('split-bottom')
  });

  commands.addCommand('example:merge-left', {
    label: 'Merge left',
    execute: () => doSplit('merge-left')
  });

  commands.addCommand('example:merge-right', {
    label: 'Merge right',
    execute: () => doSplit('merge-right')
  });

  commands.addCommand('example:merge-top', {
    label: 'Merge top',
    execute: () => doSplit('merge-top')
  });

  commands.addCommand('example:merge-bottom', {
    label: 'Merge bottom',
    execute: () => doSplit('merge-bottom')
  });

  let savedLayouts: DockPanel.ILayoutConfig[] = [];

  commands.addCommand('example:add-button', {
    label: 'Toggle add button',
    mnemonic: 0,
    caption: 'Toggle add Button',
    execute: () => {
      dock.addButtonEnabled = !dock.addButtonEnabled;
      console.log('Toggle add button');
    }
  });

  contextMenu.addItem({ command: 'example:add-button', selector: '.content' });
  let contextSub1 = new Menu({ commands });
  contextSub1.title.label = 'Splitting';
  contextSub1.addItem({ command: 'example:split-left' });
  contextSub1.addItem({ command: 'example:split-right' });
  contextSub1.addItem({ command: 'example:split-top' });
  contextSub1.addItem({ command: 'example:split-bottom' });
  contextSub1.addItem({ type: 'separator' });
  contextSub1.addItem({ command: 'example:merge-left' });
  contextSub1.addItem({ command: 'example:merge-right' });
  contextSub1.addItem({ command: 'example:merge-top' });
  contextSub1.addItem({ command: 'example:merge-bottom' });
  contextMenu.addItem({
    type: 'submenu',
    submenu: contextSub1,
    selector: '.content'
  });

  commands.addCommand('save-dock-layout', {
    label: 'Save Layout',
    caption: 'Save the current dock layout',
    execute: () => {
      savedLayouts.push(dock.saveLayout());
      palette.addItem({
        command: 'restore-dock-layout',
        category: 'Dock Layout',
        args: { index: savedLayouts.length - 1 }
      });
    }
  });

  commands.addCommand('restore-dock-layout', {
    label: args => {
      return `Restore Layout ${args.index as number}`;
    },
    execute: args => {
      dock.restoreLayout(savedLayouts[args.index as number]);
    }
  });

  palette.addItem({
    command: 'save-dock-layout',
    category: 'Dock Layout',
    rank: 0
  });

  BoxPanel.setStretch(dock, 1);

  let main = new BoxPanel({ direction: 'left-to-right', spacing: 0 });
  main.id = 'main';
  main.addWidget(palette);
  main.addWidget(dock);

  window.onresize = () => {
    MessageLoop.postMessage(bar, new Widget.ResizeMessage(-1, -1));
    main.update();
  };

  Widget.attach(bar, document.body);
  Widget.attach(main, document.body);
}

window.onload = main;
