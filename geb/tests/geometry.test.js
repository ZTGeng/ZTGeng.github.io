import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { makeVolume, inspectVolume, meshVolume } from '../scripts/volume.js';

const volume = makeVolume();
const report = inspectVolume(volume);
const mesh = meshVolume(volume);

test('visual hull is a single face-connected wooden solid with all three exact projections', () => {
  assert.equal(report.components.length, 1);
  assert.ok(report.occupied > 100000);
  for (const letter of ['G', 'E', 'B']) {
    assert.equal(report.coverage[letter].ratio, 1, `${letter} lost strokes`);
    assert.equal(report.coverage[letter].extra, 0, `${letter} has unwanted strokes`);
  }
});

test('the actual shipped mesh agrees with the generator and remains lightweight', async () => {
  const asset = JSON.parse(await readFile(new URL('../assets/model/sculpture.json', import.meta.url), 'utf8'));
  assert.deepEqual(asset, { resolution: volume.n, ...mesh });
  assert.ok(mesh.indices.length / 3 < 5000);
});

test('triangle winding is outward and the mesh encloses exactly the voxel volume', () => {
  let sixVolume = 0;
  const vertex = i => mesh.positions.slice(3 * i, 3 * i + 3);
  for (let i = 0; i < mesh.indices.length; i += 3) {
    const [a,b,c] = mesh.indices.slice(i, i + 3).map(vertex);
    const ab = b.map((v,k) => v - a[k]), ac = c.map((v,k) => v - a[k]);
    const cross = [ab[1]*ac[2]-ab[2]*ac[1], ab[2]*ac[0]-ab[0]*ac[2], ab[0]*ac[1]-ab[1]*ac[0]];
    const normal = mesh.normals.slice(3 * mesh.indices[i], 3 * mesh.indices[i] + 3);
    assert.ok(cross.reduce((sum,v,k) => sum + v * normal[k], 0) > 0);
    sixVolume += a[0] * (b[1]*c[2]-b[2]*c[1]) + a[1] * (b[2]*c[0]-b[0]*c[2]) + a[2] * (b[0]*c[1]-b[1]*c[0]);
  }
  assert.ok(Math.abs(sixVolume / 6 - report.occupied * (2.6 / volume.n) ** 3) < 1e-5);
});

test('rasterizing the exported triangles along each axis reproduces G/E/B (not just source voxels)', () => {
  const n = volume.n;
  const mappings = { G: [2,1,-1,1], E: [0,1,1,1], B: [0,2,1,-1] };
  const point = (index, [u,v,su,sv]) => [
    (su * mesh.positions[index * 3 + u] / 2.6 + .5) * n,
    (sv * mesh.positions[index * 3 + v] / 2.6 + .5) * n,
  ];
  const edge = (a,b,p) => (b[0]-a[0])*(p[1]-a[1]) - (b[1]-a[1])*(p[0]-a[0]);
  for (const [letter, axes] of Object.entries(mappings)) {
    const projected = new Uint8Array(n * n);
    for (let i = 0; i < mesh.indices.length; i += 3) {
      const [a,b,c] = mesh.indices.slice(i,i+3).map(index => point(index,axes));
      const area = edge(a,b,c);
      if (Math.abs(area) < 1e-7) continue;
      const sign = Math.sign(area);
      const minU = Math.max(0,Math.floor(Math.min(a[0],b[0],c[0])));
      const maxU = Math.min(n-1,Math.ceil(Math.max(a[0],b[0],c[0])));
      const minV = Math.max(0,Math.floor(Math.min(a[1],b[1],c[1])));
      const maxV = Math.min(n-1,Math.ceil(Math.max(a[1],b[1],c[1])));
      for (let v = minV; v <= maxV; v++) for (let u = minU; u <= maxU; u++) {
        const p = [u+.5,v+.5];
        if ([edge(a,b,p),edge(b,c,p),edge(c,a,p)].every(value => sign * value >= -1e-5)) projected[u+n*v] = 1;
      }
    }
    assert.deepEqual(projected, volume.masks[letter], `${letter} exported mesh projection differs`);
  }
});
