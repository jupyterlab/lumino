// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

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
  // Default accordion (existing behavior)
  const defaultAccordion = new AccordionPanel();
  defaultAccordion.id = 'accordion-default';

  const r1 = new ContentWidget('Red');
  const b1 = new ContentWidget('Blue');
  const g1 = new ContentWidget('Green');

  defaultAccordion.addWidget(r1);
  defaultAccordion.addWidget(b1);
  defaultAccordion.addWidget(g1);

  BoxPanel.setStretch(defaultAccordion, 1);

  // In-place collapse accordion (NEW behavior)
  const inPlacePanel = new AccordionPanel({
    collapseMode: 'in-place'
  });
  inPlacePanel.id = 'accordion-in-place';

  const y1 = new ContentWidget('Yellow');
  const p1 = new ContentWidget('Purple');
  const o1 = new ContentWidget('Orange');

  inPlacePanel.addWidget(y1);
  inPlacePanel.addWidget(p1);
  inPlacePanel.addWidget(o1);

  BoxPanel.setStretch(inPlacePanel, 1);

  // Main container
  const main = new BoxPanel({ direction: 'left-to-right', spacing: 0 });
  main.id = 'main';

  main.addWidget(defaultAccordion);
  main.addWidget(inPlacePanel);

  window.onresize = () => {
    main.update();
  };
  
  Widget.attach(main, document.body);
}

window.onload = main;
