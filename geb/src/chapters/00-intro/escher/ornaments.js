import { scene } from './scene.js';
import { path, linePath } from './drawing.js';

const dot = (a, b) => a.reduce((sum, x, i) => sum + x * b[i], 0);
const add = (a, b) => a.map((x, i) => x + b[i]);
const scale = (a, s) => a.map(x => x * s);
const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const unit = a => scale(a, 1 / Math.hypot(...a));

function rotate(p, axis, angle) {
  const q = [...p], a = (axis + 1) % 3, b = (axis + 2) % 3;
  q[a] = p[a] * Math.cos(angle) - p[b] * Math.sin(angle);
  q[b] = p[a] * Math.sin(angle) + p[b] * Math.cos(angle);
  return q;
}

// Split a face by nÂ·p <= d, retaining both sides for solid subtraction.
function split(points, n, d) {
  const inside = [], outside = [];
  points.forEach((p, i) => {
    const q = points[(i + 1) % points.length];
    const a = dot(p, n) - d, b = dot(q, n) - d;
    if (a <= 1e-9) inside.push(p);
    if (a >= -1e-9) outside.push(p);
    if ((a < -1e-9 && b > 1e-9) || (a > 1e-9 && b < -1e-9)) {
      const intersection = add(p, scale(add(q, scale(p, -1)), a / (a - b)));
      inside.push(intersection); outside.push(intersection);
    }
  });
  return { inside, outside };
}

function cube(axis) {
  const faces = [];
  for (let k = 0; k < 3; k++) for (const sign of [-1, 1]) {
    const normal = [0, 0, 0]; normal[k] = sign;
    const points = [[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b]) => {
      const p = [0,0,0]; p[k] = sign; p[(k+1)%3] = a; p[(k+2)%3] = b;
      return rotate(p, axis, Math.PI / 4);
    });
    faces.push({ points, normal: rotate(normal, axis, Math.PI / 4), d: 1 });
  }
  return faces;
}

export function threeCubeFaces() {
  const cubes = [0,1,2].map(cube);
  return cubes.flatMap((faces, index) => faces.flatMap(face => {
    let pieces = [face.points];
    for (let other = 0; other < 3; other++) if (other !== index) {
      pieces = pieces.flatMap(points => {
        const exposed = [];
        let remaining = points;
        for (const plane of cubes[other]) {
          if (remaining.length < 3) break;
          const result = split(remaining, plane.normal, plane.d);
          if (result.outside.length >= 3) exposed.push(result.outside);
          remaining = result.inside;
        }
        return exposed;
      });
    }
    return pieces.map(points => ({ points, normal: face.normal }));
  }));
}

export function stellatedFaces() {
  const faces = [];
  // Rhombic dodecahedron vertices: (Â±2,0,0) and (Â±1,Â±1,Â±1).
  // Each face at nÂ·p=2 is augmented to apex 2n (height sqrt(2)).
  for (let zero = 0; zero < 3; zero++) for (const a of [-1,1]) for (const b of [-1,1]) {
    const i = (zero+1)%3, j = (zero+2)%3;
    const p = [0,0,0], q = [0,0,0], r = [0,0,0], s = [0,0,0];
    p[i]=2*a; q[i]=a; q[j]=b; q[zero]=1;
    r[j]=2*b; s[i]=a; s[j]=b; s[zero]=-1;
    const apex = [0,0,0]; apex[i]=2*a; apex[j]=2*b;
    const ring = [p,q,r,s];
    ring.forEach((v,k) => {
      const points = [v, ring[(k+1)%4], apex];
      let normal = unit(cross(add(points[1],scale(v,-1)),add(apex,scale(v,-1))));
      if (dot(normal, v) < 0) normal = scale(normal,-1);
      faces.push({points,normal});
    });
  }
  return faces;
}

export function towerOrnament(kind) {
  const a = scene.waterwayDirections.across[1], b = -scene.waterwayDirections.receding[1];
  const azimuth = Math.atan(Math.sqrt(a / b));
  const elevation = Math.asin(Math.sqrt(a * b));
  const screenX = [Math.cos(azimuth),Math.sin(azimuth),0];
  const screenY = [Math.sin(elevation)*Math.sin(azimuth),-Math.sin(elevation)*Math.cos(azimuth),-Math.cos(elevation)];
  const view = unit(cross(screenX, screenY));
  const light = unit([-1,-2,4]);
  const yaw = scene.ornamentYawDegrees[kind] * Math.PI / 180;
  const faces = (kind === 0 ? threeCubeFaces() : stellatedFaces()).map(face => ({
    points: face.points.map(p => rotate(p,2,yaw)), normal: rotate(face.normal,2,yaw),
  }));
  const size = kind === 0 ? 98 : 100;
  const projected = faces.flatMap(face => face.points.map(p => [dot(p,screenX),dot(p,screenY)]));
  const maxY = Math.max(...projected.map(p=>p[1]));
  const minY = Math.min(...projected.map(p=>p[1]));
  const zoom = size / (maxY-minY);
  return faces.filter(face=>dot(face.normal,view)<-1e-8)
    .sort((f,g)=>dot(scale(g.points.reduce(add,[0,0,0]),1/g.points.length),view)-dot(scale(f.points.reduce(add,[0,0,0]),1/f.points.length),view))
    .map(face => {
      const brightness = Math.max(0, dot(face.normal,light));
      const shade = Math.round(91 + brightness * 115);
      return path(linePath(face.points.map(p=>[dot(p,screenX)*zoom,(dot(p,screenY)-maxY)*zoom+16]))+'Z','ornament-face',`style="fill:rgb(${shade},${shade+1},${shade-10})"`);
    }).join('');
}
