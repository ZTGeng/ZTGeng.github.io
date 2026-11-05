import test from 'node:test';
import assert from 'node:assert/strict';
import { archOutline, intersectLines, stairGeometry } from '../src/chapters/00-intro/escher/architectural-geometry.js';

test('line intersection handles oblique/vertical lines and reports non-unique intersections', () => {
  assert.deepEqual(intersectLines([0, 0], [1, 2], [3, 0], [0, 1]), [3, 6]);
  assert.deepEqual(intersectLines([3, 0], [0, 1], [0, 0], [1, 2]), [3, 6]);
  for (const value of intersectLines([2, 1], [2, -1], [0, 0], [1, 1])) {
    assert.ok(Math.abs(value - 4 / 3) < 1e-12);
  }
  assert.equal(intersectLines([0, 0], [1, 2], [0, 1], [2, 4]), null);
  assert.equal(intersectLines([0, 0], [1, 2], [2, 4], [2, 4]), null);
});

test('arches retain their total height while their crown rise changes', () => {
  const at = (u, h) => [u, -h];
  for (const rise of [5, 15, 40]) {
    const outline = archOutline(at, 30, 100, rise);
    const values = outline.match(/-?\d+(?:\.\d+)?/g).map(Number);
    const [, , , shoulderY, controlX, controlY, rightX, rightY] = values;
    assert.equal(controlX, 15);
    assert.equal(rightX, 30);
    // The midpoint of the quadratic is the arch's apex.
    assert.equal(.25 * shoulderY + .5 * controlY + .25 * rightY, -100);
    assert.ok(outline.endsWith('L30,0Z'));
    assert.equal(archOutline(at, 30, 100, rise, false), outline.slice(0, -1));
  }
});

test('stair treads, risers and solid side outlines share exact edge endpoints', () => {
  const project = (x, y, z) => [x + y * .25, y - z];
  const geometry = stairGeometry(project, [10, 20, 30], [0, 25], [12, 3], 6, 4);
  for (let i = 0; i < 4; i++) {
    const tread = geometry.tread(i), riser = geometry.riser(i);
    assert.deepEqual(tread[3], riser[0]);
    assert.deepEqual(tread[2], riser[1]);
    if (i < 3) {
      assert.deepEqual(riser[3], geometry.tread(i + 1)[0]);
      assert.deepEqual(riser[2], geometry.tread(i + 1)[1]);
    }
    assert.deepEqual(geometry.side(0)[1 + 2 * i], riser[0]);
    assert.deepEqual(geometry.side(0)[2 + 2 * i], riser[3]);
    assert.deepEqual(geometry.side(1)[1 + 2 * i], riser[1]);
    assert.deepEqual(geometry.side(1)[2 + 2 * i], riser[2]);
  }
  assert.deepEqual(geometry.side(0).at(-1), project(10, 20, 30 - 4 * 6));
});
