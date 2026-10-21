import { BufferAttribute, BufferGeometry } from 'three';

export async function loadSculptureGeometry() {
  const response = await fetch(new URL('../assets/model/sculpture.json', import.meta.url));
  if (!response.ok) throw new Error(`Sculpture mesh: HTTP ${response.status}`);
  const mesh = await response.json();
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(mesh.positions), 3));
  geometry.setAttribute('normal', new BufferAttribute(new Float32Array(mesh.normals), 3));
  geometry.setIndex(mesh.indices);
  geometry.computeBoundingSphere();
  geometry.computeBoundingBox();
  return geometry;
}
