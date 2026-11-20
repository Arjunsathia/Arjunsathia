import test from 'node:test';
import assert from 'node:assert/strict';
import {splitBold, plainText} from '../src/lib/rich-text.js';

test('marked phrases become bold parts, in order', () => {
  assert.deepEqual(splitBold('A **send governor** that **backs off**.'), [
    {text: 'A ', bold: false}, {text: 'send governor', bold: true}, {text: ' that ', bold: false}, {text: 'backs off', bold: true}, {text: '.', bold: false},
  ]);
});
test('text without markers is one plain part', () => {
  assert.deepEqual(splitBold('Plain text.'), [{text: 'Plain text.', bold: false}]);
});
test('a phrase at the very start or end leaves no empty parts', () => {
  assert.deepEqual(splitBold('**140+ tests**'), [{text: '140+ tests', bold: true}]);
});
test('plainText removes the markers and keeps the words', () => {
  assert.equal(plainText('Cut from **~320 KB to ~37 KB** with RPCs.'), 'Cut from ~320 KB to ~37 KB with RPCs.');
});
