// Segment endpoints are fixed after layout initialization. Cache their inverse
// projection and reuse point coordinates across wall, course and water queries.
export function createStationLookup(segment) {
  const [a, d] = segment.from, b = segment.to[0];
  const along = b.map((x, i) => x - a[i]);
  const cross = d.map((x, i) => x - a[i]);
  const skew = segment.to[1].map((x, i) => x - b[i] - d[i] + a[i]);
  const determinant = along[0] * cross[1] - along[1] * cross[0];
  const tapered = skew.some(value => value !== 0);
  const points = new WeakMap();

  return point => {
    const cached = points.get(point);
    if (cached && cached.x === point[0] && cached.y === point[1]) return cached.coordinates;
    const delta = point.map((x, i) => x - a[i]);
    let t = (delta[0] * cross[1] - delta[1] * cross[0]) / determinant;
    let v = (along[0] * delta[1] - along[1] * delta[0]) / determinant;
    // A parallelogram has an exact affine inverse. Only tapered approaches
    // need the original six Newton iterations for a bilinear strip.
    if (tapered) for (let i = 0; i < 6; i++) {
      const error = a.map((x, k) => x + t * along[k] + v * cross[k] + t * v * skew[k] - point[k]);
      const dt = along.map((x, k) => x + v * skew[k]);
      const dv = cross.map((x, k) => x + t * skew[k]);
      const det = dt[0] * dv[1] - dt[1] * dv[0];
      t -= (error[0] * dv[1] - error[1] * dv[0]) / det;
      v -= (dt[0] * error[1] - dt[1] * error[0]) / det;
    }
    const coordinates = { t, v };
    points.set(point, { x: point[0], y: point[1], coordinates });
    return coordinates;
  };
}
