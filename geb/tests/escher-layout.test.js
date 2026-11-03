import test from 'node:test';
import assert from 'node:assert/strict';
import { wheelRadius, wheelCenterY } from '../src/chapters/00-intro/escher/wheel.js';
import { mill, flatHouse, millFoundation, millBalcony, millFoundationSideOutline } from '../src/chapters/00-intro/escher/buildings.js';
import { foreground } from '../src/chapters/00-intro/escher/surroundings.js';
import { scene } from '../src/chapters/00-intro/escher/scene.js';
import { projectionAngles, projectPlane } from '../src/chapters/00-intro/escher/projection.js';
import { waterInset, straightWaterEdges, wallHeightAt, wallTopAt, wallBaseAt, sampleSteppedEdge, brickCourseHeight, wallRun, channelWall } from '../src/chapters/00-intro/escher/channel-walls.js';
import { bay, mix, towerLevels, channelSegments, structuralOrder, lowerPierColumns, channelHalf, channel4BankY, waterfallTail, columnFeet, towerCapitals, projectTowerPlane, turnHeightAt, turnBanks, channel4RimOutlet, millLayout, millTerraceLayout, millLift, millPlatformAnchor, millRightPlatformOutline, gardenLayout } from '../src/chapters/00-intro/escher/channel-layout.js';

test('shared projection uses rightward angles of down 10 and up 20 degrees', () => {
  assert.ok(Math.abs(projectionAngles.across - 10) < 1e-10);
  assert.ok(Math.abs(projectionAngles.receding + 20) < 1e-10);
  assert.ok(Math.abs(projectionAngles.acute - 30) < 1e-10);
  const [x, y] = scene.millTerrace.origin;
  const floorY = y + (scene.mill.origin[0] - x) * scene.waterwayDirections.across[1];
  assert.ok(Math.abs(floorY - scene.mill.origin[1]) < 1e-10);
});

test('all five corner-specific overlap chains are preserved', () => {
  const frontToBack = [
    ['left-upper', 'channel-1-left', 'left-middle'],
    ['right-upper', 'channel-2-right', 'channel-1-right', 'right-lower'],
    ['left-middle', 'channel-3-left', 'channel-2-left', 'left-lower'],
    ['right-lower', 'channel-4-right', 'channel-3-right'],
    ['left-lower', 'wheel', 'channel-4-left'],
  ];
  assert.equal(new Set(structuralOrder).size, structuralOrder.length);
  assert.equal(structuralOrder.filter(id => id.startsWith('channel-')).length, 8);
  for (const chain of frontToBack) {
    for (let i = 1; i < chain.length; i++) {
      const front = structuralOrder.indexOf(chain[i - 1]);
      const back = structuralOrder.indexOf(chain[i]);
      assert.ok(front >= 0 && back >= 0);
      assert.ok(front > back, `${chain[i - 1]} must cover ${chain[i]}`);
    }
  }
});

test('waterways meet the full-width tower turns and form convex strips', () => {
  assert.equal(channelSegments.length, 4);
  const edges = towerLevels.flatMap(level => Object.values(bay(level, scene.channelFootprint).edges));
  const samePoint = (a, b) => a[0] === b[0] && a[1] === b[1];
  for (const segment of channelSegments) {
    // Channel 4 ends behind the wheel, independently of the right-side piers.
    for (const end of segment.id === 4 ? [segment.from] : [segment.from, segment.to]) {
      assert.ok(edges.some(edge => edge.every((point, i) => samePoint(point, end[i]))), `channel ${segment.id} must terminate at column feet`);
    }
    const [a, d] = segment.from;
    const [b, c] = segment.to;
    const vertices = [a, b, c, d];
    const turns = vertices.map((p, i) => {
      const q = vertices[(i + 1) % 4];
      const r = vertices[(i + 2) % 4];
      return (q[0] - p[0]) * (r[1] - q[1]) - (q[1] - p[1]) * (r[0] - q[0]);
    });
    assert.ok(turns.every(t => t > 0) || turns.every(t => t < 0), `channel ${segment.id} must be a non-degenerate convex strip`);
  }
});

test('both banks of channel 4 remain parallel to channel 2', () => {
  const second = channelSegments.find(segment => segment.id === 2);
  const fourth = channelSegments.find(segment => segment.id === 4);
  for (const i of [0, 1]) {
    const a = second.to[i].map((v, axis) => v - second.from[i][axis]);
    const b = fourth.to[i].map((v, axis) => v - fourth.from[i][axis]);
    assert.ok(Math.abs(a[0] * b[1] - a[1] * b[0]) < 1e-7);
    assert.ok(a[0] * b[0] + a[1] * b[1] > 0);
  }
  assert.equal(mix(...fourth.to)[0], scene.waterfallOutletX);
  assert.equal(fourth.tailrace, undefined);
  assert.equal(waterfallTail[1], channel4BankY(waterfallTail[0]) - scene.channelWallHeights[4].left);
});

