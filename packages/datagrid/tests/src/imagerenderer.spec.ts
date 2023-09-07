// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { expect } from 'chai';

import { CellRenderer, GraphicsContext, ImageRenderer } from '@lumino/datagrid';

class LoggingGraphicsContext extends GraphicsContext {
  drawImage(
    img: HTMLImageElement,
    x: number,
    y: number,
    width?: number,
    height?: number
  ): void {
    if (width && height) {
      super.drawImage(img, x, y, width, height);
    } else {
      super.drawImage(img, x, y);
    }
    this.images.push({ img, x, y, width, height });
  }

  images: any[] = [];
}

describe('@lumino/datagrid', () => {
  let gc: LoggingGraphicsContext;
  let img: HTMLImageElement;
  const defaultCellConfig: CellRenderer.CellConfig = {
    x: 5,
    y: 6,
    width: 240,
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
    img = document.createElement('img');
    img.width = 12;
    img.height = 2;
    ImageRenderer['dataCache'].set('test-image', img);
  });
  describe('ImageRenderer', () => {
    describe('drawImage()', () => {
      it('should take full available height by default', () => {
        const renderer = new ImageRenderer();
        renderer.drawImage(gc, {
          ...defaultCellConfig,
          value: 'test-image'
        });
        expect(gc.images.pop()).to.deep.eq({
          img,
          x: 5,
          y: 6,
          width: 120,
          height: 20
        });
      });

      it('should take full available width when requested', () => {
        const renderer = new ImageRenderer({
          width: '100%',
          height: ''
        });
        renderer.drawImage(gc, {
          ...defaultCellConfig,
          value: 'test-image'
        });
        expect(gc.images.pop()).to.deep.eq({
          img,
          x: 5,
          y: 6,
          width: 240,
          height: 40
        });
      });

      it('should take full available width and height when requested', () => {
        const renderer = new ImageRenderer({
          width: '100%',
          height: '100%'
        });
        renderer.drawImage(gc, {
          ...defaultCellConfig,
          value: 'test-image'
        });
        expect(gc.images.pop()).to.deep.eq({
          img,
          x: 5,
          y: 6,
          width: 240,
          height: 20
        });
      });

      it('should take width in pixels', () => {
        const renderer = new ImageRenderer({
          width: '24px',
          height: ''
        });
        renderer.drawImage(gc, {
          ...defaultCellConfig,
          value: 'test-image'
        });
        expect(gc.images.pop()).to.deep.eq({
          img,
          x: 5,
          y: 6,
          width: 24,
          height: 4
        });
      });

      it('should take width and height pixels', () => {
        const renderer = new ImageRenderer({
          width: '24px',
          height: '13px'
        });
        renderer.drawImage(gc, {
          ...defaultCellConfig,
          value: 'test-image'
        });
        expect(gc.images.pop()).to.deep.eq({
          img,
          x: 5,
          y: 6,
          width: 24,
          height: 13
        });
      });

      it('should take width in pixels and height in percentage', () => {
        const renderer = new ImageRenderer({
          width: '24px',
          height: '50%'
        });
        renderer.drawImage(gc, {
          ...defaultCellConfig,
          value: 'test-image'
        });
        expect(gc.images.pop()).to.deep.eq({
          img,
          x: 5,
          y: 6,
          width: 24,
          height: 10
        });
      });
    });
  });
});
