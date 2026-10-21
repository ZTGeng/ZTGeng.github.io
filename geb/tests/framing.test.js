import test from 'node:test';
import assert from 'node:assert/strict';
import { PerspectiveCamera, Vector3 } from 'three';
import { fitCamera, ROOM_HALF_SIZE } from '../src/framing.js';

for (const [width,height] of [[320,440],[375,600],[430,650],[768,880],[1280,720],[1280,500]]) {
  test(`all three receivers fit inside a ${width}×${height} canvas`, () => {
    const camera = new PerspectiveCamera(34,1,.1,100);
    fitCamera(camera,width,height);
    const e = ROOM_HALF_SIZE;
    for (const x of [-e,e]) for (const y of [-e,e]) for (const z of [-e,e]) {
      const point = new Vector3(x,y,z).project(camera);
      assert.ok(Math.abs(point.x) < .95 && Math.abs(point.y) < .95 && Math.abs(point.z) < 1,
        `room corner clipped: ${point.toArray()}`);
    }
  });
}