test('the two lower piers align with the middle right pair, both to the right of the tailrace', () => {
  const middle = towerLevels.find(level => level.tier === 'left-middle');
  const upperFeet = bay(middle).edges.right;
  assert.equal(lowerPierColumns.length, 2);
  for (const [i, pier] of lowerPierColumns.entries()) {
    assert.equal(pier.x, upperFeet[i][0]);
    assert.equal(pier.top + 5, upperFeet[i][1] + scene.wallDepth);
    const halfWidth = scene.lowerPierFootprint.halfWidth + scene.lowerPierFootprint.halfDepth;
    assert.ok(pier.x - halfWidth > scene.waterfallOutletX + 24);
  }
});

test('left and right waterway halves share geometry and overlap at the seam', () => {
  for (const segment of channelSegments) {
    const left = channelHalf(segment, 'left');
    const right = channelHalf(segment, 'right');
    assert.equal(left.from, right.from);
    assert.equal(left.to, right.to);
    assert.equal(left.cutX, right.cutX);
    assert.ok(left.maxX > right.minX);
    assert.ok(left.minX < right.minX && left.maxX < right.maxX);
    const turns = [...left.turns, ...right.turns];
    assert.equal(turns.length, segment.turns.length);
    assert.equal(new Set(turns).size, segment.turns.length);
    assert.equal(right.tailrace, undefined);
  }
});

test('lower piers reach the waterway bank and remain equally long', () => {
  const middle = towerLevels.find(level => level.tier === 'left-middle');
  const referenceMiddle = {
    ...middle, y: middle.y - scene.aqueductDrop,
    center: [middle.center[0], middle.center[1] - scene.aqueductDrop],
  };
  const referenceFeet = bay(referenceMiddle).edges.right;
  for (const [i, pier] of lowerPierColumns.entries()) {
    assert.equal(pier.bottom, channel4BankY(pier.x) - scene.channelWallHeights[4].left);
    assert.ok(Math.abs((pier.bottom - pier.top) - (lowerPierColumns[0].bottom - lowerPierColumns[0].top)) < 1e-9);
    const referenceTop = referenceFeet[i][1] + scene.wallDepth - 5;
    assert.ok(Math.abs(pier.top - referenceTop - scene.aqueductDrop) < 1e-9);
    assert.ok(pier.bottom > pier.top);
  }
  for (const tower of scene.towers) {
    const upper = towerLevels.find(level => level.tier === `${tower.id}-upper`);
    assert.ok(Math.abs((upper.y - upper.top) - (tower.y - tower.top)) < 1e-9);
    assert.ok(upper.y > tower.y && upper.top > tower.top);
  }
});

test('column bays, waterway corners and both families of banks share their directions', () => {
  const vector = (a, b) => b.map((value, i) => value - a[i]);
  const parallel = (a, b) => {
    const sine = (a[0] * b[1] - a[1] * b[0]) / (Math.hypot(...a) * Math.hypot(...b));
    assert.ok(Math.abs(sine) < 1e-10, `directions differ: ${a} / ${b}`);
  };
  const first = channelSegments.find(segment => segment.id === 1);
  const second = channelSegments.find(segment => segment.id === 2);
  const across = vector(first.from[0], first.to[0]);
  const receding = vector(second.from[0], second.to[0]);
  for (const segment of channelSegments) {
    const reference = segment.id % 2 ? across : receding;
    for (const i of [0, 1]) parallel(vector(segment.from[i], segment.to[i]), reference);
  }
  for (const level of towerLevels.filter(item => !item.pierBay)) {
    const [fl, fr, br, bl] = bay(level).corners;
    parallel(vector(fl, fr), across);
    parallel(vector(bl, br), across);
    parallel(vector(fr, br), receding);
    parallel(vector(fl, bl), receding);
  }
});

test('arch frames cover the capitals while remaining beneath the eaves', () => {
  const frame = scene.archFrame, bay = scene.towerBay, cap = scene.columnCap, eave = scene.towerEave;
  assert.ok(frame.halfWidth >= bay.halfWidth + cap.halfWidth);
  assert.ok(frame.halfDepth >= bay.halfDepth + cap.halfDepth);
  assert.ok(eave.halfWidth >= frame.halfWidth + 2);
  assert.ok(eave.halfDepth >= frame.halfDepth + 2);
});

