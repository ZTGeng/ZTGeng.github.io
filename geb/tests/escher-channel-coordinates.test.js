import test from 'node:test';
import assert from 'node:assert/strict';
import { createStationLookup } from '../src/chapters/00-intro/escher/channel-coordinates.js';
import { channelSegments } from '../src/chapters/00-intro/escher/channel-layout.js';

test('channel inverse projection recovers coordinates through straight and tapered strips', () => {
  for (const segment of channelSegments) {
    const lookup = createStationLookup(segment);
    for (const t of [-.1, 0, 1 / 3, .5, 2 / 3, 1, 1.1]) {
      for (const v of [0, .2, .5, .8, 1]) {
        const point = segment.from[0].map((a, k) =>
          (1 - t) * ((1 - v) * a + v * segment.from[1][k]) +
          t * ((1 - v) * segment.to[0][k] + v * segment.to[1][k]));
        const actual = lookup(point);
        assert.ok(Math.abs(actual.t - t) < 1e-10, `channel ${segment.id}: t`);
        assert.ok(Math.abs(actual.v - v) < 1e-10, `channel ${segment.id}: v`);
      }
    }
  }
});

test('point cache reuses coordinates independently of course metadata and refreshes changed points', () => {
  const segment = channelSegments[0];
  const lookup = createStationLookup(segment);
  const point = [...segment.from[0]];
  const first = lookup(point);
  point.course = 3;
  assert.equal(lookup(point), first);
  point[0] = segment.to[0][0];
  point[1] = segment.to[0][1];
  const moved = lookup(point);
  assert.notEqual(moved, first);
  assert.ok(Math.abs(moved.t - 1) < 1e-10);
  assert.ok(Math.abs(moved.v) < 1e-10);
});
