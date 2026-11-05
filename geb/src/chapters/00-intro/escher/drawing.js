import { stairGeometry } from './architectural-geometry.js';

export const polygon = (points, className) => `<polygon points="${points.map(p => p.join(',')).join(' ')}" class="${className}"/>`;
export const path = (d, className, attributes = '') => `<path d="${d}" class="${className}" ${attributes}/>`;
export const linePath = (points) => points.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ');
export const add = (a, b, factor = 1) => [a[0] + b[0] * factor, a[1] + b[1] * factor];

export function railing(a, b, height = 23) {
  const count = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 16);
  let posts = '';
  for (let i = 0; i <= count; i++) {
    const x = a[0] + (b[0] - a[0]) * i / count;
    const y = a[1] + (b[1] - a[1]) * i / count;
    posts += `M${x},${y}v${-height - 3}`;
  }
  return `<g class="terrace-railing">${path(`M${a[0]},${a[1] - height}L${b[0]},${b[1] - height}M${a[0]},${a[1] - 6}L${b[0]},${b[1] - 6}${posts}`, 'railing-line')}</g>`;
}

// Each tread ends exactly at the next riser's top. Width and run are oblique
// ground-plane vectors; rise is a vertical displacement on the drawing.
export function stairs(origin, width, run, rise, count) {
  const geometry = stairGeometry((x, y, z) => [x, y - z], [...origin, 0], width, run, rise, count);
  let result = '';
  for (let i = count - 1; i >= 0; i--) {
    result += polygon(geometry.riser(i), 'stone-mid stair-riser');
    result += polygon(geometry.tread(i), 'stone-light stair-tread');
  }
  return `<g class="stone-stairs">${result}</g>`;
}