test('four-column bays recover equal perpendicular sides under the orthographic square projection', () => {
  const alpha = 10 * Math.PI / 180, beta = 20 * Math.PI / 180;
  const elevation = Math.asin(Math.sqrt(Math.tan(alpha) * Math.tan(beta)));
  const azimuth = Math.atan(Math.sqrt(Math.tan(alpha) / Math.tan(beta)));
  const a = Math.cos(azimuth), b = Math.sin(azimuth);
  const c = Math.sin(elevation) * b, d = -Math.sin(elevation) * a;
  const unproject = ([x, y]) => [(d * x - b * y) / (a * d - b * c), (-c * x + a * y) / (a * d - b * c)];
  for (const level of towerLevels.filter(level => !level.pierBay)) {
    const corners = bay(level).corners.map(point => unproject(point.map((v, i) => v - level.center[i])));
    const edges = corners.map((p, i) => corners[(i + 1) % 4].map((v, axis) => v - p[axis]));
    for (const [i, edge] of edges.entries()) {
      assert.ok(Math.abs(Math.hypot(...edge) - 2 * scene.towerBay.halfSide) < 1e-9);
      const next = edges[(i + 1) % 4];
      assert.ok(Math.abs(edge[0] * next[0] + edge[1] * next[1]) < 1e-8);
    }
  }
});

test('the enlarged wheel fits above the outer waterway edge after horizontal reflection', () => {
  const radius = wheelRadius();
  const config = scene.wheel;
  assert.equal(radius, 64);
  const centerY = wheelCenterY();
  assert.ok(Number.isFinite(centerY));
  assert.ok(config.faceScale > .5 && config.faceScale < .7);
  const fourth = channelSegments.find(segment => segment.id === 4);
  const a = fourth.from[0], b = fourth.to[0];
  const slope = (b[1] - a[1]) / (b[0] - a[0]);
  for (const near of [false, true]) {
    for (let i = 0; i < 720; i++) {
      const angle = i * Math.PI / 360;
      const px = Math.cos(angle) * (radius + 3);
      const py = Math.sin(angle) * (radius + 3);
      const rawX = config.x + px * config.faceScale + (near ? config.depth[0] : 0);
      const x = config.flipX ? 2 * config.x + config.depth[0] - rawX : rawX;
      const y = centerY + py + px * config.faceShear + (near ? config.depth[1] : 0);
      assert.ok(y + 1 <= a[1] + (x - a[0]) * slope + 1e-8);
    }
  }
});

test('wide channel turns support the complete outer column bases and have progressively taller walls', () => {
  assert.ok(scene.channelFootprint.halfWidth >= scene.towerBay.halfWidth + 7.5);
  assert.ok(scene.channelFootprint.halfDepth >= scene.towerBay.halfDepth + 5.5);
  assert.ok(waterInset > 0 && waterInset < .5);
  for (const segment of channelSegments) {
    const water = straightWaterEdges(segment);
    assert.ok(Number.isInteger(water.height / brickCourseHeight));
    assert.equal(water.height - water.waterElevation, 2);
    assert.ok(water.waterElevation > 0 && water.waterElevation < water.height);
    // A 48-unit clear passage replaces the former 29.76-unit channel.
    assert.equal(2 * scene.channelFootprint.halfSide - 2 * scene.channelWallThickness, 48);
    for (const [edge, fraction] of [[water.near, waterInset], [water.far, 1 - waterInset]]) {
      assert.deepEqual(edge[0], mix(...segment.from, fraction));
      assert.deepEqual(edge[1], mix(...segment.to, fraction));
    }
  }
});

test('each channel rises by two discrete brick courses without a seam between clipped halves', () => {
  for(const segment of channelSegments) {
    const start=mix(...segment.from),end=mix(...segment.to);
    const expected=[2*segment.id-1,2*segment.id,2*segment.id+1];
    for(const [index,t] of [.1,.5,.9].entries()) assert.equal(wallHeightAt(segment,mix(start,end,t)),expected[index]*4);
    const left=channelHalf(segment,'left'),right=channelHalf(segment,'right');
    assert.equal(wallHeightAt(segment,left.cutX-1e-8),wallHeightAt(segment,right.cutX+1e-8));
    const samples=sampleSteppedEdge(segment,start,end);
    const risers=samples.slice(1).filter((p,i)=>Math.hypot(p[0]-samples[i][0],p[1]-samples[i][1])<1e-8);
    assert.equal(risers.length,2);
    for(const p of risers) {
      const i=samples.indexOf(p),before=samples[i-1];
      assert.equal(wallHeightAt(segment,p)-wallHeightAt(segment,before),4);
      assert.ok(Math.abs(wallTopAt(segment,p)[1]-wallTopAt(segment,before)[1]+4)<1e-8);
    }
  }
});

test('column feet rise onto the corner walls while their capitals retain their elevation', () => {
  for (const level of towerLevels.filter(level => !level.pierBay)) {
    const feet = columnFeet(level), corners = bay(level).corners;
    for (const [i, foot] of feet.entries()) {
      assert.equal(foot[0], corners[i][0]);
      assert.equal(foot[1], corners[i][1] - turnHeightAt(level.tier, corners[i]));
      const capital = level.top + corners[i][1] - level.y;
      assert.ok(foot[1] - capital > 50);
    }
  }
});

