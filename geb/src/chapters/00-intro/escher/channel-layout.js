import { scene, squareFootprint } from './scene.js';
import { projectPlane, across, receding } from './projection.js';

export const mix = (a, b, t = .5) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

const left = scene.towers.find(tower => tower.id === 'left');
const right = scene.towers.find(tower => tower.id === 'right');
const span = right.x - left.x;
const bayCenter = ({ x, y }) => [x + scene.towerBayCenterOffset[0], y + scene.towerBayCenterOffset[1]];
const leftUpperCenter = bayCenter(left);
const rightUpperCenter = projectPlane(leftUpperCenter, span, 0);
const leftMiddleCenter = projectPlane(rightUpperCenter, 0, -span);
const rightLowerCenter = projectPlane(leftMiddleCenter, span, 0);
const referenceCenters = {
  'left-upper': leftUpperCenter, 'right-upper': rightUpperCenter,
  'left-middle': leftMiddleCenter, 'right-lower': rightLowerCenter,
};

// Aim the final water surface at the fixed wheel's lower axle midpoint.
export const channel4Outlet = [scene.wheel.x+scene.wheel.depth[0]/2,
  scene.wheel.centerY+scene.wheel.depth[1]/2+scene.wheel.radius];
export const channel4Slope=(channel4Outlet[1]+scene.channelWallHeights[4].left-scene.channelWaterFreeboard
  -rightLowerCenter[1]-scene.aqueductDrop)/(channel4Outlet[0]-rightLowerCenter[0]);
export const channel4Pitch=channel4Slope-receding[1];
export const projectMillPlane=(center,u,v,height=0)=>{
  const p=projectPlane(center,u,v,height);
  return [p[0],p[1]+channel4Pitch*v];
};

// Clear shaft length (between base transition and capital), identical in all bays.
// The intermediate beam cap must touch the underside of the channel above.
export const columnShaftLength = span * (across[1] - receding[1])
  - 5 * scene.brickCourseHeight - 3 * scene.brickCourseHeight
  - scene.wallDepth - scene.intermediateArch.top - scene.intermediateArch.capThickness - 15 - 2;

export const towerLevels = scene.towers.flatMap(tower => [
  { ...tower, tier: `${tower.id}-upper` },
  ...tower.lowerLevels.map(level => ({ x: tower.x, ...level, tier: `${tower.id}-${level.id}` })),
]).map(level => {
  const reference = referenceCenters[level.tier] ?? bayCenter(level);
  const drop = level.pierBay ? 0 : scene.aqueductDrop;
  const center = [reference[0], reference[1] + drop];
  const y = center[1] + 9;
  const support = ({'left-upper':1,'right-upper':3,'left-middle':5,'right-lower':7}[level.tier] ?? 0) * scene.brickCourseHeight;
  const top = level.pierBay ? level.top + y - level.y
    : center[1] - support - scene.columnBaseHeights[level.tier] - 17 - columnShaftLength + 9;
  return { ...level, center, y, top };
});

export function bay(level, footprint = scene.towerBay) {
  const { x, y } = level;
  const center = level.center ?? bayCenter({ x, y });
  const { halfWidth: u, halfDepth: v } = footprint;
  const corners = [[-u, -v], [u, -v], [u, v], [-u, v]]
    .map(([u, v]) => projectTowerPlane(level.tier, center, u, v));
  const [fl, fr, br, bl] = corners;
  return {
    corners,
    center,
    edges: { front: [fr, fl], right: [fr, br], back: [br, bl], left: [fl, bl] },
  };
}

const bays = Object.fromEntries(towerLevels.map(level => [level.tier, bay(level, scene.channelFootprint)]));
const edge = (id, name) => bays[id].edges[name];
const middle = points => mix(...points);

const referenceFootprint=squareFootprint(scene.mill.referenceChannelHalfSide);
export const waterfallLip = middle(bay(towerLevels.find(l=>l.tier==='left-upper'),referenceFootprint).edges.front).map((value, i) =>
  i === 1 ? value - scene.channelWallHeights[1].left + scene.channelWaterFreeboard : value);

export function columnFeet(level) {
  return bay(level).corners.map(point => [point[0], point[1] - turnHeightAt(level.tier, point)]);
}

// Both lower square piers continue the right-hand pair of the middle tier.
// The low waterway runs to their left; it does not define a bay around them.
const pierTops = bay(towerLevels.find(level => level.tier === 'left-middle')).edges.right
  .map(([x, y]) => ({ x, top: y + scene.wallDepth - 5 }));

