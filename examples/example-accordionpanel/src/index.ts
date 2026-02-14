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
  // Default accordion with 'last-open' behavior (original)
  const accordionDefault = new AccordionPanel();
  accordionDefault.id = 'accordion-default';

  const r1 = new ContentWidget('Red');
  const b1 = new ContentWidget('Blue');
  const g1 = new ContentWidget('Green');

  accordionDefault.addWidget(r1);
  accordionDefault.addWidget(b1);
  accordionDefault.addWidget(g1);

  BoxPanel.setStretch(accordionDefault, 1);

  // New accordion with 'in-place' collapse mode
  const accordionInPlace = new AccordionPanel({
    collapseMode: 'in-place' // NEW: Sections collapse in-place without redistributing space
  });
  accordionInPlace.id = 'accordion-inplace';

  const y1 = new ContentWidget('Yellow');
  const p1 = new ContentWidget('Purple');
  const o1 = new ContentWidget('Orange');

  accordionInPlace.addWidget(y1);
  accordionInPlace.addWidget(p1);
  accordionInPlace.addWidget(o1);

  BoxPanel.setStretch(accordionInPlace, 1);

  // Create main layout with both accordions side by side
  const main = new BoxPanel({ direction: 'left-to-right', spacing: 10 });
  main.id = 'main';
  main.addWidget(accordionDefault);
  main.addWidget(accordionInPlace);

  window.onresize = () => {
    main.update();
  };

  Widget.attach(main, document.body);

  // Demo info
  console.log('Two Accordion Panels loaded!');
  console.log(
    'Left: Default "last-open" mode - last section expands when others collapse'
  );
  console.log(
    'Right: New "in-place" mode - sections collapse independently without affecting others'
  );
}

window.onload = main;
