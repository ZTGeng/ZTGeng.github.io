import test from 'node:test';
import assert from 'node:assert/strict';
import { wheelRadius, wheelCenterY } from '../src/chapters/00-intro/escher/wheel.js';
import { mill, flatHouse, millDoorGround, millDoorGroundWalls, millFoundation, millBalcony, millFoundationSideOutline } from '../src/chapters/00-intro/escher/buildings.js';
import { foreground } from '../src/chapters/00-intro/escher/surroundings.js';
import { scene } from '../src/chapters/00-intro/escher/scene.js';
import { projectionAngles, projectPlane } from '../src/chapters/00-intro/escher/projection.js';
import { waterInset, straightWaterEdges, wallHeightAt, wallTopAt, wallBaseAt, sampleSteppedEdge, brickCourseHeight, wallRun, channelWall } from '../src/chapters/00-intro/escher/channel-walls.js';
import { bay, mix, towerLevels, columnShaftLength, channelSegments, structuralOrder, lowerPierColumns, channelHalf, channel4BankY, channel4Slope, channel4Pitch, channel4Outlet, channel4WaterOutlet, projectMillPlane, referenceMillPlatformAnchor, waterfallTail, columnFeet, towerCapitals, projectTowerPlane, turnHeightAt, turnBanks, channel4RimOutlet, millLayout, millTerraceLayout, millLift, millPlatformAnchor, millPlatformApronStartU, millRightPlatformOutline, gardenLayout, projectFoundationPoint, projectGardenPoint } from '../src/chapters/00-intro/escher/channel-layout.js';

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

test('channel 4 and its turn point toward the fixed wheel bottom', () => {
  const fourth=channelSegments[3];
  for(const i of [0,1]) {
    const d=fourth.to[i].map((v,k)=>v-fourth.from[i][k]);
    assert.ok(Math.abs(d[1]/d[0]-channel4Slope)<1e-10);
  }
  assert.ok(Math.hypot(...channel4WaterOutlet.map((v,i)=>v-channel4Outlet[i]))<1e-9);
  assert.equal(wheelCenterY(),552.1089319438277);
  assert.equal(scene.showBridgeComplex,true);
  assert.ok(Math.abs(waterfallTail[1]-634.3559741401601)<1e-9);
});

