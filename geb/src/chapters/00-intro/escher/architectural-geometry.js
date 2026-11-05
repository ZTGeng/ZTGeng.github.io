// Intersect infinite screen-space lines, each given by an origin and direction.
// Parallel/coincident lines have no unique intersection.
export function intersectLines(origin, direction, otherOrigin, otherDirection) {
  const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
  const determinant = cross(direction, otherDirection);
  if (determinant === 0) return null;
  const delta = otherOrigin.map((value, i) => value - origin[i]);
  const t = cross(delta, otherDirection) / determinant;
  return origin.map((value, i) => value + t * direction[i]);
}

// at(width, height) projects a point on any facade. The quadratic control
// point is above the crown so the actual apex remains exactly at height.
export function archOutline(at, width, height, rise = height * .4, closed = true) {
  return `M${at(0, 0)}L${at(0, height - rise)}Q${at(width / 2, height + rise)} ${at(width, height - rise)}L${at(width, 0)}${closed ? 'Z' : ''}`;
}

// One local stair model drives treads, risers and solid side silhouettes.
// Width/run are ground-plane vectors; rise descends along the projected z axis.
export function stairGeometry(project, origin, width, run, rise, count) {
  const point = (i, back = 0, outer = 0, down = 0) => project(
    origin[0] + (i + back) * run[0] + outer * width[0],
    origin[1] + (i + back) * run[1] + outer * width[1],
    origin[2] - (i + down) * rise,
  );
  return {
    tread: i => [point(i), point(i, 0, 1), point(i, 1, 1), point(i, 1)],
    riser: i => [point(i, 1), point(i, 1, 1), point(i, 1, 1, 1), point(i, 1, 0, 1)],
    side(outer) {
      const outline = [point(0, 0, outer)];
      for (let i = 0; i < count; i++) outline.push(point(i, 1, outer), point(i, 1, outer, 1));
      outline.push(point(0, 0, outer, count));
      return outline;
    },
  };
}
