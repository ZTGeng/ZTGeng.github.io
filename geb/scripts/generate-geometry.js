import { mkdir, writeFile } from 'node:fs/promises';
import { makeVolume, inspectVolume, meshVolume } from './volume.js';

const volume = makeVolume();
const { projections, ...report } = inspectVolume(volume);
const mesh = meshVolume(volume);
const directory = new URL('../assets/model/', import.meta.url);
await mkdir(directory, { recursive: true });
await writeFile(new URL('sculpture.json', directory), JSON.stringify({ resolution: volume.n, ...mesh }));
await writeFile(new URL('report.json', directory), JSON.stringify({ ...report, triangles: mesh.indices.length / 3 }, null, 2) + '\n');
// These are diagnostic vector reports only, never loaded by the application.
for (const [letter, mask] of Object.entries(projections)) {
  const n = volume.n;
  const paths = [];
  for (let v = 0; v < n; v++) for (let u = 0; u < n; u++) if (mask[u + v * n]) {
    paths.push(`M${u} ${n - 1 - v}h1v1h-1z`);
  }
  await writeFile(new URL(`projection-${letter}.svg`, directory),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 ${n+8} ${n+8}"><rect x="-4" y="-4" width="${n+8}" height="${n+8}" fill="#f0e6d3"/><path d="${paths.join('')}" fill="#29231e"/></svg>\n`);
}
console.log(JSON.stringify({ ...report, triangles: mesh.indices.length / 3 }, null, 2));