test('the two lower piers align with the middle right pair, both to the right of the tailrace', () => {
  const middle = towerLevels.find(level => level.tier === 'left-middle');
  const upperFeet = bay(middle).edges.right;
  assert.equal(lowerPierColumns.length, 2);
  for (const [i, pier] of lowerPierColumns.entries()) {
    assert.equal(pier.x, upperFeet[i][0]);
    assert.equal(pier.top + 5, upperFeet[i][1] + scene.wallDepth);
    const halfWidth = scene.lowerPierFootprint.halfWidth + scene.lowerPierFootprint.halfDepth;
    assert.ok(pier.x - halfWidth > waterfallTail[0]+5+scene.waterfallOffsetX+10);
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

test('lower piers retain aligned tops and reach the pitched bank', () => {
  const middle = towerLevels.find(level => level.tier === 'left-middle');
  const referenceMiddle = {
    ...middle, y: middle.y - scene.aqueductDrop,
    center: [middle.center[0], middle.center[1] - scene.aqueductDrop],
  };
  const referenceFeet = bay(referenceMiddle).edges.right;
  for (const [i, pier] of lowerPierColumns.entries()) {
    const centerU=-scene.channelFootprint.halfWidth*waterInset;
    assert.ok(Math.abs(pier.bottom-(channel4BankY(pier.x)+centerU*(scene.waterwayDirections.across[1]-channel4Slope)-scene.channelWallHeights[4].left))<1e-9);
    const referenceTop = referenceFeet[i][1] + scene.wallDepth - 5;
    assert.ok(Math.abs(pier.top - referenceTop - scene.aqueductDrop) < 1e-9);
    assert.ok(pier.bottom > pier.top);
  }
  for (const tower of scene.towers) {
    const upper = towerLevels.find(level => level.tier === `${tower.id}-upper`);
    assert.ok(columnShaftLength > 0);
    assert.ok(upper.y > tower.y);
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
    const reference = segment.id===4 ? [1,channel4Slope] : segment.id % 2 ? across : receding;
    if(segment.id===3) parallel(vector(mix(...segment.from),mix(...segment.to)),across);
    else for (const i of [0, 1]) parallel(vector(segment.from[i], segment.to[i]), reference);
  }
  for (const level of towerLevels.filter(item => !item.pierBay)) {
    const [fl, fr, br, bl] = bay(level).corners;
    parallel(vector(fl, fr), across);
    parallel(vector(bl, br), across);
    const run=level.tier==='right-lower'?[1,channel4Slope]:receding;
    parallel(vector(fr, br), run);
    parallel(vector(fl, bl), run);
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
    const corners = bay(level).corners.map((point,i) => {
      const delta=point.map((v,k)=>v-level.center[k]);
      if(level.tier==='right-lower') delta[1]-=channel4Pitch*scene.towerBay.halfDepth*(i<2?-1:1);
      return unproject(delta);
    });
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
  assert.ok(scene.channelFootprint.halfWidth >= scene.towerBay.halfWidth + scene.columnBase.halfWidth);
  assert.ok(scene.channelFootprint.halfDepth >= scene.towerBay.halfDepth + scene.columnBase.halfDepth);
  assert.ok(waterInset > 0 && waterInset < .5);
  for (const segment of channelSegments) {
    const water = straightWaterEdges(segment);
    assert.ok(Number.isInteger(water.height / brickCourseHeight));
    assert.equal(water.height - water.waterElevation, 2);
    assert.ok(water.waterElevation > 0 && water.waterElevation < water.height);
    // Widen the banks while retaining at least the previous clear passage.
    assert.ok(2 * scene.channelFootprint.halfSide - 2 * scene.channelWallThickness>=48);
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
    for(const [index,t] of [.1,.5,.9].entries()) assert.equal(wallHeightAt(segment,mix(start,end,t)),expected[index]*brickCourseHeight);
    const left=channelHalf(segment,'left'),right=channelHalf(segment,'right');
    assert.equal(wallHeightAt(segment,left.cutX-1e-8),wallHeightAt(segment,right.cutX+1e-8));
    const samples=sampleSteppedEdge(segment,start,end);
    const risers=samples.slice(1).filter((p,i)=>Math.hypot(p[0]-samples[i][0],p[1]-samples[i][1])<1e-8);
    assert.equal(risers.length,2);
    for(const p of risers) {
      const i=samples.indexOf(p),before=samples[i-1];
      assert.equal(wallHeightAt(segment,p)-wallHeightAt(segment,before),brickCourseHeight);
      assert.ok(Math.abs(wallTopAt(segment,p)[1]-wallTopAt(segment,before)[1]+brickCourseHeight)<1e-8);
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
    for (const foot of bay(level).corners) {
      for(const u of [-scene.columnBase.halfWidth,scene.columnBase.halfWidth])
        for(const v of [-scene.columnBase.halfDepth,scene.columnBase.halfDepth])
          assert.ok(banks.some(bank=>inside(projectTowerPlane(level.tier,foot,u,v),bank)));
    }
    assert.ok(banks.every(bank => !inside(level.center, bank)));
    const area = polygon => Math.abs(polygon.reduce((sum, p, i) => {
      const q = polygon[(i + 1) % polygon.length]; return sum + p[0] * q[1] - p[1] * q[0];
    }, 0)) / 2;
    const total = area(bay(level, scene.channelFootprint).corners);
    const bankFraction = banks.reduce((sum, bank) => sum + area(bank), 0) / total;
    assert.ok(Math.abs(bankFraction - ((2*scene.channelFootprint.halfSide)**2-(2*scene.channelFootprint.halfSide-2*scene.channelWallThickness)**2-2*(2*scene.channelFootprint.halfSide-2*scene.channelWallThickness)*scene.channelWallThickness)/(2*scene.channelFootprint.halfSide)**2) < 1e-9);
  }
});

test('wheel faces remain upright while the axle follows the across direction', () => {
  const wheel = scene.wheel;
  assert.equal(wheel.faceShear, 0);
  assert.ok(Math.abs(wheel.depth[1] / -wheel.depth[0] - Math.tan(10 * Math.PI / 180)) < 1e-10);
});

test('platform front and waterfall landing meet the upper rim of the fourth channel wall', () => {
  assert.ok(millLift > 0);
  const dx=waterfallTail[0]-millTerraceLayout.origin[0];
  const v=(waterfallTail[1]-millTerraceLayout.origin[1]-dx*scene.waterwayDirections.across[1])/(channel4Slope-scene.waterwayDirections.across[1]);
  const floorAtFall = projectMillPlane(millTerraceLayout.origin, waterfallTail[0] - millTerraceLayout.origin[0] - v, v);
  assert.ok(Math.abs(floorAtFall[1] - waterfallTail[1]) < 1e-9);
  assert.ok(Math.abs(waterfallTail[1]-634.3559741401601)<1e-9);
  assert.equal(channel4RimOutlet[1], channel4BankY(channel4RimOutlet[0]) - scene.channelWallHeights[4].left);
  const terraceAtMill = projectMillPlane(millTerraceLayout.origin, millLayout.origin[0] - millTerraceLayout.origin[0], 0);
  assert.ok(Math.abs(terraceAtMill[1] - millLayout.origin[1]) < 1e-9);
  const shiftedBase = projectPlane(scene.millTerrace.origin, 0, scene.mill.slide);
  assert.ok(Math.abs(millTerraceLayout.origin[1] + millTerraceLayout.referenceHeight - shiftedBase[1] - scene.millTerrace.height) < 1e-9);
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
  assert.equal(walls.length, 1);
  let depth=0;
  for (const wall of walls) {
    const [a,b,c,d]=wall[1].split(' ').map(point=>point.split(',').map(Number));
    assert.ok(c[0]-d[0] < b[0]-a[0]);
    depth+=b[0]-a[0];
    assert.ok(Math.abs((b[1]-a[1])/(b[0]-a[0])-channel4Slope)<1e-9);
  }
  assert.ok(depth>70);
  assert.ok(!millFoundation().includes('mill-canal-support-wall'));

});

test('foundation aligns with the mill while the separate platform extends forward and around its left side', () => {
  const fronts=[...millFoundation().matchAll(/<polygon points="([^"]+)" class="stone-light wall-facing(?: mill-foundation-front-wall)?"/g)];
  assert.ok(fronts.some(match=>{
    const point=match[1].split(' ')[0].split(',').map(Number);
    return Math.hypot(...point.map((v,i)=>v-projectMillPlane(millTerraceLayout.origin,millTerraceLayout.garden.left,-20)[i]))<1e-9;
  }));
  const outline = millTerraceLayout.platformOutline;
  assert.ok(Math.min(...outline.map(p => p[0])) < 18);
  assert.ok(Math.max(...outline.map(p => p[1])) > millLayout.depth);
  const oldCorner = projectMillPlane(millTerraceLayout.origin, 330, -20);
  const newCorner = projectMillPlane(millTerraceLayout.origin, ...outline[3]);
  assert.ok(newCorner[0] < oldCorner[0] && newCorner[1] < oldCorner[1]);
  assert.ok(scene.lowerPierFootprint.halfWidth > 5.75);
  assert.ok(scene.lowerPierFootprint.halfDepth > 4.6);
});

test('right platform retains the pier anchor while its reduced projection has a matching foundation return', () => {
  const anchor = projectMillPlane(millTerraceLayout.origin, ...millPlatformAnchor);
  assert.ok(Math.abs(anchor[0] - lowerPierColumns[0].x) < 1e-9);
  assert.ok(Math.abs(anchor[1]-624.7165777178153)<1e-9);
  assert.ok(millRightPlatformOutline.length >= 4);
  assert.ok(millRightPlatformOutline.every(([u, v]) => u >= millPlatformApronStartU - 1e-9 && v <= referenceMillPlatformAnchor[1] + 1e-9));
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

test('the deferred apron covers the full room roof up to the house and rear wall', () => {
  const [outerFront, outerBack] = millTerraceLayout.platformOutline.slice(3, 5);
  assert.equal(outerFront[0], outerBack[0]);
  assert.equal(outerBack[1], referenceMillPlatformAnchor[1]);
  const polygon = millRightPlatformOutline;
  const area = Math.abs(polygon.reduce((sum, p, i) => {
    const q = polygon[(i + 1) % polygon.length]; return sum + p[0] * q[1] - p[1] * q[0];
  }, 0)) / 2;
  const overhang=(millTerraceLayout.platformOutline[1][0]-millPlatformApronStartU)*16;
  const roof=(outerBack[0]-millPlatformApronStartU)*(referenceMillPlatformAnchor[1]-outerFront[1]);
  assert.ok(Math.abs(area-roof-overhang)<1e-7);
  assert.equal(millPlatformApronStartU+millTerraceLayout.origin[0],millLayout.origin[0]+millLayout.width);
});

test('straight side walls extend collinearly through junctions onto the column supports', () => {
  const strips = [];
  for (const segment of channelSegments) for (const bank of ['near', 'far']) {
    const run = wallRun(segment, bank);
    for (const [j, nodes] of [run.outer, run.inner].entries()) {
      const start = j ? mix(...segment.from, bank === 'near' ? waterInset : 1 - waterInset) : segment.from[bank === 'near' ? 0 : 1];
      const direction = (j?mix(...segment.to,bank==='near'?waterInset:1-waterInset):segment.to[bank==='near'?0:1]).map((v,i)=>v-start[i]);
      const straightNodes = segment.id===3 ? nodes.slice(1,3) : segment.fromTier === 'left-upper' && bank === 'far' ? nodes.slice(2) : nodes;
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
    for (const [name, direction] of [['front', scene.waterwayDirections.across], ['side', svg===markup[0]?[1,channel4Slope]:scene.waterwayDirections.receding]]) {
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
  assert.ok(Math.abs(door.v+door.width/2-(w[1][1]+w[2][1])/2)<1e-9);
});

test('garden rear edge touches the foundation and its right side aligns with the projecting wall', () => {
  const {garden:g,height,door}=millTerraceLayout;
  for(const u of [0,gardenLayout.width]) {
    const depth=gardenLayout.depth;
    const gardenRear=projectMillPlane(gardenLayout.origin,u,depth);
    const wallFoot=projectMillPlane(millTerraceLayout.origin,g.left+u,gardenLayout.backV,-height+g.lift);
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
      assert.ok(surface[1]-top[1]>=2-1e-8);
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
      assert.ok(Math.abs(point[1]-center[1]-(nominal[1]-center[1]+(level.tier==='right-lower'?channel4Pitch*v:0)-turnHeightAt(level.tier,nominal)+turnHeightAt(level.tier,center)))<1e-8);
    }
    assert.deepEqual(projectTowerPlane(level.tier,center,0,0),center);
    assert.deepEqual(feet,corners.map(p=>[p[0],p[1]-turnHeightAt(level.tier,p)]));
  }
});


test('corrected turn coping and column footprints retain the channels 10/-20 degree axes', () => {
  const slopes=[scene.waterwayDirections.across[1],scene.waterwayDirections.receding[1]];
  const expectedCenterHeights={'left-upper':8,'right-upper':24,'left-middle':40,'right-lower':56};
  for(const level of towerLevels.filter(l=>!l.pierBay)) {
    const {center,corners}=bay(level);
    const tierSlopes=level.tier==='right-lower'?[slopes[0],channel4Slope]:slopes;
    assert.equal(turnHeightAt(level.tier,center),expectedCenterHeights[level.tier]);
    const feet=columnFeet(level);
    for(let i=0;i<4;i++) {
      const j=(i+1)%4;
      assert.ok(Math.abs((feet[j][1]-feet[i][1])/(feet[j][0]-feet[i][0])-tierSlopes[i%2])<1e-9);
      assert.equal(turnHeightAt(level.tier,corners[i]),turnHeightAt(level.tier,center));
    }
    for(const bank of turnBanks(channelSegments.flatMap(s=>s.turns).find(t=>t.tier===level.tier))) {
      for(let i=0;i<bank.length;i++) {
        const a=bank[i],b=bank[(i+1)%bank.length];
        const slope=(b[1]-a[1])/(b[0]-a[0]);
        assert.ok(tierSlopes.some(expected=>Math.abs(slope-expected)<1e-9));
      }
    }
    for(const [u,v] of [[20,0],[0,20]]) {const expected=projectPlane(center,u,v);if(level.tier==='right-lower') expected[1]+=channel4Pitch*v;assert.deepEqual(projectTowerPlane(level.tier,center,u,v),expected);}
  }
});


test('waterline and animated guides share a continuous surface below every wall step',()=>{
 for(const segment of channelSegments){
  const water=straightWaterEdges(segment);
  for(let i=0;i<=300;i++){
   const t=i/300;
   for(const v of [waterInset,.5,1-waterInset]){
    const p=mix(mix(...segment.from,v),mix(...segment.to,v),t);
    assert.deepEqual(water.guideAt(p),water.waterAt(p));
    assert.ok(water.waterAt(p)[1]>=wallTopAt(segment,p)[1]+2-1e-8);
    assert.ok(water.waterAt(p)[1]<p[1]);
   }
  }
  for(const t of [1/3,2/3]){
   const p1=water.waterAt(mix(mix(...segment.from),mix(...segment.to),t-1e-7));
   const p2=water.waterAt(mix(mix(...segment.from),mix(...segment.to),t+1e-7));
   assert.ok(Math.hypot(p1[0]-p2[0],p1[1]-p2[1])<.001);
  }
 }
});


test('foundation front is drawn as a single facade and planter gate ends at its wall corner', () => {
  const markup=millFoundation();
  assert.equal([...markup.matchAll(/class="stone-light wall-facing mill-foundation-front-wall"/g)].length,1);
  const actual=projectGardenPoint(gardenLayout.width,gardenLayout.depth);
  assert.ok(Math.hypot(...actual.map((v,i)=>v-gardenLayout.abutment[i]))<1e-8);
  const {height,garden:g,outline}=millTerraceLayout;
  const expected=projectFoundationPoint(...outline[1],-height+g.lift);
  assert.deepEqual(gardenLayout.abutment,expected);
});


test('planter soil expands left and wraps behind the foundation while its right wall remains aligned', () => {
  const {outline,width,depth,leftU}=gardenLayout;
  assert.deepEqual(outline,[[gardenLayout.soilLeft,0],[width,0],[width,depth],[0,depth],[0,depth+millTerraceLayout.garden.soilRearExtension],[gardenLayout.soilLeft,depth+millTerraceLayout.garden.soilRearExtension]]);
  assert.ok(gardenLayout.soilLeft<0);
  assert.equal(leftU,millTerraceLayout.outline[0][0]);
  assert.equal(leftU+width,millTerraceLayout.door.u);
  assert.ok(outline.some(corner=>projectMillPlane(gardenLayout.origin,...corner)[0]<0));
  const leftRear=projectMillPlane(gardenLayout.origin,0,depth);
  const expected=projectMillPlane(millTerraceLayout.origin,leftU,gardenLayout.backV,-millTerraceLayout.height+millTerraceLayout.garden.lift);
  assert.ok(Math.hypot(...leftRear.map((v,i)=>v-expected[i]))<1e-8);
});


test('planter side wall and iron gate bottoms meet the foundation ground at their shared corner', () => {
  const {height,garden:g,outline}=millTerraceLayout;
  const planterBottom=projectMillPlane(gardenLayout.origin,gardenLayout.width,gardenLayout.depth,-g.wallHeight);
  const buildingBottom=projectMillPlane(millTerraceLayout.origin,...outline[1],-height);
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
  assert.equal(scene.viewBox,'0 0 900 800');
  assert.equal(millTerraceLayout.canalSupportHeight,0);
  assert.equal(millTerraceLayout.canalSupportHeight+millTerraceLayout.canalLowerHeight,160);
  assert.ok(millTerraceLayout.canalLowerSetback>0);
  assert.match(markup,/id="escher-canal-lower-railing"/);
  const roof=markup.match(/points="([^"]+)" class="ground-plane terrace-floor mill-canal-lower-roof"/)[1].split(' ').map(p=>p.split(',').map(Number));
  assert.ok(roof[2][0]>roof[1][0]);
  assert.equal(roof.length,6);
  assert.ok(roof[3][0]<roof[2][0]);
  assert.ok(!markup.includes('mill-canal-support-wall'));
  const channel=channelSegments[3],outer=wallRun(channel,'near').outer;
  const end=outer.reduce((a,b)=>a[0]>b[0]?a:b);
  assert.deepEqual(roof[5],[end[0],end[1]+scene.wallDepth]);
  assert.ok(Math.abs((roof[5][1]-roof[0][1])/(roof[5][0]-roof[0][0])-channel4Slope)<1e-9);
  const gap=projectMillPlane(roof[5],millTerraceLayout.canalLowerSetback,
    millTerraceLayout.canalLowerSetback*scene.channelFootprint.halfDepth/scene.channelFootprint.halfWidth);
  assert.deepEqual(roof[2],gap);
  const lower=markup.match(/points="([^"]+)" class="stone-mid wall-receding mill-canal-lower-wall"/)[1].split(' ').map(p=>p.split(',').map(Number));
  assert.equal(lower[2][1]-lower[1][1],160);
  assert.ok(markup.indexOf('id="escher-canal-lower-railing"')>markup.indexOf('id="escher-canal-lower-railing-rear"'));
  assert.ok(roof.every(p=>p[0]<900));
  const left=projectMillPlane(millTerraceLayout.origin,millTerraceLayout.outline[0][0],-20);
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



test('resizing structural bays preserves the mill, fall and tower centers and vertical tier alignments',()=>{
  assert.ok(Math.abs(millLayout.origin[0]-109)<1e-9);
  assert.ok(Math.abs(millLayout.origin[1]-617.0901301853702)<1e-9);
  assert.ok(scene.columnRadius>6 && scene.columnBase.halfWidth>7.5);
  for(const ids of [['left-upper','left-middle'],['right-upper','right-lower']]) {
    const [a,b]=ids.map(id=>towerLevels.find(l=>l.tier===id));
    const aa=bay(a).corners,bb=bay(b).corners;
    aa.forEach((p,i)=>assert.equal(p[0],bb[i][0]));
  }
});


test('wide cross bridge, house and descending platform share their structural anchors',async()=>{
  const {crossBridgeLayout:c,crossBridge}=await import('../src/chapters/00-intro/escher/cross-bridge.js');
  assert.equal(c.previousFrontV+c.platformOrigin[0],lowerPierColumns[0].x);
  assert.equal(c.backV,28);
  assert.equal(c.backV-c.frontV,(c.backV-c.previousFrontV)/2);
  assert.ok(c.backV-c.frontV>75&&c.backV-c.frontV<90);
  assert.ok(c.houseMaxV-c.houseMinV>c.backV-c.frontV);
  assert.equal(c.deck-c.ground,64);
  assert.ok(c.ground+c.archHeight<c.deck);
  const end=projectMillPlane(c.platformOrigin,...c.platformLeft,c.ground);
  assert.ok(Math.hypot(...end.map((v,i)=>v-c.platformDoorEdge[i]))<1e-8);
  for(const u of [c.end,c.end+c.houseWidth]) for(const v of [c.houseMinV,c.houseMaxV]) {
    assert.ok(projectMillPlane(c.origin,u,v,c.houseBottom)[1]+scene.compositionOffsetY>884);
  }
  const markup=crossBridge();
  assert.equal([...markup.matchAll(/class="bridge-raised-edge"/g)].length,2);
  assert.equal([...markup.matchAll(/class="window-dark"/g)].length,scene.showBridgeHouse?5:2);
  assert.equal(markup.includes('id="escher-bridge-house"'),scene.showBridgeHouse);
  assert.ok(!markup.includes('id="escher-bridge-platform-stairs"'));
});


test('bridge parapet and arch wall share one facade while the lower terrace has only level axis-aligned edges',async()=>{
  const {crossBridgeLayout:c,crossBridge}=await import('../src/chapters/00-intro/escher/cross-bridge.js');
  const markup=crossBridge();
  const facade=markup.match(/points="([^"]+)" class="stone-light wall-facing bridge-front-wall"/)[1].split(' ').map(p=>p.split(',').map(Number));
  assert.deepEqual(facade[0],projectMillPlane(c.origin,0,c.frontV,c.deck+c.edgeHeight));
  assert.deepEqual(facade[3],projectMillPlane(c.origin,0,c.frontV,c.wallBottom));
  assert.equal(c.wallBottom,2*c.ground);

});


test('bridge slides one more coping brick and its removed bank steps do not render',async()=>{
  const {crossBridgeLayout:c,crossBridge}=await import('../src/chapters/00-intro/escher/cross-bridge.js');
  assert.equal(c.end,150);
  assert.equal(c.platformEnd,150);
  assert.deepEqual(c.origin,projectMillPlane(c.platformOrigin,0,45-2*29/Math.hypot(1,channel4Slope)));
  assert.equal(c.deck+c.edgeHeight,0);
  assert.equal(c.deck,-brickCourseHeight);
  const markup=crossBridge();
  assert.ok(!markup.includes('id="escher-bridge-bank-steps"'));
  assert.equal([...markup.matchAll(/bridge-bank-step-side/g)].length,0);
  assert.ok(c.archHeight>46);
});


test('bridge house has a true square section centered on the bridge and a roof just above both parapets',async()=>{
  const {crossBridgeLayout:c,crossBridge}=await import('../src/chapters/00-intro/escher/cross-bridge.js');
  const depth=c.houseMaxV-c.houseMinV;
  const ratio=scene.towerBay.halfWidth/scene.towerBay.halfDepth;
  assert.ok(Math.abs(c.houseWidth/depth-ratio)<1e-10);
  assert.equal((c.houseMinV+c.houseMaxV)/2,(c.frontV+c.backV)/2);
  assert.ok(depth>(c.backV-c.frontV)*1.2 && depth<(c.backV-c.frontV)*1.3);
  assert.ok(c.houseRoof>c.deck+c.edgeHeight && c.houseRoof<c.deck+c.edgeHeight+10);
  assert.match(crossBridge(),/id="escher-bridge-house"/);
});


test('bridge keeps its approved arch height independently of the removed upper storey',async()=>{
  const {crossBridgeLayout:c}=await import('../src/chapters/00-intro/escher/cross-bridge.js');
  const delta=c.platformLift;
  assert.equal(delta,36);
  assert.equal(millTerraceLayout.canalSupportHeight,0);
  assert.equal(c.ground-c.referenceGround,delta);
  assert.equal(c.archHeight,56);
  assert.equal(c.platformRise,15+delta);
  const end=projectMillPlane(c.platformOrigin,...c.platformLeft,c.ground);
  assert.ok(Math.hypot(...end.map((v,i)=>v-c.platformDoorEdge[i]))<1e-9);
});


test('doubled courses and tier bases leave equal shafts and close both intermediate ceilings', () => {
  assert.equal(brickCourseHeight, Math.ceil(4 * 2));
  const counts={'left-upper':7,'right-upper':5,'left-middle':3,'right-lower':1};
  for(const level of towerLevels.filter(l=>!l.pierBay)) {
    assert.equal(scene.columnBaseHeights[level.tier],counts[level.tier]*brickCourseHeight);
    const feet=columnFeet(level),caps=towerCapitals(level);
    feet.forEach((p,i)=>assert.ok(Math.abs(p[1]-scene.columnBaseHeights[level.tier]-2-caps[i][1]-15-columnShaftLength)<1e-9));
  }
  for(const [lower,upper] of [['left-middle','left-upper'],['right-lower','right-upper']]) {
    const level=towerLevels.find(l=>l.tier===lower);
    const above=towerLevels.find(l=>l.tier===upper);
    const capTop=level.top-9-scene.intermediateArch.top-scene.intermediateArch.capThickness;
    assert.ok(Math.abs(capTop-above.center[1]-scene.wallDepth)<1e-9);
  }
  assert.equal(scene.compositionOffsetY+scene.backgroundOffsetY,-36);
});


test('clip seams preserve wall crossings and include the channel 1/2 floor-thickness conflict', () => {
  function cells(segment, includeFloor=false) {
    return ['near','far'].flatMap(bank=>{
      const run=wallRun(segment,bank);
      const outer=sampleSteppedEdge(segment,run.outer[1],run.outer[2]);
      const inner=sampleSteppedEdge(segment,run.inner[1],run.inner[2]);
      const up=p=>wallTopAt(segment,p),base=p=>wallBaseAt(segment,p);
      return outer.slice(1).flatMap((b,i)=>{
        const a=outer[i],c=inner[i+1],d=inner[i];
        return [[base(a),base(b),up(b),up(a)],[up(a),up(b),up(c),up(d)],[base(d),base(c),up(c),up(d)],
          ...(includeFloor?[[base(a),base(b),[b[0],b[1]+scene.wallDepth],[a[0],a[1]+scene.wallDepth]]]:[])];
      });
    });
  }
  function inside(p,poly) {
    let yes=false;
    for(let i=0,j=poly.length-1;i<poly.length;j=i++) {
      const a=poly[i],b=poly[j];
      if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0]) yes=!yes;
    }
    return yes;
  }
  function intersections(a,b) {
    const points=[...a.filter(p=>inside(p,b)),...b.filter(p=>inside(p,a))];
    for(let i=0;i<a.length;i++) for(let j=0;j<b.length;j++) {
      const p=a[i],q=b[j],d=a[(i+1)%a.length].map((x,k)=>x-p[k]),e=b[(j+1)%b.length].map((x,k)=>x-q[k]);
      const det=d[0]*e[1]-d[1]*e[0];
      if(Math.abs(det)<1e-9) continue;
      const v=q.map((x,k)=>x-p[k]);
      const t=(v[0]*e[1]-v[1]*e[0])/det,u=(v[0]*d[1]-v[1]*d[0])/det;
      if(t>=0&&t<=1&&u>=0&&u<=1) points.push(p.map((x,k)=>x+t*d[k]));
    }
    return points;
  }
  const paintedIndex=(segment,p)=>Math.max(...['left','right'].filter(side=>{
    const half=channelHalf(segment,side);
    return p[0]>=half.minX&&p[0]<=half.maxX;
  }).map(side=>structuralOrder.indexOf(`channel-${segment.id}-${side}`)));
  for(const [back,front] of [[1,2],[2,3],[3,4]]) {
    const a=channelSegments[back-1],b=channelSegments[front-1];
    // Include the newly reported floor overlap and its adjacent 2/3 crossing.
    // Keep the existing 3/4 side-wall regression at its original scope.
    const includeFloor=front<=3;
    const overlap=cells(a,includeFloor).flatMap(p=>cells(b,includeFloor).flatMap(q=>intersections(p,q)));
    assert.ok(overlap.length>0);
    for(const p of overlap) assert.ok(paintedIndex(b,p)>paintedIndex(a,p),`channel ${front} must cover ${back} at ${p}`);
  }
});


test('pitched fourth turn and complete pier feet have continuous coping supports',()=>{
  const segment=channelSegments[3],run=wallRun(segment,'near');
  const start=mix(run.outer[1],run.outer[2],.7),inner=mix(run.inner[1],run.inner[2],.7);
  const cap=[start,run.outer.at(-1),run.inner.at(-1),inner].map(p=>wallTopAt(segment,p));
  const inside=p=>{
    const signs=cap.map((a,i)=>{const b=cap[(i+1)%cap.length];return (b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);});
    return signs.every(v=>v>=-1e-8)||signs.every(v=>v<=1e-8);
  };
  const {halfWidth:u,halfDepth:v}=scene.lowerPierFootprint;
  for(const pier of lowerPierColumns) for(const [a,b] of [[-u,-v],[u,-v],[u,v],[-u,v]]) {
    const foot=projectPlane([pier.x,pier.bottom],a,b);foot[1]+=channel4Pitch*b;
    assert.ok(inside(foot),`unsupported pier ${foot}`);
  }
  const level=towerLevels.find(l=>l.tier==='right-lower');
  const upper=towerLevels.find(l=>l.tier==='right-upper');
  assert.deepEqual(bay(level).corners.map(p=>p[0]),bay(upper).corners.map(p=>p[0]));
  for(const bank of ['near','far']) {
    const r=wallRun(segment,bank);
    for(const nodes of [r.outer,r.inner]) {
      const a=nodes[0];
      for(const b of nodes.slice(1)) assert.ok(Math.abs(b[1]-a[1]-(b[0]-a[0])*channel4Slope)<1e-8);
    }
  }
});


test('emitted platform, retaining roof, pond edges retain the new channel directions',async()=>{
  const {landingPond}=await import('../src/chapters/00-intro/escher/pond.js');
  const markup=millFoundation()+landingPond();
  const matches=[...markup.matchAll(/<polygon points="([^"]+)" class="(?:ground-plane terrace-floor(?: mill-canal-lower-roof)?|garden-soil|pond-water)"/g)];
  assert.equal(matches.length,3);
  for(const match of matches) {
    const points=match[1].split(' ').map(p=>p.split(',').map(Number));
    for(let i=0;i<points.length;i++) {
      const a=points[i],b=points[(i+1)%points.length];
      const slope=(b[1]-a[1])/(b[0]-a[0]);
      assert.ok([scene.waterwayDirections.across[1],channel4Slope].some(s=>Math.abs(s-slope)<1e-9));
    }
  }
});


test('all 85 moved plants have their roots inside the lowered soil polygon',()=>{
  const markup=foreground();
  const soil=markup.match(/points="([^"]+)" class="garden-soil"/)[1].split(' ').map(p=>p.split(',').map(Number));
  const roots=[...markup.matchAll(/class="garden-specimen"[^>]*transform="translate\(([^)]+)\)"/g)].map(m=>m[1].split(' ').map(Number));
  assert.equal(roots.length,85);
  for(const p of roots) {
    let inside=false;
    for(let i=0,j=soil.length-1;i<soil.length;j=i++) {
      const a=soil[i],b=soil[j];
      if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0]) inside=!inside;
    }
    assert.ok(inside,`floating plant root ${p}`);
  }
});

test('side-wall brick courses use the same new slope as the actual walls',async()=>{
  const {materialDefinitions}=await import('../src/chapters/00-intro/escher/materials.js');
  const match=materialDefinitions.match(/id="escher-brick-side"[^>]*patternTransform="matrix\(1 ([^ ]+) 0 1 0 0\)"/);
  assert.ok(match);
  assert.equal(Number(match[1]),channel4Slope);
});


test('bridge and terrace meet the bed underside and the arch touches the channel face',async()=>{
  const {crossBridgeLayout:c,crossBridge}=await import('../src/chapters/00-intro/escher/cross-bridge.js');
  const markup=crossBridge();
  for(const v of [c.frontV,c.backV]) {
    const bottom=projectMillPlane(c.origin,0,v,c.ground);
    assert.ok(Math.abs(bottom[1]-channel4BankY(bottom[0])-scene.wallDepth)<1e-9);
  }
  assert.equal(c.archStart,0);
  assert.equal(c.deck,-brickCourseHeight);
  assert.equal(c.deck+c.edgeHeight,0);
  const archStart=projectMillPlane(c.origin,c.archStart,c.frontV,c.ground);
  assert.ok(markup.includes(`M${archStart}`));
  assert.equal(c.recedingSlope,channel4Slope);
  assert.equal(scene.showBridgeComplex,true);
});


test('corner step spans one coping brick and rises half a course inside the far parapet',async()=>{
  const {crossBridgeLayout:c,crossBridge}=await import('../src/chapters/00-intro/escher/cross-bridge.js');
  const step=crossBridge().split('id="escher-bridge-corner-step"')[1].split('bridge-front-wall')[0];
  assert.equal(c.cornerStep.height,brickCourseHeight/2);
  assert.ok(Math.abs(c.cornerStep.width*Math.hypot(1,channel4Slope)-29)<1e-9);
  const tread=step.match(/points="([^"]+)" class="stone-light stair-tread"/)[1].split(' ').map(p=>p.split(',').map(Number));
  const top=c.deck+c.cornerStep.height;
  assert.deepEqual(tread[0],projectMillPlane(c.origin,0,c.backV-c.edgeThickness-c.cornerStep.width,top));
  assert.deepEqual(tread[1],projectMillPlane(c.origin,0,c.backV-c.edgeThickness,top));
  assert.equal([...step.matchAll(/class="stone-light stair-tread"/g)].length,1);
});

test('larger house stays fixed while the stairless terrace halves its length from the fixed bridge side',async()=>{
  const {crossBridgeLayout:c,crossBridge}=await import('../src/chapters/00-intro/escher/cross-bridge.js');
  const markup=crossBridge();
  const top=markup.match(/points="([^"]+)" class="stone-light wall-facing building-front-wall"/)[1].split(' ').map(p=>p.split(',').map(Number));
  const expected=projectMillPlane(c.origin,c.end-c.houseLeftShift,c.houseMinV,c.houseRoof+c.houseLift).map((v,i)=>v+c.houseScreenOffset[i]);
  assert.ok(Math.hypot(...top[0].map((v,i)=>v-expected[i]))<1e-9);
  assert.ok(c.houseLift>0&&c.houseLeftShift>0);
  assert.ok(!markup.includes('escher-bridge-platform-stairs'));
  assert.ok(!markup.includes('escher-bridge-under-platform'));

});


test('doorway paving meets the wall at ground height, is 150 wide and reaches beyond the image',async()=>{
  const m=millTerraceLayout;
  const {crossBridgeLayout:c}=await import('../src/chapters/00-intro/escher/cross-bridge.js');
  const points=millDoorGround().match(/points="([^"]+)"/)[1].split(' ').map(p=>p.split(',').map(Number));
  assert.deepEqual(points[3],projectMillPlane(m.origin,m.door.u,m.outline[2][1],-m.height));
  assert.equal(points[2][0]-points[3][0],150);
  assert.ok(points[1][0]-points[0][0]>150);
  assert.ok(points[0][0]<0&&points[1][0]<0);
  const doorBase=projectMillPlane(m.origin,m.door.u,m.door.v,-m.height);
  const a=points[0],b=points[3];
  assert.ok(Math.abs((b[0]-a[0])*(doorBase[1]-a[1])-(b[1]-a[1])*(doorBase[0]-a[0]))<1e-8);
});