const waterway2From = edge('right-upper', 'front');
const waterway2To = edge('left-middle', 'back');
const waterway4From = edge('right-lower', 'front');
const direction = middle(waterway2From).map((v, i) => middle(waterway2To)[i] - v);
const outletStart = middle(waterway4From);
const outletScale = (channel4Outlet[0] - outletStart[0]) / direction[0];
const waterway4To = waterway4From.map(p => [p[0]+direction[0]*outletScale,p[1]+direction[0]*outletScale*channel4Slope]);

export const channel4BankY = x => waterway4From[0][1] + (x - waterway4From[0][0]) * channel4Slope;
// Keep the water surface and the upper rim distinct. The platform's visible
// front edge must meet the near wall's upper rim at the waterfall landing.
export const channel4WaterOutlet = middle(waterway4To).map((value, i) =>
  i === 1 ? value - scene.channelWallHeights[4].left + scene.channelWaterFreeboard : value);
export const channel4RimOutlet = [channel4Outlet[0], channel4BankY(channel4Outlet[0]) - scene.channelWallHeights[4].left];
// Keep the established mill, fall and garden elevation while resizing the
// aqueduct footprint. Only the channel's actual bank and pier anchors move.
const referenceFourthNear=projectPlane(towerLevels.find(l=>l.tier==='right-lower').center,referenceFootprint.halfWidth,-referenceFootprint.halfDepth);
const referenceBankY=x=>referenceFourthNear[1]+(x-referenceFourthNear[0])*receding[1];
export const waterfallTail = [scene.waterfallOutletX,referenceBankY(scene.waterfallOutletX)-scene.mill.referenceCopingHeight];
const referencePlatformY = scene.millTerrace.origin[1] + (scene.waterfallOutletX - scene.millTerrace.origin[0]) * across[1];
export const millLift = referencePlatformY - waterfallTail[1];
const millFloorY = scene.mill.origin[1] - millLift;
export const millLayout = { ...scene.mill, recedingSlope:channel4Slope, origin: projectPlane([scene.mill.origin[0], millFloorY], 0, scene.mill.slide) };
const millTerraceBase = {
  ...scene.millTerrace,
  recedingSlope:channel4Slope,
  origin: projectPlane([scene.millTerrace.origin[0], scene.millTerrace.origin[1] - millLift], 0, scene.mill.slide),
  // The foundation and attached staircase share the same long-axis slide.
  referenceHeight: scene.millTerrace.height + millLift,
  height: (scene.millTerrace.height + millLift) * scene.millTerrace.heightScale,
  heightReduction: (scene.millTerrace.height + millLift) * (1-scene.millTerrace.heightScale),
};
// Trim vertical piers to the middle of the final near-bank coping.
const bankCenterU=-scene.channelFootprint.halfWidth*scene.channelWallThickness/(2*scene.channelFootprint.halfSide);
export const lowerPierColumns = pierTops.map(pier => ({ ...pier,
  bottom:channel4BankY(pier.x)+bankCenterU*(across[1]-channel4Slope)-scene.channelWallHeights[4].left }));
// The pond and foundation retain their approved original anchor.
const oldFourthNear=projectPlane(towerLevels.find(l=>l.tier==='right-lower').center,
  scene.channelFootprint.halfWidth,-scene.channelFootprint.halfDepth);
const oldPierBottom=x=>oldFourthNear[1]+(x-oldFourthNear[0])*receding[1]-scene.mill.referenceCopingHeight;

// Attach the visible right apron to the left lower pier's foot, in the same
// ground plane. It is painted above channel 4 and below the two piers.
const leftPierFoot = [lowerPierColumns[0].x, oldPierBottom(lowerPierColumns[0].x)];
const footDelta = leftPierFoot.map((value, i) => value - millTerraceBase.origin[i]);
export const referenceMillPlatformAnchor=(()=>{const v=(footDelta[1]-across[1]*footDelta[0])/(receding[1]-across[1]);return [footDelta[0]-v,v];})();
const footV = (footDelta[1] - across[1] * footDelta[0]) / (channel4Slope - across[1]);
export const millPlatformAnchor = [footDelta[0] - footV, footV];
export const millPlatformRailEnd = [millPlatformAnchor[0] + scene.lowerPierFootprint.halfWidth
  -(referenceMillPlatformAnchor[1]-millPlatformAnchor[1]), referenceMillPlatformAnchor[1]];
