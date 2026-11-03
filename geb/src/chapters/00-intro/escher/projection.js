import { scene } from './scene.js';

// Normalize by screen x so changing a bay's width does not change its angle.
const normalizeX = ([x, y]) => [1, y / x];
export const across = normalizeX(scene.waterwayDirections.across);
export const receding = normalizeX(scene.waterwayDirections.receding);

export function projectPlane(center, u, v, height = 0) {
  return [
    center[0] + u * across[0] + v * receding[0],
    center[1] + u * across[1] + v * receding[1] - height,
  ];
}

const degrees = vector => Math.atan2(vector[1], vector[0]) * 180 / Math.PI;
export const projectionAngles = {
  across: degrees(across),
  receding: degrees(receding),
  acute: Math.abs(degrees(across) - degrees(receding)),
  turn: 180 - Math.abs(degrees(across) - degrees(receding)),
};