test('straight ground walls meet the terrace contact and paint the long right wall last',async()=>{
  const {crossBridgeLayout:c}=await import('../src/chapters/00-intro/escher/cross-bridge.js');
  const markup=millDoorGroundWalls(c.groundWallTopReference);
  const extract=cls=>markup.match(new RegExp('points="([^"]+)" class="[^"]*'+cls+'"'))[1].split(' ').map(p=>p.split(',').map(Number));
  const upper=extract('door-ground-upper-face'),right=extract('door-ground-right-face');
  assert.ok(Math.hypot(...upper[0].map((v,i)=>v-c.groundWallTopReference[i]))<1e-9);
  assert.equal(upper[1][0]-upper[0][0],150);
  assert.deepEqual(upper[3],projectMillPlane(millTerraceLayout.origin,millTerraceLayout.door.u,millTerraceLayout.outline[2][1],-millTerraceLayout.height));
  assert.ok(right[2][1]+scene.compositionOffsetY>884&&right[3][1]+scene.compositionOffsetY>884);
  assert.ok(markup.indexOf('id="escher-door-ground-upper-wall"')<markup.indexOf('id="escher-door-ground-right-wall"'));
  assert.ok(!markup.includes('Q'));
  const {materialDefinitions}=await import('../src/chapters/00-intro/escher/materials.js');
  const roof=materialDefinitions.match(/id="escher-roof-tiles"[^>]*patternTransform="matrix\(1 ([^ ]+)/);
  assert.equal(Number(roof[1]),scene.waterwayDirections.receding[1]);
  const paving=materialDefinitions.match(/id="escher-paving"[^>]*patternTransform="matrix\(1 [^ ]+ -.8 ([^ ]+)/);
  assert.ok(Math.abs(Number(paving[1])/-.8-channel4Slope)<1e-9);
});


test('shortened doorway building keeps its top and raises ground, wall tops and planter by one shared amount',async()=>{
  const m=millTerraceLayout;
  assert.ok(Math.abs(m.height/m.referenceHeight-2/3)<1e-9);
  assert.deepEqual(m.origin,[91,613.9162445326177]);
  const delta=m.referenceHeight-m.height;
  const front=millFoundation().match(/points="([^"]+)" class="stone-light wall-facing mill-foundation-front-wall"/)[1].split(' ').map(p=>p.split(',').map(Number));
  assert.ok(Math.abs(front.at(-1)[1]-front[0][1]-m.height)<1e-9);
  const floor=millDoorGround().match(/points="([^"]+)"/)[1].split(' ').map(p=>p.split(',').map(Number));
  const old=projectMillPlane(m.origin,m.door.u,m.outline[2][1],-m.referenceHeight);
  assert.ok(Math.abs(old[1]-floor[3][1]-delta)<1e-9);
  const {crossBridgeLayout:c}=await import('../src/chapters/00-intro/escher/cross-bridge.js');
  assert.ok(Math.abs(c.referencePlatformBuildingContact[1]-c.groundWallTopReference[1]-delta)<1e-9);
  const oldPlanter=projectMillPlane(m.origin,m.outline[1][0],m.outline[1][1],-m.referenceHeight+m.garden.lift);
  assert.ok(Math.abs(oldPlanter[1]-gardenLayout.abutment[1]-delta)<1e-9);
});


