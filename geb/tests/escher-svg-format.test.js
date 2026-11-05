import test from 'node:test';
import assert from 'node:assert/strict';
import { formatNumber, formatNumericList, formatPoints, formatSvgNumbers } from '../src/chapters/00-intro/escher/svg-format.js';

test('SVG output keeps three decimal places without trailing zeroes or negative zero', () => {
  assert.equal(formatNumber(12.3456789), '12.346');
  assert.equal(formatNumber(2.5), '2.5');
  assert.equal(formatNumber(-.00001), '0');
  assert.equal(formatNumber(-0), '0');
  assert.equal(formatNumber(8), '8');
  assert.throws(() => formatNumber(Infinity), TypeError);
});

test('path rounding preserves adjacent signed numbers, exponents and arc flags', () => {
  assert.equal(formatNumericList('M1-0.00001L2+3 1e-7-.25'), 'M1 0L2 3 0-0.25');
  assert.equal(formatNumericList('M.12555.87555A4.12345,5.98765 0 0 1-2.45678,9.12345Z'),
    'M0.126 0.876A4.123,5.988 0 0 1-2.457,9.123Z');
});

test('only numeric SVG attributes are rounded, preserving IDs, references and calculation data', () => {
  const svg = '<svg viewBox="0 0 900 1040"><path id="piece-1.23456" d="M1.23456,2.34567" fill="url(#piece-1.23456)" data-phase="0.123456789" aria-label="1.23456" transform="translate(1.23456 -0.00001)"/></svg>';
  assert.equal(formatSvgNumbers(svg), '<svg viewBox="0 0 900 1040"><path id="piece-1.23456" d="M1.235,2.346" fill="url(#piece-1.23456)" data-phase="0.123456789" aria-label="1.23456" transform="translate(1.235 0)"/></svg>');
  assert.equal(formatSvgNumbers('<rect x="-50.00001%" width="200%"/>'), '<rect x="-50%" width="200%"/>');
});

test('shared points serialize identically without modifying source geometry', () => {
  const points = [[1.23456789, -2.34567891], [3.45678912, 4.56789123]];
  const before = structuredClone(points);
  assert.equal(formatPoints(points), '1.235,-2.346 3.457,4.568');
  assert.deepEqual(points, before);
  assert.equal(formatSvgNumbers(`<path d="M${points[0]}L${points[1]}"/>`), '<path d="M1.235,-2.346L3.457,4.568"/>');
});
