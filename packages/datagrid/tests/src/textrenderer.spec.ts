// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { expect } from 'chai';

import { CellRenderer, GraphicsContext, TextRenderer } from '@lumino/datagrid';

class LoggingGraphicsContext extends GraphicsContext {
  fillText(text: string, x: number, y: number, maxWidth?: number): void {
    super.fillText(text, x, y, maxWidth);
    this.lastText = text;
  }

  lastText: string | null = null;
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
          elideDirection: 'right'
        });
        renderer.drawText(gc, {
          ...defaultCellConfig,
          width: 100,
          value: 'this text exceeds 100px'
        });
        expect(gc.lastText).to.eq('this text exce…');
      });

      it('should left-elide long strings', () => {
        const renderer = new TextRenderer({
          elideDirection: 'left'
        });
        renderer.drawText(gc, {
          ...defaultCellConfig,
          width: 100,
          value: 'this text exceeds 100px'
        });
        expect(gc.lastText).to.eq('…xceeds 100px');
      });

      it('should not elide if eliding is disabled', () => {
        const renderer = new TextRenderer({
          elideDirection: 'none'
        });
        renderer.drawText(gc, {
          ...defaultCellConfig,
          width: 100,
          value: 'this text exceeds 100px'
        });
        expect(gc.lastText).to.eq('this text exceeds 100px');
      });

      it('should not break up Unicode surrogate characters (left)', () => {
        const renderer = new TextRenderer({
          elideDirection: 'left'
        });
        renderer.drawText(gc, {
          ...defaultCellConfig,
          width: 45,
          value: '📦📦📦'
        });
        expect(gc.lastText).to.eq('…📦');
      });
      it('should not break up Unicode surrogate characters (right)', () => {
        const renderer = new TextRenderer({
          elideDirection: 'right'
        });
        renderer.drawText(gc, {
          ...defaultCellConfig,
          width: 45,
          value: '📦📦📦'
        });
        expect(gc.lastText).to.eq('📦…');
      });
    });
  });
});