test('roof alone follows channel 2 while perspective floor edges converge beyond the fixed upper end',()=>{
  const markup=mill();
  const roof=markup.match(/points="([^"]+)" class="roof-dark"/)[1].split(' ').map(p=>p.split(',').map(Number));
  const slope=scene.waterwayDirections.receding[1];
  assert.ok(Math.abs((roof[1][1]-roof[0][1])/(roof[1][0]-roof[0][0])-slope)<1e-9);
  assert.ok(Math.abs((roof[2][1]-roof[3][1])/(roof[2][0]-roof[3][0])-slope)<1e-9);
  const body=markup.match(/points="([^"]+)" class="stone-mid wall-receding building-side-wall"/)[1].split(' ').map(p=>p.split(',').map(Number));
  assert.ok(Math.abs((body[1][1]-body[0][1])/(body[1][0]-body[0][0])-channel4Slope)<1e-9);
  const m=millTerraceLayout;
  const floor=millDoorGround().match(/points="([^"]+)"/)[1].split(' ').map(p=>p.split(',').map(Number));
  const vp=projectMillPlane(m.origin,m.door.u,m.outline[2][1]+scene.doorGround.vanishingDistance,-m.height);
  for(const [a,b] of [[floor[0],floor[3]],[floor[1],floor[2]]]) {
    const cross=(b[0]-a[0])*(vp[1]-a[1])-(b[1]-a[1])*(vp[0]-a[0]);
    assert.ok(Math.abs(cross)<1e-8);
  }
  assert.deepEqual(floor[2],projectMillPlane(m.origin,m.door.u+150,m.outline[2][1],-m.height));
});


