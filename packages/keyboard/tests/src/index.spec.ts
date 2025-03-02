// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
import { expect } from 'chai';

import {
  EN_US,
  FR_FR,
  getKeyboardLayout,
  KeycodeLayout,
  NB_NO,
  setKeyboardLayout
} from '@lumino/keyboard';

describe('@lumino/keyboard', () => {
  describe('getKeyboardLayout()', () => {
    it('should return the global keyboard layout', () => {
      expect(getKeyboardLayout()).to.equal(EN_US);
    });
  });

  describe('setKeyboardLayout()', () => {
    it('should set the global keyboard layout', () => {
      let layout = new KeycodeLayout('ab-cd', {});
      setKeyboardLayout(layout);
      expect(getKeyboardLayout()).to.equal(layout);
      setKeyboardLayout(EN_US);
      expect(getKeyboardLayout()).to.equal(EN_US);
    });
  });

  describe('KeycodeLayout', () => {
    describe('#constructor()', () => {
      it('should construct a new keycode layout', () => {
        let layout = new KeycodeLayout('ab-cd', {});
        expect(layout).to.be.an.instanceof(KeycodeLayout);
      });
    });

    describe('#name', () => {
      it('should be a human readable name of the layout', () => {
        let layout = new KeycodeLayout('ab-cd', {});
        expect(layout.name).to.equal('ab-cd');
      });
    });

    describe('#keys()', () => {
      it('should get an array of all key values supported by the layout', () => {
        let layout = new KeycodeLayout('ab-cd', { 100: 'F' }, [], { F4: 'F4' });
        let keys = layout.keys();
        expect(keys.length).to.equal(2);
        expect(keys[0]).to.equal('F', 'F4');
      });
    });

    describe('#isValidKey()', () => {
      it('should test whether the key is valid for the layout', () => {
        let layout = new KeycodeLayout('foo', { 100: 'F' }, [], { F4: 'F4' });
        expect(layout.isValidKey('F')).to.equal(true);
        expect(layout.isValidKey('F4')).to.equal(true);
        expect(layout.isValidKey('A')).to.equal(false);
      });

      it('should treat unmodified special keys as valid', () => {
        let layout = new KeycodeLayout('foo', { 100: 'F' }, [], { F4: 'F4' });
        expect(layout.isValidKey('MediaPlayPause')).to.equal(true);
      });

      it('should treat modifier keys as valid', () => {
        let layout = new KeycodeLayout('foo', { 100: 'F', 101: 'A' }, ['A']);
        expect(layout.isValidKey('A')).to.equal(true);
      });
    });

    describe('#isModifierKey()', () => {
      it('should test whether the key is modifier for the layout', () => {
        let layout = new KeycodeLayout('foo', { 100: 'F', 101: 'A' }, ['A']);
        expect(layout.isModifierKey('F')).to.equal(false);
        expect(layout.isModifierKey('A')).to.equal(true);
      });

      it('should return false for keys that are not in the layout', () => {
        let layout = new KeycodeLayout('foo', { 100: 'F', 101: 'A' }, ['A']);
        expect(layout.isModifierKey('B')).to.equal(false);
      });
    });

    describe('#keyForKeydownEvent()', () => {
      it('should get the key for a `keydown` event', () => {
        let layout = new KeycodeLayout('foo', { 100: 'F' });
        let event = new KeyboardEvent('keydown', { keyCode: 100 });
        let key = layout.keyForKeydownEvent(event as KeyboardEvent);
        expect(key).to.equal('F');
      });

      it('should return an empty string if the code is not valid', () => {
        let layout = new KeycodeLayout('foo', { 100: 'F' });
        let event = new KeyboardEvent('keydown', { keyCode: 101 });
        let key = layout.keyForKeydownEvent(event as KeyboardEvent);
        expect(key).to.equal('');
      });

      it('should get the key from a `code` value', () => {
        let layout = new KeycodeLayout('foo', { 100: 'F' }, [], {
          Escape: 'Escape'
        });
        let event = new KeyboardEvent('keydown', { code: 'Escape' });
        let key = layout.keyForKeydownEvent(event as KeyboardEvent);
        expect(key).to.equal('Escape');
      });

      it('should fall back to keyCode for Unidentified', () => {
        let layout = new KeycodeLayout('foo', { 100: 'F' }, [], {
          Escape: 'Escape'
        });
        let event = new KeyboardEvent('keydown', {
          code: 'Unidentified',
          keyCode: 100
        });
        let key = layout.keyForKeydownEvent(event as KeyboardEvent);
        expect(key).to.equal('F');
      });

      it('should treat special keys as valid', () => {
        let layout = new KeycodeLayout('foo', { 100: 'F' }, [], { F4: 'F4' });
        let event = new KeyboardEvent('keydown', {
          code: 'Unidentified',
          ctrlKey: true,
          key: 'MediaPlayPause',
          keyCode: 170
        });
        let key = layout.keyForKeydownEvent(event as KeyboardEvent);
        expect(key).to.equal('MediaPlayPause');
      });

      it('should use keyCode over special key value', () => {
        let layout = new KeycodeLayout('foo', { 100: 'F' }, [], { F4: 'F4' });
        let event = new KeyboardEvent('keydown', {
          code: 'Unidentified',
          key: 'MediaPlayPause',
          keyCode: 100
        });
        let key = layout.keyForKeydownEvent(event as KeyboardEvent);
        expect(key).to.equal('F');
      });
    });

    describe('.extractKeys()', () => {
      it('should extract the keys from a code map', () => {
        let keys: KeycodeLayout.CodeMap = { 70: 'F', 71: 'G', 72: 'H' };
        let goal: KeycodeLayout.KeySet = { F: true, G: true, H: true };
        expect(KeycodeLayout.extractKeys(keys)).to.deep.equal(goal);
      });
    });

    describe('.convertToKeySet()', () => {
      it('should convert key array to key set', () => {
        let keys: string[] = ['F', 'G', 'H'];
        let goal: KeycodeLayout.KeySet = { F: true, G: true, H: true };
        expect(KeycodeLayout.convertToKeySet(keys)).to.deep.equal(goal);
      });
    });
  });

  describe('EN_US', () => {
    it('should be a keycode layout', () => {
      expect(EN_US).to.be.an.instanceof(KeycodeLayout);
    });

    it('should have standardized keys', () => {
      expect(EN_US.isValidKey('A')).to.equal(true);
      expect(EN_US.isValidKey('Z')).to.equal(true);
      expect(EN_US.isValidKey('0')).to.equal(true);
      expect(EN_US.isValidKey('a')).to.equal(false);
    });

    it('should have modifier keys', () => {
      expect(EN_US.isValidKey('Shift')).to.equal(true);
      expect(EN_US.isValidKey('Control')).to.equal(true);
      expect(EN_US.isValidKey('Alt')).to.equal(true);
      expect(EN_US.isValidKey('Meta')).to.equal(true);
    });

    it('should correctly detect modifier keys', () => {
      expect(EN_US.isModifierKey('Shift')).to.equal(true);
      expect(EN_US.isModifierKey('Control')).to.equal(true);
      expect(EN_US.isModifierKey('Alt')).to.equal(true);
      expect(EN_US.isModifierKey('Meta')).to.equal(true);
    });
  });

  describe('FR_FR', () => {
    it('should be a keycode layout', () => {
      expect(FR_FR).to.be.an.instanceof(KeycodeLayout);
    });

    it('should have standardized keys', () => {
      expect(FR_FR.isValidKey('A')).to.equal(true);
      expect(FR_FR.isValidKey('Z')).to.equal(true);
      expect(FR_FR.isValidKey('0')).to.equal(true);
      expect(FR_FR.isValidKey('a')).to.equal(false);
      expect(FR_FR.isValidKey('Ù')).to.equal(true);
    });

    it('should have modifier keys', () => {
      expect(FR_FR.isValidKey('Shift')).to.equal(true);
      expect(FR_FR.isValidKey('Control')).to.equal(true);
      expect(FR_FR.isValidKey('Alt')).to.equal(true);
      expect(NB_NO.isValidKey('AltGraph')).to.equal(true);
      expect(FR_FR.isValidKey('Meta')).to.equal(true);
    });

    it('should correctly detect modifier keys', () => {
      expect(FR_FR.isModifierKey('Shift')).to.equal(true);
      expect(FR_FR.isModifierKey('Control')).to.equal(true);
      expect(FR_FR.isModifierKey('Alt')).to.equal(true);
      expect(FR_FR.isModifierKey('Meta')).to.equal(true);
    });
  });

  describe('NB_NO', () => {
    it('should be a keycode layout', () => {
      expect(NB_NO).to.be.an.instanceof(KeycodeLayout);
    });

    it('should have standardized keys', () => {
      expect(NB_NO.isValidKey('A')).to.equal(true);
      expect(NB_NO.isValidKey('Z')).to.equal(true);
      expect(NB_NO.isValidKey('0')).to.equal(true);
      expect(NB_NO.isValidKey('a')).to.equal(false);
      expect(NB_NO.isValidKey('Æ')).to.equal(true);
    });

    it('should have modifier keys', () => {
      expect(NB_NO.isValidKey('Shift')).to.equal(true);
      expect(NB_NO.isValidKey('Control')).to.equal(true);
      expect(NB_NO.isValidKey('Alt')).to.equal(true);
      expect(NB_NO.isValidKey('AltGraph')).to.equal(true);
      expect(NB_NO.isValidKey('Meta')).to.equal(true);
    });

    it('should correctly detect modifier keys', () => {
      expect(NB_NO.isModifierKey('Shift')).to.equal(true);
      expect(NB_NO.isModifierKey('Control')).to.equal(true);
      expect(NB_NO.isModifierKey('Alt')).to.equal(true);
      expect(NB_NO.isModifierKey('AltGraph')).to.equal(true);
      expect(NB_NO.isModifierKey('Meta')).to.equal(true);
    });
  });
});
