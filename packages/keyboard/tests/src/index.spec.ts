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

import { generate } from 'simulate-event';

import {
  EN_US,
  getKeyboardLayout,
  KeycodeLayout,
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
        let layout = new KeycodeLayout('ab-cd', { 100: 'F' });
        let keys = layout.keys();
        expect(keys.length).to.equal(1);
        expect(keys[0]).to.equal('F');
      });
    });

    describe('#isValidKey()', () => {
      it('should test whether the key is valid for the layout', () => {
        let layout = new KeycodeLayout('foo', { 100: 'F' });
        expect(layout.isValidKey('F')).to.equal(true);
        expect(layout.isValidKey('A')).to.equal(false);
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
        let event = generate('keydown', { keyCode: 100 });
        let key = layout.keyForKeydownEvent(event as KeyboardEvent);
        expect(key).to.equal('F');
      });

      it('should return an empty string if the code is not valid', () => {
        let layout = new KeycodeLayout('foo', { 100: 'F' });
        let event = generate('keydown', { keyCode: 101 });
        let key = layout.keyForKeydownEvent(event as KeyboardEvent);
        expect(key).to.equal('');
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
      expect(EN_US.isValidKey('Ctrl')).to.equal(true);
      expect(EN_US.isValidKey('Alt')).to.equal(true);
      expect(EN_US.isValidKey('Meta')).to.equal(true);
    });

    it('should correctly detect modifier keys', () => {
      expect(EN_US.isModifierKey('Shift')).to.equal(true);
      expect(EN_US.isModifierKey('Ctrl')).to.equal(true);
      expect(EN_US.isModifierKey('Alt')).to.equal(true);
      expect(EN_US.isModifierKey('Meta')).to.equal(true);
    });
  });
});