test('foundation lower edge continues straight into the planter side with a fixed rear endpoint',()=>{
  const m=millTerraceLayout,g=gardenLayout;
  const anchor=projectFoundationPoint(...m.outline[2],-m.height);
  assert.deepEqual(anchor,projectMillPlane(m.origin,...m.outline[2],-m.height));
  const join=projectFoundationPoint(...m.outline[1],-m.height);
  const rear=projectGardenPoint(g.width,g.depth,-m.garden.wallHeight);
  const front=projectGardenPoint(g.width,0,-m.garden.wallHeight);
  assert.ok(Math.hypot(join[0]-rear[0],join[1]-rear[1])<1e-8);
  assert.ok(Math.abs((join[0]-anchor[0])*(front[1]-anchor[1])-(join[1]-anchor[1])*(front[0]-anchor[0]))<1e-7);
  const original=projectMillPlane(g.origin,g.width,0,-m.garden.wallHeight);
  assert.ok(front[0]>original[0]);
  assert.equal(front[1],original[1]);
  for(const [u,v] of m.outline) assert.deepEqual(projectFoundationPoint(u,v),projectMillPlane(m.origin,u,v));
});


test('replacement platform closes six edges from the doorway return to the canal and bridge foot',async()=>{
 const {replacementPlatformOutline:p,replacementPlatform,crossBridgeLayout:c}=await import('../src/chapters/00-intro/escher/cross-bridge.js');
 const [a,b,corner,d,e,f]=p;
 assert.equal(p.length,6);
 assert.deepEqual(b,c.groundWallTopReference);
 assert.equal(b[0],corner[0]);assert.ok(corner[1]<b[1]);
 assert.deepEqual(d,projectMillPlane(c.origin,0,c.frontV,c.ground));
 assert.ok(Math.abs(Math.hypot(e[0]-d[0],e[1]-d[1])-60)<1e-9);
 for(const [from,to,slope] of [[a,b,channel4Slope],[corner,d,channel4Slope],[d,e,scene.waterwayDirections.across[1]],[e,f,channel4Slope],[f,a,scene.waterwayDirections.across[1]]]){
  assert.ok(Math.abs((to[1]-from[1])/(to[0]-from[0])-slope)<1e-9);
 }
 assert.ok(replacementPlatform().includes(p.map(p=>p.join(',')).join(' ')));
 const {readFile}=await import('node:fs/promises');
 const source=await readFile(new URL('../src/chapters/00-intro/escher/index.js',import.meta.url),'utf8');
 assert.ok(source.indexOf('?replacementPlatform():')>source.indexOf('${millDoorGroundWalls('));
});


