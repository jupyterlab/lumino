// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { expect } from 'chai';

import { CellRenderer, GraphicsContext, TextRenderer } from '@lumino/datagrid';

class LoggingGraphicsContext extends GraphicsContext {
  fillText(text: string, x: number, y: number, maxWidth?: number): void {
    super.fillText(text, x, y, maxWidth);
    this.texts.push(text);
  }

  texts: string[] = [];
}

describe('@lumino/datagrid', () => {
  let gc: LoggingGraphicsContext;
  const defaultCellConfig: CellRenderer.CellConfig = {
    x: 0,
    y: 0,
    width: 100,
    height: 20,
    row: 0,
    column: 0,
    region: 'body',
    value: '',
    metadata: {}
  };
  beforeEach(() => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    gc = new LoggingGraphicsContext(context);
  });
  describe('TextRenderer', () => {
    describe('drawText()', () => {
      it('should right-elide long strings', () => {
        const renderer = new TextRenderer({
          elideDirection: 'right',
          font: '12px Arial'
        });
        renderer.drawText(gc, {
          ...defaultCellConfig,
          width: 100,
          value: 'this text exceeds 100px'
        });
        expect(gc.texts.pop()).to.eq('this text exce…');
      });

      it('should left-elide long strings', () => {
        const renderer = new TextRenderer({
          elideDirection: 'left',
          font: '12px Arial'
        });
        renderer.drawText(gc, {
          ...defaultCellConfig,
          width: 100,
          value: 'this text exceeds 100px'
        });
        // Pixel calculations differ between Firefox and Chrome, either is good.
        expect(gc.texts.pop()).to.be.oneOf(['…xceeds 100px', '…ceeds 100px']);
      });

      it('should not elide if eliding is disabled', () => {
        const renderer = new TextRenderer({
          elideDirection: 'none',
          font: '12px Arial'
        });
        renderer.drawText(gc, {
          ...defaultCellConfig,
          width: 100,
          value: 'this text exceeds 100px'
        });
        expect(gc.texts.pop()).to.eq('this text exceeds 100px');
      });

      it('should wrap text', () => {
        const renderer = new TextRenderer({
          elideDirection: 'none',
          wrapText: true,
          font: '12px Arial'
        });
        renderer.drawText(gc, {
          ...defaultCellConfig,
          width: 100,
          value: 'this text exceeds 100px'
        });
        expect(gc.texts.pop()).to.eq('exceeds 100px');
        expect(gc.texts.pop()).to.eq('this text');
      });

      it('should not break up Unicode surrogate characters (left)', () => {
        const renderer = new TextRenderer({
          elideDirection: 'left',
          font: '12px Arial'
        });
        renderer.drawText(gc, {
          ...defaultCellConfig,
          width: 45,
          value: '📦📦📦'
        });
        expect(gc.texts.pop()).to.eq('…📦');
      });
      it('should not break up Unicode surrogate characters (right)', () => {
        const renderer = new TextRenderer({
          elideDirection: 'right',
          font: '12px Arial'
        });
        renderer.drawText(gc, {
          ...defaultCellConfig,
          width: 45,
          value: '📦📦📦'
        });
        expect(gc.texts.pop()).to.eq('📦…');
      });
    });
  });
});
