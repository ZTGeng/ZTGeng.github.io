import test from 'node:test';
import assert from 'node:assert/strict';
import { threeCubeFaces, stellatedFaces, towerOrnament } from '../src/chapters/00-intro/escher/ornaments.js';

const dot = (a,b) => a.reduce((sum,x,i)=>sum+x*b[i],0);

test('three-cube surface fragments lie on cube faces and outside the other solid interiors', () => {
  const faces = threeCubeFaces();
  assert.ok(faces.length > 18);
  for (const {points, normal} of faces) {
    for (const p of points) assert.ok(Math.abs(dot(p,normal)-1)<1e-8);
    const center = points.reduce((s,p)=>s.map((x,i)=>x+p[i]/points.length),[0,0,0]);
    // Inverse rotations of the three component cubes: the visible face
    // centroid must never be strictly inside any component.
    for (let axis=0;axis<3;axis++) {
      const p=[...center], a=(axis+1)%3,b=(axis+2)%3;
      p[a]=(center[a]+center[b])/Math.sqrt(2);
      p[b]=(-center[a]+center[b])/Math.sqrt(2);
      assert.ok(Math.max(...p.map(Math.abs))>=1-1e-8);
    }
  }
});

test('rhombic dodecahedron stellation has twelve correctly sized four-sided peaks', () => {
  const faces=stellatedFaces();
  assert.equal(faces.length,48);
  const peaks=new Set(faces.map(face=>face.points[2].join(',')));
  assert.equal(peaks.size,12);
  for(const {points,normal} of faces) {
    assert.ok(dot(normal,points[0])>0);
    for(const p of points) assert.ok(Math.abs(dot(normal,p)-dot(normal,points[0]))<1e-8);
  }
  for(const kind of [0,1]) {
    const svg=towerOrnament(kind);
    assert.ok(!/NaN|Infinity/.test(svg));
    assert.ok(svg.includes('style="fill:rgb('));
  }
});