test('all straight-to-turn wall tops and water surfaces coincide across their complete interfaces', () => {
  for (const segment of channelSegments) {
    const water = straightWaterEdges(segment);
    for (const [edge, tier] of [[segment.from, segment.fromTier], [segment.to, segment.toTier]]) {
      if (!tier) continue;
      for (let i = 0; i <= 20; i++) {
        const p = mix(...edge, i / 20), turnHeight = turnHeightAt(tier, p);
        assert.ok(Math.abs(wallTopAt(segment, p)[1] - (p[1]-turnHeight)) < 1e-9);
        assert.ok(Math.abs(water.waterAt(p)[1] - (p[1] - turnHeight + scene.channelWaterFreeboard)) < 1e-9);
      }
    }
  }
});

test('merged corner banks support all four columns without closing the water passage', () => {
  const inside = (p, polygon) => {
    let result = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const a = polygon[i], b = polygon[j];
      if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) result = !result;
    }
    return result;
  };
  for (const turn of channelSegments.flatMap(segment => segment.turns)) {
    const banks = turnBanks(turn);
    assert.equal(banks.length, 2);
    const level = towerLevels.find(level => level.tier === turn.tier);
    for (const foot of bay(level).corners) assert.ok(banks.some(bank => inside(foot, bank)));
    assert.ok(banks.every(bank => !inside(level.center, bank)));
    const area = polygon => Math.abs(polygon.reduce((sum, p, i) => {
      const q = polygon[(i + 1) % polygon.length]; return sum + p[0] * q[1] - p[1] * q[0];
    }, 0)) / 2;
    const total = area(bay(level, scene.channelFootprint).corners);
    const bankFraction = banks.reduce((sum, bank) => sum + area(bank), 0) / total;
    assert.ok(Math.abs(bankFraction - (84 * 84 - 48 * 48 - 2 * 48 * 18) / (84 * 84)) < 1e-9);
  }
});

test('wheel faces remain upright while the axle follows the across direction', () => {
  const wheel = scene.wheel;
  assert.equal(wheel.faceShear, 0);
  assert.ok(Math.abs(wheel.depth[1] / -wheel.depth[0] - Math.tan(10 * Math.PI / 180)) < 1e-10);
});

test('platform front and waterfall landing meet the upper rim of the fourth channel wall', () => {
  assert.ok(millLift > 0);
  const v = -scene.mill.slide;
  const floorAtFall = projectPlane(millTerraceLayout.origin, waterfallTail[0] - millTerraceLayout.origin[0] - v, v);
  assert.ok(Math.abs(floorAtFall[1] - channel4RimOutlet[1]) < 1e-9);
  assert.deepEqual(waterfallTail, channel4RimOutlet);
  assert.equal(channel4RimOutlet[1], channel4BankY(channel4RimOutlet[0]) - 31);
  const terraceAtMill = projectPlane(millTerraceLayout.origin, millLayout.origin[0] - millTerraceLayout.origin[0], 0);
  assert.ok(Math.abs(terraceAtMill[1] - millLayout.origin[1]) < 1e-9);
  const shiftedBase = projectPlane(scene.millTerrace.origin, 0, scene.mill.slide);
  assert.ok(Math.abs(millTerraceLayout.origin[1] + millTerraceLayout.height - shiftedBase[1] - scene.millTerrace.height) < 1e-9);
  assert.equal(millLayout.width, scene.mill.width);
  assert.equal(millLayout.depth, scene.mill.depth);
  assert.equal(millLayout.height, scene.mill.height);
});

test('mill and foundation slide together along the long axis and emit matching stepped right walls', () => {
  const originalMill = [scene.mill.origin[0], scene.mill.origin[1] - millLift];
  const expected = projectPlane(originalMill, 0, scene.mill.slide);
  assert.deepEqual(millLayout.origin, expected);
  assert.ok(expected[0] < originalMill[0] && expected[1] > originalMill[1]);
  const oldTerrace = [scene.millTerrace.origin[0], scene.millTerrace.origin[1] - millLift];
  assert.deepEqual(millTerraceLayout.origin, projectPlane(oldTerrace, 0, scene.mill.slide));
  const walls = [...millFoundation().matchAll(/<polygon points="([^"]+)" class="[^"]*mill-foundation-right-wall[^"]*"/g)];
  assert.equal(walls.length, 2);
  let depth=0;
  for (const wall of walls) {
    const [a,b,c,d]=wall[1].split(' ').map(point=>point.split(',').map(Number));
    assert.ok(Math.abs((c[1]-d[1])/(c[0]-d[0])-(b[1]-a[1])/(b[0]-a[0]))<1e-9);
    depth+=b[0]-a[0];
    assert.ok(Math.abs((b[1]-a[1])/(b[0]-a[0])-scene.waterwayDirections.receding[1])<1e-9);
  }
  assert.ok(depth>225-millTerraceLayout.platformOutline[3][1]);
  const support=walls.find(w=>w[0].includes('mill-canal-support-wall'));
  const [a,b,c]=support[1].split(' ').map(p=>p.split(',').map(Number));
  const outer=wallRun(channelSegments[3],'near').outer;
  assert.equal(b[0],Math.max(...outer.map(p=>p[0])));
  assert.equal(c[1]-b[1],millTerraceLayout.canalSupportHeight);
  assert.ok(c[1]-b[1]<millTerraceLayout.height);
});

