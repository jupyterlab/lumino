// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { every } from '@lumino/algorithm';
import { Message } from '@lumino/messaging';
import { AccordionLayout, Title, Widget } from '@lumino/widgets';
import { expect } from 'chai';

const renderer: AccordionLayout.IRenderer = {
  titleClassName: '.lm-AccordionTitle',
  createHandle: () => document.createElement('div'),
  createSectionTitle: (title: Title<Widget>) => document.createElement('h3')
};

class LogAccordionLayout extends AccordionLayout {
  methods: string[] = [];

  protected init(): void {
    super.init();
    this.methods.push('init');
  }

  protected attachWidget(index: number, widget: Widget): void {
    super.attachWidget(index, widget);
    this.methods.push('attachWidget');
  }

  protected moveWidget(
    fromIndex: number,
    toIndex: number,
    widget: Widget
  ): void {
    super.moveWidget(fromIndex, toIndex, widget);
    this.methods.push('moveWidget');
  }

  protected detachWidget(index: number, widget: Widget): void {
    super.detachWidget(index, widget);
    this.methods.push('detachWidget');
  }

  protected onFitRequest(msg: Message): void {
    super.onFitRequest(msg);
    this.methods.push('onFitRequest');
  }
}

/**
 * Where each node of the parent is in the layout order of the sections'
 * title, widget and handle nodes: ascending when the DOM follows the layout.
 */
function domOrder(layout: AccordionLayout): number[] {
  let nodes: Element[] = [];
  layout.widgets.forEach((widget, i) => {
    nodes.push(layout.titles[i], widget.node, layout.handles[i]);
  });
  return Array.from(layout.parent!.node.children).map(node =>
    nodes.indexOf(node)
  );
}