test('split platform stairs share the wall crossing and short stairs land exactly on the floor',async()=>{
 const {platformStairsLayout:c,platformStairs,replacementPlatformOutline:p}=await import('../src/chapters/00-intro/escher/cross-bridge.js');
 const [a,b,,,e,f]=p;
 assert.deepEqual(c.shortStart,f); assert.deepEqual(c.longEnd,e);
 assert.ok(Math.abs(c.split[0]-f[0]-18)<1e-9);
 assert.ok(Math.abs((c.split[1]-b[1])/(c.split[0]-b[0])-scene.waterwayDirections.across[1])<1e-9);
 const m=millTerraceLayout;
 const ground=projectMillPlane(m.origin,m.door.u,m.outline[2][1],-m.height);
 assert.ok(Math.abs(b[1]+c.rise-ground[1])<1e-9);
 assert.equal([...platformStairs().matchAll(/class="stone-light stair-tread"/g)].length,6);
 assert.ok(c.longRise>c.rise/6&&c.longRun>c.shortRun);
 assert.ok(e[1]+c.longCount*(c.longRun*scene.waterwayDirections.across[1]+c.longRise)>884);
 const {readFile}=await import('node:fs/promises');
 const source=await readFile(new URL('../src/chapters/00-intro/escher/index.js',import.meta.url),'utf8');
 assert.ok(source.indexOf('?crossBridge():')<source.indexOf('?platformStairs(true):'));
 assert.ok(source.indexOf('?platformStairs(true):')<source.indexOf('${millDoorGround()}'));
 assert.ok(source.indexOf('?platformStairs():')>source.indexOf('${millDoorGroundWalls('));
});