test('foundation aligns with the mill while the separate platform extends forward and around its left side', () => {
  const fronts=[...millFoundation().matchAll(/<polygon points="([^"]+)" class="stone-light wall-facing(?: mill-foundation-front-wall)?"/g)];
  assert.ok(fronts.some(match=>{
    const point=match[1].split(' ')[0].split(',').map(Number);
    return Math.hypot(...point.map((v,i)=>v-projectPlane(millTerraceLayout.origin,millTerraceLayout.garden.left,-20)[i]))<1e-9;
  }));
  const outline = millTerraceLayout.platformOutline;
  assert.ok(Math.min(...outline.map(p => p[0])) < 18);
  assert.ok(Math.max(...outline.map(p => p[1])) > millLayout.depth);
  const oldCorner = projectPlane(millTerraceLayout.origin, 330, -20);
  const newCorner = projectPlane(millTerraceLayout.origin, ...outline[3]);
  assert.ok(newCorner[0] < oldCorner[0] && newCorner[1] < oldCorner[1]);
  assert.ok(scene.lowerPierFootprint.halfWidth > 5 && scene.lowerPierFootprint.halfWidth < 6);
  assert.ok(scene.lowerPierFootprint.halfDepth > 4 && scene.lowerPierFootprint.halfDepth < 5);
});

test('right platform retains the pier anchor while its reduced projection has a matching foundation return', () => {
  const anchor = projectPlane(millTerraceLayout.origin, ...millPlatformAnchor);
  assert.ok(Math.abs(anchor[0] - lowerPierColumns[0].x) < 1e-9);
  assert.ok(Math.abs(anchor[1] - lowerPierColumns[0].bottom) < 1e-9);
  assert.ok(millRightPlatformOutline.length >= 4);
  assert.ok(millRightPlatformOutline.every(([u, v]) => u >= millPlatformAnchor[0] - 1e-9 && v <= millPlatformAnchor[1] + 1e-9));
  const wall=millTerraceLayout.outline, platform=millTerraceLayout.platformOutline;
  assert.deepEqual(wall.slice(1,5),platform.slice(3,7));
  assert.ok(platform[3][0]<330);
  assert.equal(millTerraceLayout.door.u,wall[1][0]);
  assert.ok(millTerraceLayout.door.v+millTerraceLayout.door.width<wall[2][1]);
  assert.ok(Math.max(...millTerraceLayout.platformOutline.map(p => p[0])) > 262);
  assert.match(millFoundation(), /id="escher-foundation-door" data-wall="right"/);
  assert.ok(millTerraceLayout.door.width * millTerraceLayout.door.height > 2 * 50 * 53);
});

test('far banks retain cap divisions without vertical joints while near banks keep both', () => {
  for (const segment of channelSegments) {
    const at = point => wallHeightAt(segment, point);
    const far = channelWall(wallRun(segment, 'far'), at);
    const near = channelWall(wallRun(segment, 'near'), at);
    assert.ok([...far.matchAll(/channel-cap-joint/g)].length > 2);
    assert.equal([...far.matchAll(/channel-vertical-joint/g)].length, 0);
    assert.ok([...near.matchAll(/channel-cap-joint/g)].length > 2);
    assert.ok([...near.matchAll(/channel-vertical-joint/g)].length > 2);
  }
});

test('the right apron fills the entire corner and its rail edge reaches the pier ground line', () => {
  const [outerFront, outerBack] = millTerraceLayout.platformOutline.slice(3, 5);
  assert.equal(outerFront[0], outerBack[0]);
  assert.equal(outerBack[1], millPlatformAnchor[1]);
  const polygon = millRightPlatformOutline;
  const area = Math.abs(polygon.reduce((sum, p, i) => {
    const q = polygon[(i + 1) % polygon.length]; return sum + p[0] * q[1] - p[1] * q[0];
  }, 0)) / 2;
  assert.ok(Math.abs(area - (outerBack[0] - millPlatformAnchor[0]) * (millPlatformAnchor[1] - outerFront[1])) < 1e-7);
});

