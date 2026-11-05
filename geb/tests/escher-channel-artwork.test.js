import test from 'node:test';
import assert from 'node:assert/strict';
import { channelArtwork } from '../src/chapters/00-intro/escher/channel-artwork.js';
import { channelSegments } from '../src/chapters/00-intro/escher/channel-layout.js';
import { straightWaterEdges } from '../src/chapters/00-intro/escher/channel-walls.js';
import { createCurrentSurface } from '../src/chapters/00-intro/escher/current.js';

test('channel halves reuse complete artwork while retaining their side-specific elevations and clip IDs', () => {
  const artworks = channelSegments.map(segment => {
    const artwork = channelArtwork(segment);
    assert.equal(channelArtwork(segment), artwork);
    for (const side of ['left', 'right']) {
      const expected = straightWaterEdges(segment, side);
      assert.equal(artwork.waterBySide[side].height, expected.height);
      assert.equal(artwork.waterBySide[side].waterElevation, expected.waterElevation);
    }
    const leftId = `current-${segment.id}-left`, rightId = `current-${segment.id}-right`;
    const left = artwork.current(leftId), right = artwork.current(rightId);
    assert.ok(left.includes(`id="${leftId}"`) && left.includes(`url(#${leftId})`));
    assert.ok(right.includes(`id="${rightId}"`) && right.includes(`url(#${rightId})`));
    assert.equal(left.replaceAll(leftId, 'shared'), right.replaceAll(rightId, 'shared'));
    return artwork;
  });
  assert.equal(new Set(artworks).size, channelSegments.length);
});

test('repeated current instances never resample the shared flow geometry', () => {
  let samples = 0;
  const current = createCurrentSurface([[0, 0], [100, 0], [100, 10], [0, 10]], (t, v) => {
    samples++;
    return [t * 100, v * 10];
  }, -1);
  assert.equal(samples, 5 * 49);
  current('left');
  current('right');
  assert.equal(samples, 5 * 49);
});