const platformOutline=millTerraceBase.platformOutline.map(([u,v],i)=>[u,i===4||i===5?referenceMillPlatformAnchor[1]:v]);
export const millTerraceLayout = {
  ...millTerraceBase,
  door:{...millTerraceBase.door,v:(platformOutline[3][1]+platformOutline[4][1]-millTerraceBase.door.width)/2},
  // The projecting room and its roof share the exact same perimeter.
  outline: [[millTerraceBase.garden.left,platformOutline[3][1]],...platformOutline.slice(3,7),[millTerraceBase.garden.left,225]],
  platformOutline,
};
// A single perspective baseline continues from the room's fixed rear foot
// through the planter. Only the lower silhouette opens toward the right.
export const foundationEdgeShift=v=>scene.millTerrace.foundationPerspectiveShift
  *Math.max(0,millTerraceLayout.outline[2][1]-v);
const clamp01=x=>Math.max(0,Math.min(1,x));
export const projectFoundationPoint=(u,v,z=0)=>{
  const m=millTerraceLayout,p=projectMillPlane(m.origin,u,v,z);
  p[0]+=foundationEdgeShift(v)*clamp01((u-m.outline[0][0])/(m.door.u-m.outline[0][0]))*clamp01(-z/m.height);
  return p;
};
const garden=millTerraceLayout.garden;
const gardenWallCorner=millTerraceLayout.outline[1];
const gardenLeft=millTerraceLayout.outline[0][0];
const gardenWidth=gardenWallCorner[0]-gardenLeft;
const gardenReferenceAbutment=projectMillPlane(millTerraceLayout.origin,...gardenWallCorner,-millTerraceLayout.height+garden.lift);
const gardenAbutment=projectFoundationPoint(...gardenWallCorner,-millTerraceLayout.height+garden.lift);
export const gardenLayout = {
  origin: projectMillPlane(gardenReferenceAbutment,-gardenWidth,-garden.depth),
  recedingSlope:channel4Slope,
  abutment:gardenAbutment,
  width:gardenWidth,depth:garden.depth,backV:gardenWallCorner[1],leftU:gardenLeft,
  soilLeft:-garden.soilLeftExtension,
  outline:[[-garden.soilLeftExtension,0],[gardenWidth,0],[gardenWidth,garden.depth],
    [0,garden.depth],[0,garden.depth+garden.soilRearExtension],[-garden.soilLeftExtension,garden.depth+garden.soilRearExtension]],
};
export const projectGardenPoint=(u,v,z=0)=>{
  const p=projectMillPlane(gardenLayout.origin,u,v,z);
  const globalV=gardenLayout.backV-gardenLayout.depth+v;
  p[0]+=foundationEdgeShift(globalV)*clamp01(u/gardenLayout.width)
    *clamp01(1-(garden.lift+z)/millTerraceLayout.height);
  return p;
};
const clipPlatform = (polygon, axis, boundary, direction) => polygon.flatMap((a, i) => {
  const b = polygon[(i + 1) % polygon.length];
  const insideA = direction * (a[axis] - boundary) >= -1e-9;
  const insideB = direction * (b[axis] - boundary) >= -1e-9;
  const intersection = () => mix(a, b, (boundary - a[axis]) / (b[axis] - a[axis]));
  if (insideA && insideB) return [b];
  if (insideA) return [intersection()];
  if (insideB) return [intersection(), b];
  return [];
});
// Restore the entire roof beside the house above the channel, including the
// rear strip. Its perimeter is shared with the room below.
export const millPlatformApronStartU=millLayout.origin[0]-millTerraceLayout.origin[0]+millLayout.width;
export const millRightPlatformOutline = clipPlatform(
  clipPlatform(millTerraceLayout.platformOutline, 0, millPlatformApronStartU, 1),
  1, referenceMillPlatformAnchor[1], -1,
);

// The upper strips join column-defined corners. The lowest strip instead
// continues straight behind the wheel, to the left of the two square piers.
export const channelSegments = [
  { id: 1, fromTier: 'left-upper', toTier: 'right-upper', from: edge('left-upper', 'right'), to: edge('right-upper', 'left'),
    turns: [
      { tier: 'left-upper', entry: 'right', exit: 'front' },
    ] },
  { id: 2, fromTier: 'right-upper', toTier: 'left-middle', from: waterway2From, to: waterway2To,
    turns: [{ tier: 'right-upper', entry: 'left', exit: 'front' }] },
  { id: 3, fromTier: 'left-middle', toTier: 'right-lower', from: edge('left-middle', 'right'), to: edge('right-lower', 'left'),
    turns: [{ tier: 'left-middle', entry: 'back', exit: 'right' }] },
  { id: 4, fromTier: 'right-lower', from: waterway4From, to: waterway4To,
    turns: [{ tier: 'right-lower', entry: 'left', exit: 'front' }] },
];