test('straight side walls extend collinearly through junctions onto the column supports', () => {
  const strips = [];
  for (const segment of channelSegments) for (const bank of ['near', 'far']) {
    const run = wallRun(segment, bank);
    for (const [j, nodes] of [run.outer, run.inner].entries()) {
      const start = j ? mix(...segment.from, bank === 'near' ? waterInset : 1 - waterInset) : segment.from[bank === 'near' ? 0 : 1];
      const direction = segment.to[0].map((v, i) => v - segment.from[0][i]);
      const straightNodes = segment.fromTier === 'left-upper' && bank === 'far' ? nodes.slice(2) : nodes;
      for (const point of straightNodes) {
        const delta = point.map((v, i) => v - start[i]);
        assert.ok(Math.abs(direction[0] * delta[1] - direction[1] * delta[0]) < 1e-7);
      }
    }
    for (const [i, tier] of [[0, segment.fromTier], [-1, segment.toTier]]) {
      if (!tier) continue;
      for (const point of [run.outer.at(i), run.inner.at(i)]) {
        assert.ok(Math.abs(wallTopAt(segment, point)[1] - (point[1]-turnHeightAt(tier, point))) < 1e-8);
      }
    }
    strips.push([...run.outer, ...run.inner.toReversed()]);
  }
  const inside = (p, polygon) => {
    let result = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const a = polygon[i], b = polygon[j];
      if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) result = !result;
    }
    return result;
  };
  for (const level of towerLevels.filter(level => !level.pierBay)) {
    for (const point of bay(level).corners) assert.ok(strips.some(strip => inside(point, strip)));
    assert.ok(strips.every(strip => !inside(level.center, strip)));
  }
});

test('emitted mill and residential walls follow the two approved building directions', () => {
  const markup = [mill(), flatHouse({ id: 'test-house', origin: [654, 853], width: 171, depth: 52, height: 110 })];
  for (const svg of markup) {
    for (const [name, direction] of [['front', scene.waterwayDirections.across], ['side', scene.waterwayDirections.receding]]) {
      const pattern = new RegExp('<polygon points="([^\"]+)" class="[^\"]*building-' + name + '-wall');
      const match = svg.match(pattern);
      assert.ok(match);
      const points = match[1].split(' ').map(p => p.split(',').map(Number));
      const edge = points[1].map((value, i) => value - points[0][i]);
      const sine = (edge[0] * direction[1] - edge[1] * direction[0]) / (Math.hypot(...edge) * Math.hypot(...direction));
      assert.ok(Math.abs(sine) < 1e-10);
    }
  }
});


test('the front balcony turns outward only before the mill door wall and its brackets stay under that projection', () => {
  const outline=millTerraceLayout.platformOutline;
  assert.equal(outline[0][1],-36);
  assert.equal(outline[1][0],millLayout.width+43);
  assert.equal(outline[1][1],-36);
  assert.equal(outline[2][1],-20);
  const balcony=millBalcony();
  assert.equal([...balcony.matchAll(/class="balcony-bracket"/g)].length,4);
  for(const edge of millTerraceLayout.platformFrontEdges) assert.ok(balcony.includes(`data-platform-edge="${edge}"`));
  assert.equal(millTerraceLayout.platformRailEdges.includes(5),false);
});

test('the projecting room walls and platform roof have identical corners without an inset', () => {
  const {outline:w,platformOutline:p,door}=millTerraceLayout;
  assert.deepEqual(w.slice(1,5),p.slice(3,7));
  assert.equal(door.u,w[1][0]);
  assert.ok(door.v>w[1][1] && door.v+door.width<w[2][1]);
});

test('garden rear edge touches the foundation and its right side aligns with the projecting wall', () => {
  const {garden:g,height,door}=millTerraceLayout;
  for(const u of [0,gardenLayout.width]) {
    const depth=gardenLayout.depth;
    const gardenRear=projectPlane(gardenLayout.origin,u,depth);
    const wallFoot=projectPlane(millTerraceLayout.origin,g.left+u,gardenLayout.backV,-height+g.lift);
    assert.ok(Math.hypot(...gardenRear.map((v,i)=>v-wallFoot[i]))<1e-9);
  }
  assert.equal(g.right,door.u);
  assert.ok(g.gateWidth<gardenLayout.depth && g.gateHeight>32 && g.gateHeight<64);
  assert.ok(!millFoundation().includes('escher-garden-gate'));
  const markup=foreground();
  assert.match(markup,/id="escher-garden-gate" data-wall="garden-side"/);
  assert.match(markup,/class="garden-gate-grid" clip-path="url\(#escher-garden-gate-clip\)"/);
  assert.match(markup,/class="garden-gate-frame"/);
});


test('stepped water stays just below coping and well above its recalculated bed', () => {
  for(const segment of channelSegments) {
    const water=straightWaterEdges(segment);
    const points=sampleSteppedEdge(segment,...water.near);
    for(const p of points) {
      const top=wallTopAt(segment,p),surface=water.waterAt(p),base=wallBaseAt(segment,p);
      assert.ok(Math.abs(surface[1]-top[1]-2)<1e-9);
      assert.ok(surface[1]<base[1]);
    }
    const markup=channelWall(wallRun(segment,'near'),p=>wallHeightAt(segment,p));
    assert.equal([...markup.matchAll(/class="channel-step-edge"/g)].length,2);
  }
});


