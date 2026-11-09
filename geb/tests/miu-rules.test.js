import assert from 'node:assert/strict';
import test from 'node:test';
import { applyRule, matchPositions, MAX_LENGTH } from '../src/chapters/01-mu-puzzle/miu-rules.js';

test('MIU append and duplication apply at the appropriate end of the string', () => {
  assert.equal(applyRule('MI', 0, 2), 'MIU');
  assert.equal(applyRule('MIU', 0, 3), null);
  assert.equal(applyRule('MIU', 1, 1), 'MIUIU');
});

test('MIU replacements and deletions include overlapping starts and affect only one match', () => {
  assert.deepEqual(matchPositions('MIIII', 2), [1, 2]);
  assert.equal(applyRule('MIIII', 2, 1), 'MUI');
  assert.equal(applyRule('MIIII', 2, 2), 'MIU');
  assert.equal(applyRule('MIIII', 2, 3), null);
  assert.deepEqual(matchPositions('MUUUIUU', 3), [1, 2, 5]);
  assert.equal(applyRule('MUUUIUU', 3, 2), 'MUIUU');
  assert.equal(applyRule('MUUUIUU', 3, 5), 'MUUUI');
});

test('MIU permits exactly 256 characters and counts the initial M toward the limit', () => {
  const beforeAppend = `M${'I'.repeat(MAX_LENGTH - 2)}`;
  assert.equal(applyRule(beforeAppend, 0, beforeAppend.length).length, MAX_LENGTH);
  const beforeDuplication = `M${'I'.repeat(MAX_LENGTH / 2 - 1)}`;
  assert.equal(applyRule(beforeDuplication, 1, 1).length, MAX_LENGTH - 1);
  assert.equal(applyRule(`${beforeDuplication}I`, 1, 1), null);
  assert.equal(applyRule(`${beforeAppend}I`, 0, MAX_LENGTH), null);
});