const turnProfiles = {
  'left-upper': { entry: 'right', exit: 'front', heights: [scene.channelWallHeights[1].left, scene.channelWallHeights[1].left] },
  'right-upper': { entry: 'left', exit: 'front', heights: [scene.channelWallHeights[1].right, scene.channelWallHeights[2].right] },
  'left-middle': { entry: 'back', exit: 'right', heights: [scene.channelWallHeights[2].left, scene.channelWallHeights[3].left] },
  'right-lower': { entry: 'left', exit: 'front', heights: [scene.channelWallHeights[3].right, scene.channelWallHeights[4].right] },
};

// A turn is a constant-elevation translation of the SAME ground projection
// as its adjoining channels. Interpolating inlet/outlet heights across the
// turn shears its footprint. Whole brick-course heights agree on both
// adjoining runs; the columns use this same horizontal coping plane.
export function turnHeightAt(tier, _point) {
  const [inHeight,outHeight]=turnProfiles[tier].heights;
  return (inHeight+outHeight)/2;
}

// Both turn and tower use the common 10° / -20° projection. Never adapt the
// columns to a sheared coping plane.
export function projectTowerPlane(tier,center,u,v,height=0) {
  const p=projectPlane(center,u,v,height);
  return [p[0],p[1]+(tier==='right-lower'?channel4Pitch*v:0)];
}

export function towerCapitals(level) {
  return bay(level).corners.map(p=>[p[0],level.top+p[1]-level.y]);
}

// Union the wall cells first. This yields a continuous outer L bank and one
// inner elbow, rather than four overlapping pedestal patches under columns.
export function turnBanks(turn) {
  const grid = [0, scene.channelWallThickness / (2 * scene.channelFootprint.halfSide),
    1 - scene.channelWallThickness / (2 * scene.channelFootprint.halfSide), 1];
  const openings = { front: '1,0', right: '2,1', back: '1,2', left: '0,1' };
  const water = new Set(['1,1', openings[turn.entry], openings[turn.exit]]);
  const edges = new Map();
  for (let u = 0; u < 3; u++) for (let v = 0; v < 3; v++) {
    if (water.has(`${u},${v}`)) continue;
    const points = [[u, v], [u + 1, v], [u + 1, v + 1], [u, v + 1]];
    points.forEach((a, i) => {
      const b = points[(i + 1) % 4], key = `${a}:${b}`, reverse = `${b}:${a}`;
      if (edges.has(reverse)) edges.delete(reverse); else edges.set(key, [a, b]);
    });
  }
  const { corners: [a, b, , d] } = bays[turn.tier];
  const project = ([u, v]) => a.map((value, i) => value + grid[u] * (b[i] - a[i]) + grid[v] * (d[i] - a[i]));
  const banks = [];
  while (edges.size) {
    const first = edges.values().next().value[0], loop = [];
    let cursor = first;
    do {
      loop.push(cursor);
      const edge = [...edges.entries()].find(([, [start]]) => String(start) === String(cursor));
      edges.delete(edge[0]);
      cursor = edge[1][1];
    } while (String(cursor) !== String(first));
    banks.push(loop.map(project));
  }
  return banks;
}

export function turnLayout(turn) {
  const geometry = bays[turn.tier];
  return {
    ...geometry,
    entry: middle(geometry.edges[turn.entry]),
    exit: turn.tail ?? middle(geometry.edges[turn.exit]),
  };
}

// Both halves use the complete, identical strip geometry and absolute joint
// positions. Overlapping vertical clips split the image without generating
// cut-edge strokes or restarting the water/stone pattern at the seam.
export function channelHalf(segment, side) {
  // Move only clip seams outside the thickened walls' crossing areas.
  // Keep all water, brick geometry, phases and the established tower order.
  const cutX = (middle(segment.from)[0] + middle(segment.to)[0]) / 2
    + (scene.channelSplitOffsets[segment.id] ?? 0);
  const overlap = .8;
  return {
    ...segment, side, cutX,
    minX: side === 'left' ? -1000 : cutX - overlap,
    maxX: side === 'left' ? cutX + overlap : 2000,
    turns: segment.turns.filter(turn => (turnLayout(turn).center[0] < cutX ? 'left' : 'right') === side),
    tailrace: side === 'left' ? segment.tailrace : undefined,
  };
}

// Back-to-front order. This list is part of the drawing's construction, not a
// depth sort: Escher's local height relationships cannot share a 3D z-axis.
export const structuralOrder = [
  'channel-4-left', 'wheel', 'left-lower',
  'channel-2-left', 'channel-3-left', 'left-middle', 'channel-1-left', 'left-upper',
  'channel-3-right', 'channel-4-right', 'right-lower',
  'channel-1-right', 'channel-2-right', 'right-upper',
];