test('stepped walls expose only the upper and the requested side edges of each riser', () => {
  for(const segment of channelSegments) {
    const markup=channelWall(wallRun(segment,'near'),p=>wallHeightAt(segment,p));
    assert.ok(!markup.includes('channel-wall-step'));
    const edges=[...markup.matchAll(/<path d="([^"]+)" class="channel-step-edge" data-visible-edge="([^"]+)"/g)];
    assert.equal(edges.length,2);
    for(const [,d,side] of edges) {
      assert.equal(side,segment.id%2?'left':'right');
      assert.equal((d.match(/L/g)||[]).length,2);
      assert.ok(!d.endsWith('Z'));
    }
  }
});

test('tower column tops and block footprints follow the corrected common turn plane', () => {
  for(const level of towerLevels.filter(l=>!l.pierBay)) {
    const {center,corners}=bay(level),feet=columnFeet(level),caps=towerCapitals(level);
    const lengths=feet.map((foot,i)=>foot[1]-caps[i][1]);
    assert.ok(lengths.every(h=>Math.abs(h-lengths[0])<1e-8));
    for(let i=0;i<4;i++) {
      const j=(i+1)%4;
      assert.ok(Math.abs((feet[j][1]-feet[i][1])-(caps[j][1]-caps[i][1]))<1e-8);
    }
    for(const [u,v] of [[20,0],[0,20]]) {
      const point=projectTowerPlane(level.tier,center,u,v);
      const nominal=projectPlane(center,u,v);
      assert.ok(Math.abs(point[1]-center[1]-(nominal[1]-center[1]-turnHeightAt(level.tier,nominal)+turnHeightAt(level.tier,center)))<1e-8);
    }
    assert.deepEqual(projectTowerPlane(level.tier,center,0,0),center);
    assert.deepEqual(feet,corners.map(p=>[p[0],p[1]-turnHeightAt(level.tier,p)]));
  }
});


test('corrected turn coping and column footprints retain the channels 10/-20 degree axes', () => {
  const slopes=[scene.waterwayDirections.across[1],scene.waterwayDirections.receding[1]];
  const expectedCenterHeights={'left-upper':4,'right-upper':9,'left-middle':17,'right-lower':25};
  for(const level of towerLevels.filter(l=>!l.pierBay)) {
    const {center,corners}=bay(level);
    assert.equal(turnHeightAt(level.tier,center),expectedCenterHeights[level.tier]);
    const feet=columnFeet(level);
    for(let i=0;i<4;i++) {
      const j=(i+1)%4;
      assert.ok(Math.abs((feet[j][1]-feet[i][1])/(feet[j][0]-feet[i][0])-slopes[i%2])<1e-9);
      assert.equal(turnHeightAt(level.tier,corners[i]),turnHeightAt(level.tier,center));
    }
    for(const bank of turnBanks(channelSegments.flatMap(s=>s.turns).find(t=>t.tier===level.tier))) {
      for(let i=0;i<bank.length;i++) {
        const a=bank[i],b=bank[(i+1)%bank.length];
        const slope=(b[1]-a[1])/(b[0]-a[0]);
        assert.ok(slopes.some(expected=>Math.abs(slope-expected)<1e-9));
      }
    }
    for(const [u,v] of [[20,0],[0,20]]) assert.deepEqual(projectTowerPlane(level.tier,center,u,v),projectPlane(center,u,v));
  }
});


test('water guides remain straight across masonry steps and join the turn water at their endpoints', () => {
  for(const segment of channelSegments) {
    const water=straightWaterEdges(segment);
    const from=mix(...segment.from),to=mix(...segment.to);
    const a=water.guideAt(from),b=water.guideAt(to);
    for(const t of [0,.333333-1e-6,.333333+1e-6,.5,.666667-1e-6,.666667+1e-6,1]) {
      const actual=water.guideAt(mix(from,to,t)),expected=mix(a,b,t);
      assert.ok(Math.hypot(...actual.map((v,i)=>v-expected[i]))<1e-8);
    }
    for(const p of [from,to]) assert.ok(Math.abs(water.guideAt(p)[1]-water.waterAt(p)[1])<1e-8);
  }
});


test('foundation front is drawn as a single facade and planter gate ends at its wall corner', () => {
  const markup=millFoundation();
  assert.equal([...markup.matchAll(/class="stone-light wall-facing mill-foundation-front-wall"/g)].length,1);
  const actual=projectPlane(gardenLayout.origin,gardenLayout.width,gardenLayout.depth);
  assert.ok(Math.hypot(...actual.map((v,i)=>v-gardenLayout.abutment[i]))<1e-8);
  const {height,garden:g,outline}=millTerraceLayout;
  const expected=projectPlane(millTerraceLayout.origin,...outline[1],-height+g.lift);
  assert.deepEqual(gardenLayout.abutment,expected);
});


