// Original block-letter outlines. Coordinates are normalized, bottom to top.
// Broad strokes and compatible support bands make the three visual hulls agree.
const G = [[.88,1],[.12,1],[0,.88],[0,.12],[.12,0],[.88,0],[1,.12],
  [1,.52],[.52,.52],[.52,.32],[.76,.32],[.76,.22],[.24,.22],
  [.24,.78],[.76,.78],[.76,.66],[1,.66],[1,.88]];
const E = [[0,0],[1,0],[1,.22],[.25,.22],[.25,.40],[.86,.40],
  [.86,.60],[.25,.60],[.25,.78],[1,.78],[1,1],[0,1]];
const B = [[0,0],[.78,0],[1,.16],[1,.35],[.84,.50],
  [1,.65],[1,.84],[.78,1],[0,1]];
const B_HOLES = [
  [[.25,.20],[.70,.20],[.76,.25],[.76,.33],[.68,.39],[.25,.39]],
  [[.25,.61],[.68,.61],[.76,.67],[.76,.75],[.70,.80],[.25,.80]],
];

function inside(u, v, polygon) {
  let result = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i], [xj, yj] = polygon[j];
    if ((yi > v) !== (yj > v) && u < (xj - xi) * (v - yi) / (yj - yi) + xi) result = !result;
  }
  return result;
}

export function makeVolume(n = 96) {
  const masks = Object.fromEntries(['G', 'E', 'B'].map(letter => [letter, new Uint8Array(n * n)]));
  for (let v = 0; v < n; v++) for (let u = 0; u < n; u++) {
    const x = (u + .5) / n, y = (v + .5) / n, i = u + n * v;
    masks.G[i] = +inside(x, y, G);
    masks.E[i] = +inside(x, y, E);
    masks.B[i] = +(inside(x, y, B) && !B_HOLES.some(hole => inside(x, y, hole)));
  }
  const voxels = new Uint8Array(n ** 3);
  // G on x=-wall: horizontal coordinate -z, vertical +y.
  // E on z=-wall: horizontal coordinate +x, vertical +y.
  // B on y=-floor: horizontal coordinate +x, vertical -z.
  for (let z = 0; z < n; z++) for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    voxels[x + n * (y + n * z)] = masks.G[n - 1 - z + n * y]
      & masks.E[x + n * y] & masks.B[x + n * (n - 1 - z)];
  }
  return { n, masks, voxels };
}

export function inspectVolume({ n, masks, voxels }) {
  const projections = Object.fromEntries(['G', 'E', 'B'].map(letter => [letter, new Uint8Array(n * n)]));
  let occupied = 0;
  for (let z = 0; z < n; z++) for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (!voxels[x + n * (y + n * z)]) continue;
    occupied++;
    projections.G[n - 1 - z + n * y] = 1;
    projections.E[x + n * y] = 1;
    projections.B[x + n * (n - 1 - z)] = 1;
  }
  const coverage = {};
  for (const letter of ['G', 'E', 'B']) {
    let expected = 0, actual = 0, extra = 0;
    for (let i = 0; i < n * n; i++) {
      expected += masks[letter][i];
      actual += projections[letter][i];
      extra += projections[letter][i] && !masks[letter][i];
    }
    coverage[letter] = { expected, actual, extra, ratio: actual / expected };
  }
  // Six-neighbour connectivity: edge/corner-only contacts do not count as wood.
  const seen = new Uint8Array(voxels.length), components = [];
  const queue = new Int32Array(occupied);
  for (let seed = 0; seed < voxels.length; seed++) {
    if (!voxels[seed] || seen[seed]) continue;
    let head = 0, tail = 1;
    queue[0] = seed; seen[seed] = 1;
    while (head < tail) {
      const i = queue[head++], x = i % n, y = Math.floor(i / n) % n, z = Math.floor(i / (n * n));
      const neighbors = [x > 0 ? i - 1 : -1, x < n - 1 ? i + 1 : -1,
        y > 0 ? i - n : -1, y < n - 1 ? i + n : -1,
        z > 0 ? i - n * n : -1, z < n - 1 ? i + n * n : -1];
      for (const j of neighbors) if (j >= 0 && voxels[j] && !seen[j]) {
        seen[j] = 1; queue[tail++] = j;
      }
    }
    components.push(tail);
  }
  return { occupied, components, coverage, projections };
}

// Greedy rectangle merging removes internal faces and joins coplanar voxel faces.
// Winding is outward on all six directions; hard normals retain carved edges.
export function meshVolume({ n, voxels }, size = 2.6) {
  const positions = [], normals = [], indices = [];
  const at = (p) => p.every(v => v >= 0 && v < n) ? voxels[p[0] + n * (p[1] + n * p[2])] : 0;
  const mask = new Int8Array(n * n);
  for (let d = 0; d < 3; d++) {
    const u = (d + 1) % 3, v = (d + 2) % 3;
    for (let slice = 0; slice <= n; slice++) {
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
        const a = [0,0,0], b = [0,0,0];
        a[d] = slice - 1; b[d] = slice;
        a[u] = b[u] = i; a[v] = b[v] = j;
        const left = at(a), right = at(b);
        mask[i + j * n] = left === right ? 0 : left ? 1 : -1;
      }
      for (let j = 0; j < n; j++) for (let i = 0; i < n;) {
        const sign = mask[i + j * n];
        if (!sign) { i++; continue; }
        let width = 1, height = 1;
        while (i + width < n && mask[i + width + j * n] === sign) width++;
        heightLoop: while (j + height < n) {
          for (let k = 0; k < width; k++) if (mask[i + k + (j + height) * n] !== sign) break heightLoop;
          height++;
        }
        const base = positions.length / 3;
        for (const [du,dv] of [[0,0],[width,0],[width,height],[0,height]]) {
          const p = [0,0,0], normal = [0,0,0];
          p[d] = slice; p[u] = i + du; p[v] = j + dv; normal[d] = sign;
          positions.push(...p.map(coord => Number(((coord / n - .5) * size).toFixed(7))));
          normals.push(...normal);
        }
        indices.push(...(sign > 0 ? [base,base+1,base+2,base,base+2,base+3]
          : [base,base+2,base+1,base,base+3,base+2]));
        for (let dy = 0; dy < height; dy++) mask.fill(0, i + (j + dy) * n, i + width + (j + dy) * n);
        i += width;
      }
    }
  }
  return { positions, normals, indices };
}
