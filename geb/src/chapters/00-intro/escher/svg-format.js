// Round only serialized SVG/CSS values. Geometry and animation time retain
// full precision, and non-geometric attributes (IDs, data-*, labels) stay intact.
export function formatNumber(value) {
  if (!Number.isFinite(value)) throw new TypeError('Expected a finite SVG number');
  return String(Number(value.toFixed(3)));
}

const numberToken = /[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi;

export function formatNumericList(value) {
  return value.replace(numberToken, (token, offset) => {
    const formatted = formatNumber(Number(token));
    // A minus/plus can separate path numbers without a comma. If rounding
    // removes that sign (e.g. 1-0.00001), retain a separator: "1 0", not "10".
    return offset > 0 && /[\d.]/.test(value[offset - 1]) && !formatted.startsWith('-')
      ? ` ${formatted}` : formatted;
  });
}

export const formatPoints = points => points
  .map(point => point.map(formatNumber).join(',')).join(' ');

const numericAttribute = /\s(points|d|transform|patternTransform|gradientTransform|viewBox|x|y|x1|y1|x2|y2|cx|cy|r|rx|ry|width|height|stroke-width|stroke-dasharray|stroke-dashoffset|opacity|stdDeviation)="([^"]*)"/g;

export function formatSvgNumbers(markup) {
  return markup.replace(numericAttribute, (_, name, value) =>
    ` ${name}="${formatNumericList(value)}"`);
}