test('planter is a four-corner rectangle with both side planes aligned to the foundation', () => {
  const {outline,width,depth,leftU}=gardenLayout;
  assert.deepEqual(outline,[[0,0],[width,0],[width,depth],[0,depth]]);
  assert.equal(leftU,millTerraceLayout.outline[0][0]);
  assert.equal(leftU+width,millTerraceLayout.door.u);
  assert.ok(outline.some(corner=>projectPlane(gardenLayout.origin,...corner)[0]<0));
  const leftRear=projectPlane(gardenLayout.origin,0,depth);
  const expected=projectPlane(millTerraceLayout.origin,leftU,gardenLayout.backV,-millTerraceLayout.height+millTerraceLayout.garden.lift);
  assert.ok(Math.hypot(...leftRear.map((v,i)=>v-expected[i]))<1e-8);
});


test('planter side wall and iron gate bottoms meet the foundation ground at their shared corner', () => {
  const {height,garden:g,outline}=millTerraceLayout;
  const planterBottom=projectPlane(gardenLayout.origin,gardenLayout.width,gardenLayout.depth,-g.wallHeight);
  const buildingBottom=projectPlane(millTerraceLayout.origin,...outline[1],-height);
  assert.equal(g.lift,g.wallHeight);
  assert.ok(Math.hypot(...planterBottom.map((v,i)=>v-buildingBottom[i]))<1e-8);
});


test('channel floor occluder matches the actual door wall without hiding the pond', () => {
  const mask=millFoundationSideOutline();
  const walls=[...millFoundation().matchAll(/<polygon points="([^"]+)" class="[^"]*mill-foundation-right-wall[^"]*"/g)];
  assert.ok(walls.some(w=>JSON.stringify(w[1].split(' ').map(p=>p.split(',').map(Number)))===JSON.stringify(mask)));
  assert.ok(mask[2][1]>mask[1][1]);
  assert.ok(!foreground().includes('id="escher-terraced-homes"'));
});


test('wider lower canal storey exposes a roof setback and the right corner railing',()=>{
  const markup=millFoundation();
  assert.equal(scene.viewBox,'0 0 900 884');
  assert.equal(millTerraceLayout.canalSupportHeight,65);
  assert.ok(millTerraceLayout.canalLowerSetback>0);
  assert.match(markup,/id="escher-canal-lower-railing"/);
  const roof=markup.match(/points="([^"]+)" class="ground-plane terrace-floor mill-canal-lower-roof"/)[1].split(' ').map(p=>p.split(',').map(Number));
  assert.ok(roof[2][0]>roof[1][0]);
  assert.equal(roof.length,6);
  assert.ok(roof[3][0]<roof[2][0]);
  assert.ok(Math.abs(roof[0][0]-(435.73414728928435+748.4653792760298)/2)<1e-8);
  assert.ok(markup.indexOf('id="escher-canal-lower-railing"')<markup.indexOf('mill-canal-support-wall'));
  assert.ok(roof.every(p=>p[0]<900));
  const left=projectPlane(millTerraceLayout.origin,millTerraceLayout.outline[0][0],-20);
  assert.equal(left[0],millLayout.origin[0]);
});


test('only the unwanted rear rail is omitted and doorway exits have no stairs or paving',()=>{
  assert.equal(millTerraceLayout.platformRailEdges.includes(6),false);
  assert.match(millBalcony('rear'),/data-platform-edge="6"/);
  assert.ok(!foreground().includes('lower-courtyard'));
  assert.match(millFoundation(),/id="escher-foundation-door"/);
  assert.equal(gardenLayout.depth,180);
});


test('new garden has mixed dense growth and all four shifted braces meet the wall',()=>{
  const markup=foreground();
  assert.equal([...markup.matchAll(/class="garden-specimen"/g)].length,85);
  for(const kind of ['sponge','coral','curl','grass']) assert.ok(markup.includes(`data-kind="${kind}"`));
  const braces=[...millBalcony().matchAll(/<path d="([^"]+)" class="balcony-bracket"/g)];
  const x=braces.map(m=>Number(m[1].match(/^M([^,]+)/)[1]));
  for(let i=1;i<x.length;i++) assert.equal(x[i]-x[i-1],36);
  assert.ok(50>=millTerraceLayout.outline[0][0]);
});


test('mill gable and door facade form one five-corner wall without an eaves seam',()=>{
  const markup=mill();
  const match=markup.match(/points="([^"]+)" class="stone-light wall-facing building-front-wall"/);
  assert.equal(match[1].split(' ').length,5);
  assert.equal([...markup.matchAll(/class="stone-light"/g)].length,0);
});

