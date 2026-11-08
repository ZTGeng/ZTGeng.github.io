import test from 'node:test';
import assert from 'node:assert/strict';
import { Object3D, PerspectiveCamera, Quaternion } from 'three';
import { attachSculptureInteraction } from '../src/home/interaction.js';

class Canvas extends EventTarget {
  clientWidth = 800;
  clientHeight = 600;
  captures = new Set();
  classList = { add() {}, remove() {} };
  setPointerCapture(id) { this.captures.add(id); }
  hasPointerCapture(id) { return this.captures.has(id); }
  releasePointerCapture(id) { this.captures.delete(id); }
}
function send(target, type, properties = {}) {
  const event = new Event(type, { cancelable: true });
  Object.assign(event, properties);
  target.dispatchEvent(event);
}

test('drag rotates only the sculpture, release persists, Reset restores the exact initial quaternion', () => {
  globalThis.window = { matchMedia: () => ({ matches: false }) };
  const canvas = new Canvas(), reset = new EventTarget(), sculpture = new Object3D();
  const camera = new PerspectiveCamera(); camera.position.set(8,7,9); camera.lookAt(0,0,0);
  const cameraPosition = camera.position.clone(), cameraQuaternion = camera.quaternion.clone();
  let renders = 0;
  const interaction = attachSculptureInteraction({ control: canvas, canvas, reset, sculpture, camera, invalidate: () => renders++ });
  const identity = new Quaternion();
  send(canvas,'pointerdown',{pointerId:1,isPrimary:true,button:0,clientX:300,clientY:200});
  send(canvas,'pointermove',{pointerId:1,clientX:440,clientY:270});
  assert.ok(sculpture.quaternion.angleTo(identity) > .5);
  assert.ok(Math.abs(sculpture.quaternion.length() - 1) < 1e-12);
  send(canvas,'pointerup',{pointerId:1});
  const released = sculpture.quaternion.clone();
  send(canvas,'pointermove',{pointerId:1,clientX:600,clientY:400});
  interaction.update(performance.now() + 1000);
  assert.deepEqual(sculpture.quaternion.toArray(), released.toArray());
  assert.deepEqual(camera.position, cameraPosition);
  assert.deepEqual(camera.quaternion.toArray(), cameraQuaternion.toArray());
  send(reset,'click');
  assert.equal(interaction.update(performance.now() + 250), true);
  assert.ok(sculpture.quaternion.angleTo(identity) < released.angleTo(identity));
  assert.ok(sculpture.quaternion.angleTo(identity) > 0);
  assert.equal(interaction.update(performance.now() + 1000), false);
  assert.deepEqual(sculpture.quaternion.toArray(), identity.toArray());
  assert.ok(renders >= 2);
  interaction.dispose();
  delete globalThis.window;
});

test('secondary buttons/pointers are ignored and cancellation ends a touch drag', () => {
  globalThis.window = { matchMedia: () => ({ matches: true }) };
  const canvas = new Canvas(), reset = new EventTarget(), sculpture = new Object3D();
  const interaction = attachSculptureInteraction({ control: canvas, canvas, reset, sculpture, camera: new PerspectiveCamera(), invalidate() {} });
  send(canvas,'pointerdown',{pointerId:1,isPrimary:true,button:2,clientX:0,clientY:0});
  send(canvas,'pointermove',{pointerId:1,clientX:100,clientY:100});
  assert.deepEqual(sculpture.quaternion.toArray(),new Quaternion().toArray());
  send(canvas,'pointerdown',{pointerId:2,isPrimary:true,button:0,pointerType:'touch',clientX:0,clientY:0});
  send(canvas,'pointermove',{pointerId:3,clientX:100,clientY:100});
  assert.deepEqual(sculpture.quaternion.toArray(),new Quaternion().toArray());
  send(canvas,'pointermove',{pointerId:2,clientX:100,clientY:100});
  assert.ok(sculpture.quaternion.angleTo(new Quaternion()) > 0);
  send(canvas,'pointercancel',{pointerId:2});
  const stopped = sculpture.quaternion.clone();
  send(canvas,'pointermove',{pointerId:2,clientX:200,clientY:200});
  assert.deepEqual(sculpture.quaternion.toArray(),stopped.toArray());
  send(reset,'click'); interaction.update(performance.now());
  assert.deepEqual(sculpture.quaternion.toArray(),new Quaternion().toArray());
  interaction.dispose();
  delete globalThis.window;
});
