// Screen-space geometry: these intentional depth contradictions do not form a
// physically consistent 3D model. Shared points anchor the channel and cascade.
const acrossSlope = Math.tan(10 * Math.PI / 180);
const recedingSlope = Math.tan(-20 * Math.PI / 180);
const azimuth = Math.atan(Math.sqrt(acrossSlope / -recedingSlope));
const sinElevation = Math.sqrt(acrossSlope * -recedingSlope);
const verticalScale = Math.sqrt(1 - sinElevation ** 2);
const wheelFaceScale = Math.sin(azimuth) / verticalScale;

// Orthographic projection of two perpendicular, equally scaled ground axes.
// tan(10°) = sin(elevation) * tan(azimuth),
// tan(20°) = sin(elevation) / tan(azimuth).
// projectPlane uses screen-x units, so convert an actual square's half-side
// to the horizontal components of its two projected axes.
export function squareFootprint(halfSide) {
  const total = acrossSlope - recedingSlope;
  return {
    halfSide,
    halfWidth: halfSide * Math.sqrt(-recedingSlope / total),
    halfDepth: halfSide * Math.sqrt(acrossSlope / total),
  };
}

export const scene = {
  viewBox: '0 0 900 884',
  compositionOffsetY: -36,
  // The aqueduct has an independent vertical offset. The mill floor and wheel
  // are separate; the two lower piers now share one vertical length.
  aqueductDrop: 16,
  // Rightward screen directions: down 10 degrees and up 20 degrees.
  // Their 30-degree acute angle defines every horizontal plane.
  waterwayDirections: { across: [1, acrossSlope], receding: [1, recedingSlope] },
  towerBay: squareFootprint(37),
  lowerPierFootprint: { halfWidth: 7.5, halfDepth: 6 },
  channelFootprint: squareFootprint(50),
  channelWallThickness: 25,
  // Approved turn support elevations. Straight-wall brick courses are
  // independent so stepped coping does not move the tower feet.
  channelWallHeights: {
    1: { left: 4, right: 7 },
    2: { left: 15, right: 11 },
    3: { left: 19, right: 23 },
    4: { left: 31, right: 27 },
  },
  channelWaterFreeboard: 2,
  // Allow the deeper square footprint to clear the fixed wheel outlet.
  towerBayCenterOffset: [10, -9],
  columnCap: squareFootprint(10),
  columnBase: squareFootprint(11.8),
  columnRadius: 7.5,
  columnBaseHeights: {
    'right-lower': 8,
    'left-middle': 20,
    'right-upper': 25,
    'left-upper': 31,
  },
  towerEave: squareFootprint(54),
  archFrame: { ...squareFootprint(48), top: 28, bottom: -18, crown: 56 },
  waterfallOutletX: 354,
  waterfallLandingExtension: 8,
  waterfallOffsetX: -10,
  pool: { halfSide: 60, sideRetraction: 18, widthExpansion: 20, rearPierGap: 2, rimWidth: 3, rimHeight: 3 },
  ornamentYawDegrees: [25, 35],
  wallDepth: 8,
  // Wheel face follows the receding/vertical plane; its thickness follows across.
  // Keep the wheel faces upright; only the axle has a ground-plane incline.
  wheel: { x: 389, radius: 64, lift: 25,
    depth: [-52 * Math.cos(azimuth), 52 * sinElevation * Math.sin(azimuth)],
    faceScale: wheelFaceScale, faceShear: 0,
    buckets: 24, flipX: true },
  mill: {
    origin: [157, 642], width: 137, depth: 205, height: 146, roofRise: 68,
    slide: -48,
    referenceChannelHalfSide: 42,
  },
  towers: [
    // Shared bay centers anchor both the four columns and waterway corners.
    { id: 'left', x: 371, y: 296, top: 190, ornament: 0,
      lowerLevels: [{ id: 'middle', y: 460, top: 334 },
        // Only the two right-hand square piers are visible below the middle tier.
        { id: 'lower', y: 674, top: 476, pierBay: true }] },
    { id: 'right', x: 680, y: 337, top: 227, ornament: 1,
      lowerLevels: [{ id: 'lower', y: 500, top: 375 }] },
  ],
  // This terrace belongs only to the mill and wheel, not to the aqueduct.
  showRightHouses: false,
  showBridgeHouse: true,
  millTerrace: {
    // Keep the terrace's front edge on the mill floor as its angle changes.
    origin: [139, 642 - (157 - 139) * acrossSlope],
    outline: [[38, -20], [306, -20], [306, 82], [288, 82], [288, 225], [38, 225]],
    door: { u: 306, v: 8, width: 56, height: 96 },
    garden: { left: 38, right: 306, plantWidth: 242, depth: 180, lift: 32, wallHeight: 32, gateWidth: 26, gateHeight: 46 },
    platformOutline: [[-18, -36], [180, -36], [180, -20], [306, -20], [306, 82], [288, 82], [288, 225], [-18, 225]],
    canalSupportHeight: 50,
    canalLowerHeight: 110,
    canalLowerSetback: 34,
    platformThickness: 6,
    platformRailEdges: [0, 1, 2, 3, 4, 7],
    platformFrontEdges: [0, 1, 2, 3, 4],
    height: 141,
  },
};