describe('@lumino/widgets', () => {
  describe('AccordionLayout', () => {
    describe('#constructor()', () => {
      it('should accept a renderer', () => {
        const layout = new AccordionLayout({ renderer });
        expect(layout).to.be.an.instanceof(AccordionLayout);
      });

      it('should be vertical by default', () => {
        const layout = new AccordionLayout({ renderer });
        expect(layout.orientation).to.equal('vertical');
      });
    });

    describe('#titleSpace', () => {
      it('should get the inter-element spacing for the split layout', () => {
        const layout = new AccordionLayout({ renderer });
        expect(layout.titleSpace).to.equal(22);
      });

      it('should set the inter-element spacing for the split layout', () => {
        const layout = new AccordionLayout({ renderer });
        layout.titleSpace = 10;
        expect(layout.titleSpace).to.equal(10);
      });

      it('should post a fit request to the parent widget', done => {
        let layout = new LogAccordionLayout({ renderer });
        let parent = new Widget();
        parent.layout = layout;
        layout.titleSpace = 10;
        requestAnimationFrame(() => {
          expect(layout.methods).to.contain('onFitRequest');
          done();
        });
      });

      it('should be a no-op if the value does not change', done => {
        let layout = new LogAccordionLayout({ renderer });
        let parent = new Widget();
        parent.layout = layout;
        layout.titleSpace = 22;
        requestAnimationFrame(() => {
          expect(layout.methods).to.not.contain('onFitRequest');
          done();
        });
      });
    });

    describe('#renderer', () => {
      it('should get the renderer for the layout', () => {
        const layout = new AccordionLayout({ renderer });
        expect(layout.renderer).to.equal(renderer);
      });
    });

    describe('#titles', () => {
      it('should be a read-only sequence of the accordion titles in the layout', () => {
        const layout = new AccordionLayout({ renderer });
        let parent = new Widget();
        parent.layout = layout;
        const widgets = [new Widget(), new Widget(), new Widget()];
        for (const widget of widgets) {
          layout.addWidget(widget);
        }

        expect(every(layout.titles, h => h instanceof HTMLElement));
        expect(layout.titles).to.have.length(widgets.length);
      });
    });

    describe('#attachWidget()', () => {
      it('should insert a title node before the widget', () => {
        let layout = new LogAccordionLayout({ renderer });
        let parent = new Widget();
        parent.layout = layout;
        let widget = new Widget();

        layout.addWidget(widget);

        expect(layout.methods).to.contain('attachWidget');
        expect(parent.node.contains(widget.node)).to.equal(true);
        expect(layout.titles.length).to.equal(1);

        const title = layout.titles[0];
        expect(widget.node.previousElementSibling).to.equal(title);
        expect(title.getAttribute('aria-label')).to.equal(
          `${parent.title.label} Section`
        );
        expect(title.getAttribute('aria-expanded')).to.equal('true');
        expect(title.classList.contains('lm-mod-expanded')).to.be.true;

        expect(widget.node.getAttribute('role')).to.equal('region');
        expect(widget.node.getAttribute('aria-labelledby')).to.equal(title.id);
        parent.dispose();
      });

      it('should insert the title, widget and handle nodes in layout order', () => {
        let layout = new LogAccordionLayout({ renderer });
        let parent = new Widget();
        parent.layout = layout;
        layout.addWidget(new Widget());
        layout.addWidget(new Widget());
        layout.insertWidget(1, new Widget());
        layout.insertWidget(0, new Widget());
        expect(domOrder(layout)).to.deep.equal([
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
        ]);
        parent.dispose();
      });
    });

    describe('#moveWidget()', () => {
      it("should move a title in the parent's DOM node", () => {
        let layout = new LogAccordionLayout({ renderer });
        let widgets = [new Widget(), new Widget(), new Widget()];
        let parent = new Widget();
        parent.layout = layout;
        widgets.forEach(w => {
          layout.addWidget(w);
        });
        let widget = widgets[0];
        let title = layout.titles[0];

        layout.insertWidget(2, widget);

        expect(layout.methods).to.contain('moveWidget');
        expect(layout.titles[2]).to.equal(title);
        parent.dispose();
      });

      it('should move the title, widget and handle nodes in layout order', () => {
        let layout = new LogAccordionLayout({ renderer });
        let widgets = [new Widget(), new Widget(), new Widget(), new Widget()];
        let parent = new Widget();
        parent.layout = layout;
        widgets.forEach(w => {
          layout.addWidget(w);
        });
        layout.insertWidget(0, widgets[3]);
        expect(domOrder(layout)).to.deep.equal([
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
        ]);
        layout.insertWidget(3, widgets[0]);
        expect(domOrder(layout)).to.deep.equal([
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
        ]);
        parent.dispose();
      });

      it('should keep the focus on a moved title', () => {
        let layout = new LogAccordionLayout({ renderer });
        let widgets = [new Widget(), new Widget(), new Widget()];
        let parent = new Widget();
        parent.layout = layout;
        widgets.forEach(w => {
          layout.addWidget(w);
        });
        Widget.attach(parent, document.body);
        let title = layout.titles[0];
        title.tabIndex = 0;
        title.focus();
        layout.insertWidget(2, widgets[0]);
        expect(document.activeElement).to.equal(title);
        parent.dispose();
      });
    });

    describe('#detachWidget()', () => {
      it("should detach a title from the parent's DOM node", () => {
        let layout = new LogAccordionLayout({ renderer });
        let widget = new Widget();
        let parent = new Widget();
        parent.layout = layout;
        layout.addWidget(widget);
        const title = layout.titles[0];

        layout.removeWidget(widget);

        expect(layout.methods).to.contain('detachWidget');
        expect(parent.node.contains(title)).to.equal(false);
        expect(layout.titles).to.have.length(0);
        parent.dispose();
      });
    });

    describe('#dispose', () => {
      it('clear the titles list', () => {
        const layout = new AccordionLayout({ renderer });
        const widgets = [new Widget(), new Widget(), new Widget()];
        widgets.forEach(w => {
          layout.addWidget(w);
        });

        layout.dispose();

        expect(layout.titles).to.have.length(0);
      });
    });
  });
});
