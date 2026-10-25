// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { expect } from 'chai';

import { CellRenderer, GraphicsContext, TextRenderer } from '@lumino/datagrid';

class LoggingGraphicsContext extends GraphicsContext {
  measureText(text: string): TextMetrics {
    this.measurements.push(text);
    return super.measureText(text);
  }

  fillText(text: string, x: number, y: number, maxWidth?: number): void {
    super.fillText(text, x, y, maxWidth);
    this.texts.push(text);
  }

  texts: string[] = [];
  measurements: string[] = [];
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
      for (const direction of ['left', 'right'] as const) {
        it(`should ${direction}-elide long text with logarithmic measurements`, () => {
          const renderer = new TextRenderer({
            elideDirection: direction,
            font: '12px monospace'
          });
          gc.font = '12px monospace';
          const boxWidth = gc.measureText('x'.repeat(200)).width;
          for (const length of [399, 10240]) {
            gc.measurements = [];
            renderer.drawText(gc, {
              ...defaultCellConfig,
              width: boxWidth + 14,
              value: 'x'.repeat(length)
            });
            const measurements = gc.measurements.length;
            const text = gc.texts.pop()!;
            expect(gc.measureText(text).width).to.be.at.most(boxWidth);
            const longer = direction === 'left' ? text + 'x' : 'x' + text;
            expect(gc.measureText(longer).width).to.be.greaterThan(boxWidth);
            expect(measurements).to.be.at.most(
              1 + Math.ceil(Math.log2(length))
            );
          }
        });

        it(`should retain the longest fitting ${direction}-elided text`, () => {
          const renderer = new TextRenderer({
            elideDirection: direction,
            font: '12px Arial'
          });
          gc.font = '12px Arial';
          for (const value of [
            'WWWWiiiiiiiiiiii',
            'iiiiiiiiiiiiWWWW',
            '📦📦📦📦'
          ]) {
            for (const boxWidth of [1, 20, 40, 60]) {
              const characters = [...value];
              let expected = '…';
              if (gc.measureText(value).width <= boxWidth) {
                expected = value;
              } else {
                for (let n = 1; n < characters.length; n++) {
                  const candidate =
                    direction === 'right'
                      ? characters.slice(0, n).join('') + '…'
                      : '…' + characters.slice(-n).join('');
                  if (gc.measureText(candidate).width <= boxWidth) {
                    expected = candidate;
                  }
                }
              }
              renderer.drawText(gc, {
                ...defaultCellConfig,
                width: boxWidth + 14,
                value
              });
              expect(gc.texts.pop(), `${value}, width ${boxWidth}`).to.eq(
                expected
              );
            }
          }
        });
      }

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
        expect(gc.measurements).to.have.length(0);
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
