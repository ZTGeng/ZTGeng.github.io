export const INITIAL_STRING = 'MI';
export const MAX_LENGTH = 256;

export function matchPositions(value, rule) {
  if (rule === 0) return value.endsWith('I') ? [value.length] : [];
  if (rule === 1) return value.startsWith('M') ? [1] : [];
  const pattern = rule === 2 ? 'III' : rule === 3 ? 'UU' : null;
  if (!pattern) return [];

  const matches = [];
  for (let index = value.indexOf(pattern); index !== -1; index = value.indexOf(pattern, index + 1)) {
    matches.push(index);
  }
  return matches;
}

export function resultLength(value, rule) {
  if (rule === 0) return value.length + 1;
  if (rule === 1) return value.length * 2 - 1;
  return value.length - 2;
}

export function applyRule(value, rule, index) {
  if (resultLength(value, rule) > MAX_LENGTH || !matchPositions(value, rule).includes(index)) return null;

  switch (rule) {
    case 0: return `${value}U`;
    case 1: return value + value.slice(1);
    case 2: return `${value.slice(0, index)}U${value.slice(index + 3)}`;
    case 3: return value.slice(0, index) + value.slice(index + 2);
  }
}