test('stair closures remain opaque above treads and the short platform shares one side outline',async()=>{
 const {platformStairs,replacementPlatformOutline:p,platformStairsLayout:c}=await import('../src/chapters/00-intro/escher/cross-bridge.js');
 for(const long of [false,true]){
  const markup=platformStairs(long);
  assert.ok(markup.indexOf('stair-side-far')<markup.indexOf('class="stone-stairs"'));
  assert.ok(markup.indexOf('stair-side-near')>markup.indexOf('class="stone-stairs"'));
  assert.ok(!markup.includes('wall-receding'));
  const near=markup.match(/points="([^"]+)" class="stone-light wall-facing stair-side-near"/)[1].split(' ').map(p=>p.split(',').map(Number));
  if(!long){
   assert.deepEqual(near[0],p[0]);
   assert.deepEqual(near[1],c.shortStart);
   assert.deepEqual(near.at(-1),[p[0][0],p[0][1]+c.rise]);
  }
 }
});


test('shortened house doors remain centered with crowns following the roof edge',async()=>{
 const {crossBridge}=await import('../src/chapters/00-intro/escher/cross-bridge.js');
 const doors=[...crossBridge().matchAll(/data-door-height="([^"]+)" data-arch-rise="([^"]+)"/g)].map(m=>m.slice(1).map(Number));
 assert.equal(doors.length,2);
 assert.ok(Math.abs(doors[0][0]*.15-doors[0][1])<1e-9);
 assert.equal(doors[0][1],doors[1][1]);
 assert.ok(doors[1][0]>doors[0][0]);
 const {crossBridgeLayout:c}=await import('../src/chapters/00-intro/escher/cross-bridge.js');
 const positions=[...crossBridge().matchAll(/data-door-center="([^"]+)" data-door-crown="([^"]+)"/g)].map(m=>m.slice(1).map(Number));
 assert.ok(Math.abs((positions[0][0]+positions[1][0])/2-c.houseWidth/2)<1e-9);
 assert.ok(Math.abs((positions[1][1]-positions[0][1])/(positions[1][0]-positions[0][0])-scene.waterwayDirections.across[1])<1e-9);
});
