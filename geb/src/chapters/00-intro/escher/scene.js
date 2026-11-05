// Screen-space geometry: these intentional depth contradictions do not form a
// physically consistent 3D model. Shared points anchor the channel and cascade.
const acrossSlope = Math.tan(10 * Math.PI / 180);
const recedingSlope = Math.tan(-20 * Math.PI / 180);
const azimuth = Math.atan(Math.sqrt(acrossSlope / -recedingSlope));
const sinElevation = Math.sqrt(acrossSlope * -recedingSlope);
const verticalScale = Math.sqrt(1 - sinElevation ** 2);
const wheelFaceScale = Math.sin(azimuth) / verticalScale;
const brickCourseHeight = Math.ceil(4 * 2);

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
  viewBox: '0 0 900 1040',
  framing: {scale:1.2, x:-75, y:25},
  compositionOffsetY: -6,
  backgroundOffsetY: -30,
  brickCourseHeight,
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
  channelSplitOffsets: { 2: 24, 3: -60, 4: -16 },
  // Matching 1/3/5/7-course turns on an unsheared, continuous bed plane.
  channelWallHeights: {
    1: { left: brickCourseHeight, right: 3 * brickCourseHeight },
    2: { left: 5 * brickCourseHeight, right: 3 * brickCourseHeight },
    3: { left: 5 * brickCourseHeight, right: 7 * brickCourseHeight },
    4: { left: 9 * brickCourseHeight, right: 7 * brickCourseHeight },
  },
  channelWaterFreeboard: 2,
  // Allow the deeper square footprint to clear the fixed wheel outlet.
  towerBayCenterOffset: [10, -9],
  columnCap: squareFootprint(10),
  columnBase: squareFootprint(11.8),
  columnRadius: 7.5,
  upperShaftExtra: {'left-upper':12,'right-upper':16},
  columnBaseHeights: {
    'right-lower': brickCourseHeight,
    'left-middle': 3 * brickCourseHeight,
    'right-upper': 5 * brickCourseHeight,
    'left-upper': 7 * brickCourseHeight,
  },
  towerEave: squareFootprint(54),
  archFrame: { ...squareFootprint(48), top: 28, bottom: -18, crown: 56 },
  intermediateArch: { top: 16, capThickness: 0 },
  waterfallOutletX: 354,
  waterfallLandingExtension: 8,
  waterfallOffsetX: -10,
  waterfallVisualShiftX: -5,
  pool: { halfSide: 60, sideRetraction: 18, widthExpansion: 8, rearPierGap: 2, rimWidth: 3, rimHeight: 3 },
  ornamentYawDegrees: [25, 35],
  ornamentDrop: 6,
  wallDepth: 8,
  doorGround: {width:150,vanishingDistance:900},
  bridge: {
    length: 150,
    wallHeight: 144,
    arch: { width: 28, height: 56, riseRatio: .14 },
    // Final house footprint relative to bridge width; the near overhang
    // preserves its bridge-side anchor independently of the far edge.
    house: { depthRatio: 1.0557, nearOverhangRatio: .121 },
    // Final approved dimensions in house-local coordinates. Both crowns
    // share one elevation; different sill heights follow the descending stair.
    houseDoors: {
      width: 26, spacing: 38, leftHeight: 87.0419659752562,
      crownElevation: 269.7336017778847, riseRatio: .15, screenOffsetX: -18,
    },
  },
  // Wheel face follows the receding/vertical plane; its thickness follows across.
  // Keep the wheel faces upright; only the axle has a ground-plane incline.
  wheel: { x: 389, offsetX: -8, centerY: 552.1089319438277, radius: 64, lift: 25,
    depth: [-52 * Math.cos(azimuth), 52 * sinElevation * Math.sin(azimuth)],
    faceScale: wheelFaceScale, faceShear: 0,
    buckets: 24, flipX: true },
  mill: {
    origin: [157, 642], width: 137, depth: 205 * 2 / 3, height: 146, roofRise: 68,
    slide: -48,
    referenceChannelHalfSide: 42,
    referenceCopingHeight: 31,
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
  showBridgeComplex: true,
  millTerrace: {
    // Keep the terrace's front edge on the mill floor as its angle changes.
    origin: [139, 642 - (157 - 139) * acrossSlope],
    outline: [[38, -20], [276, -20], [276, 82], [258, 82], [258, 225], [38, 225]],
    door: { u: 276, width: 56, height: 96 },
    garden: { left: 38, right: 276, plantWidth: 242, soilLeftExtension: 70, soilRearExtension: 65, depth: 204, lift: 32, wallHeight: 32, gateWidth: 26, gateHeight: 46 },
    platformOutline: [[-18, -36], [180, -36], [180, -20], [276, -20], [276, 82], [258, 82], [258, 225], [-18, 225]],
    canalSupportHeight: 0,
    canalLowerHeight: 160,
    canalLowerSetback: 34,
    platformThickness: 6,
    platformRailEdges: [0, 1, 2, 3, 4, 7],
    platformFrontEdges: [0, 1, 2, 3, 4],
    height: 141,
    heightScale: 2 / 3,
    foundationPerspectiveShift: .04,
  },
};
