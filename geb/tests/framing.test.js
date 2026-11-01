import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { BufferAttribute, BufferGeometry, DoubleSide, Mesh, MeshBasicMaterial, PerspectiveCamera, Raycaster, Vector2, Vector3 } from 'three';
import { fitCamera, ROOM_HALF_SIZE } from '../src/home/framing.js';
import { makeVolume } from '../scripts/volume.js';

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

test('the initial sculpture does not obscure any of the three letter shadows', async () => {
  const data = JSON.parse(await readFile(new URL('../assets/model/sculpture.json', import.meta.url), 'utf8'));
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(data.positions), 3));
  geometry.setIndex(data.indices);
  const material = new MeshBasicMaterial({ side: DoubleSide });
  const sculpture = new Mesh(geometry, material);
  sculpture.updateMatrixWorld();
  const { n, masks } = makeVolume(data.resolution);
  const e = ROOM_HALF_SIZE;
  const projectors = {
    G: (u,v) => new Vector3(-e,v,-u),
    E: (u,v) => new Vector3(u,v,-e),
    B: (u,v) => new Vector3(u,-e,-v),
  };
  // Include perspective changes caused by both portrait and landscape framing.
  for (const [width,height] of [[375,600],[1280,720]]) {
    const camera = new PerspectiveCamera(34,1,.1,100);
    fitCamera(camera,width,height);
    const ray = new Raycaster();
    for (const [letter, locate] of Object.entries(projectors)) {
      let obscured = 0;
      for (let v = 0; v < n; v++) for (let u = 0; u < n; u++) {
        if (!masks[letter][u + n * v]) continue;
        const point = locate(((u+.5)/n-.5)*2.6, ((v+.5)/n-.5)*2.6);
        const projected = point.clone().project(camera);
        ray.setFromCamera(new Vector2(projected.x,projected.y),camera);
        ray.far = camera.position.distanceTo(point) - .001;
        if (ray.intersectObject(sculpture).length) obscured++;
      }
      assert.equal(obscured,0, `${letter} has ${obscured} obscured shadow samples at ${width}×${height}`);
    }
  }
  geometry.dispose(); material.dispose();
});
