// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/

import {
  expect
} from 'chai';

import {
  each
} from '@lumino/algorithm';

import {
  TabBar, DockPanel, Widget
} from '@lumino/widgets';

import {
//  LogWidget
} from './widget.spec';


describe('@lumino/widgets', () => {

  describe('DockPanel', () => {

    describe('#constructor()', () => {

      it('should construct a new dock panel and take no arguments', () => {
        let panel = new DockPanel();
        expect(panel).to.be.an.instanceof(DockPanel);
      });

      it('should accept options', () => {
        let renderer = Object.create(TabBar.defaultRenderer);
        let panel = new DockPanel({
          tabsMovable: true,
          renderer,
          tabsConstrained:true
        });
        each(panel.tabBars(), (tabBar) => { expect(tabBar.tabsMovable).to.equal(true); });
        each(panel.tabBars(), (tabBar) => { expect(tabBar.renderer).to.equal(renderer); });
      });

      it('should not have tabs constrained by default', ()=>{
        let panel = new DockPanel();
        expect(panel.tabsConstrained).to.equal(false);
      })

      it('should add a `lm-DockPanel` class', () => {
        let panel = new DockPanel();
        expect(panel.hasClass('lm-DockPanel')).to.equal(true);
      });

    });

    describe('#dispose()', () => {

      it('should dispose of the resources held by the widget', () => {
        let panel = new DockPanel();
        panel.addWidget(new Widget());
        panel.dispose();
        expect(panel.isDisposed).to.equal(true);
        panel.dispose();
        expect(panel.isDisposed).to.equal(true);
      });

    });

    describe('#tabsMovable', () => {

      it('should get whether tabs are movable', () => {
        let panel = new DockPanel();
        expect(panel.tabsMovable).to.equal(true);
      });

      it('should set tabsMovable of all tabs', () => {
        let panel = new DockPanel();
        let w1 = new Widget();
        let w2 = new Widget();
        panel.addWidget(w1);
        panel.addWidget(w2, { mode: 'split-right', ref: w1 });
        each(panel.tabBars(), (tabBar) => { expect(tabBar.tabsMovable).to.equal(true); });

        panel.tabsMovable = false;
        each(panel.tabBars(), (tabBar) => { expect(tabBar.tabsMovable).to.equal(false); });
      });

    });

  });

});
