// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import 'es6-promise/auto'; // polyfill Promise on IE

import { Message } from '@lumino/messaging';

import { AccordionPanel, BoxPanel, Widget } from '@lumino/widgets';

import '../style/index.css';

class ContentWidget extends Widget {
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
  }

  get inputNode(): HTMLInputElement {
    return this.node.getElementsByTagName('input')[0] as HTMLInputElement;
  }

  protected onActivateRequest(msg: Message): void {
    if (this.isAttached) {
      this.inputNode.focus();
    }
  }
}

function main(): void {
  const accordion = new AccordionPanel();
  accordion.id = 'accordion';

  const r1 = new ContentWidget('Red');
  const b1 = new ContentWidget('Blue');
  const g1 = new ContentWidget('Green');

  accordion.addWidget(r1);
  accordion.addWidget(b1);
  accordion.addWidget(g1);

  BoxPanel.setStretch(accordion, 1);

  const main = new BoxPanel({ direction: 'left-to-right', spacing: 0 });
  main.id = 'main';
  main.addWidget(accordion);

  window.onresize = () => {
    main.update();
  };

  Widget.attach(main, document.body);
}

window.onload = main;
