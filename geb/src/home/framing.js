import { Vector3 } from 'three';

export const ROOM_HALF_SIZE = 4.4;
const focus = new Vector3(-.6, -.65, -.6);
const view = new Vector3(1, .85, 1.12).normalize();

export function fitCamera(camera, width, height) {
  camera.aspect = width / height;
  // A fixed direction, with additional distance for narrow portrait canvases.
  camera.position.copy(focus).addScaledVector(view, 28.5 / Math.min(1, camera.aspect));
  camera.lookAt(focus);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
}
