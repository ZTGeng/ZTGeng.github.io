import { Quaternion, Vector3 } from 'three';

export function attachSculptureInteraction({ control, canvas, sculpture, camera, reset, invalidate }) {
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const identity = new Quaternion();
  const startQuaternion = new Quaternion();
  const delta = new Quaternion();
  const right = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
  const up = new Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let pointer = null;
  let previous = { x: 0, y: 0 };
  let resetting = false;
  let resetStart = 0;

  function rotate(dx, dy) {
    resetting = false;
    delta.setFromAxisAngle(up, dx).multiply(new Quaternion().setFromAxisAngle(right, dy));
    sculpture.quaternion.premultiply(delta).normalize();
    invalidate();
  }

  control.addEventListener('pointerdown', event => {
    if (pointer !== null || !event.isPrimary || event.button !== 0) return;
    pointer = event.pointerId;
    previous = { x: event.clientX, y: event.clientY };
    resetting = false;
    control.setPointerCapture(pointer);
    control.classList.add('dragging');
  }, options);

  control.addEventListener('pointermove', event => {
    if (event.pointerId !== pointer) return;
    const scale = Math.PI * 1.5 / Math.min(canvas.clientWidth, canvas.clientHeight);
    rotate((event.clientX - previous.x) * scale, (event.clientY - previous.y) * scale);
    previous = { x: event.clientX, y: event.clientY };
  }, options);

  function release(event) {
    if (event.pointerId !== pointer) return;
    pointer = null;
    control.classList.remove('dragging');
    // No inertia: the exact released orientation persists.
  }
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) control.addEventListener(type, release, options);

  control.addEventListener('keydown', event => {
    const steps = { ArrowLeft: [-.10,0], ArrowRight: [.10,0], ArrowUp: [0,-.10], ArrowDown: [0,.10] };
    if (!steps[event.key]) return;
    event.preventDefault();
    rotate(...steps[event.key]);
  }, options);

  reset.addEventListener('click', () => {
    if (pointer !== null && control.hasPointerCapture(pointer)) control.releasePointerCapture(pointer);
    pointer = null;
    control.classList.remove('dragging');
    startQuaternion.copy(sculpture.quaternion);
    resetStart = performance.now();
    resetting = true;
    invalidate();
  }, options);

  return {
    update(now) {
      if (!resetting) return false;
      const t = reducedMotion.matches ? 1 : Math.min(1, (now - resetStart) / 520);
      sculpture.quaternion.slerpQuaternions(startQuaternion, identity, t * t * (3 - 2 * t));
      resetting = t < 1;
      if (!resetting) sculpture.quaternion.copy(identity);
      return resetting;
    },
    dispose() { controller.abort(); },
  };
}
