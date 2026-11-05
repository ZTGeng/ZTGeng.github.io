import { polygon, path, linePath } from './drawing.js';
import { mix } from './channel-layout.js';
import { createCurrentSurface } from './current.js';
import { channelWall, channelFloor, sampleEdge, wallBaseAt, straightWaterEdges, wallRun } from './channel-walls.js';

const artworkCache = new WeakMap();

// Layout is fixed during rendering. Generate each complete straight channel
// once, then let the existing half clips and painter order reveal it.
// Cache markup/geometry only: animated instances still have separate DOM nodes.
export function channelArtwork(segment) {
  if (artworkCache.has(segment)) return artworkCache.get(segment);
  const [a, d] = segment.from, [b, c] = segment.to;
  const waterBySide = {
    left: straightWaterEdges(segment, 'left'),
    right: straightWaterEdges(segment, 'right'),
  };
  const water = waterBySide.left;
  const nearRun = wallRun(segment, 'near'), farRun = wallRun(segment, 'far');
  const nearWater = sampleEdge(...water.near).map(water.waterAt);
  const farWater = sampleEdge(...water.far).map(water.waterAt);
  const wetOutline = [...nearWater, ...farWater.toReversed()];
  const artwork = {
    waterBySide,
    floors: channelFloor(farRun) + channelFloor(nearRun),
    bed: polygon([a, b, c, d].map(p => wallBaseAt(segment, p)), 'channel-corner-stone'),
    farWall: channelWall(farRun, water.heightAt),
    nearWall: channelWall(nearRun, water.heightAt),
    waterSurface: polygon(wetOutline, 'channel-corner-water'),
    waterline: path(linePath(farWater), 'channel-waterline'),
    current: createCurrentSurface(wetOutline,
      (t, v) => water.guideAt(mix(mix(...water.near, t), mix(...water.far, t), v)),
      -1, Math.hypot(b[0] - a[0], b[1] - a[1])),
  };
  artworkCache.set(segment, artwork);
  return artwork;
}
