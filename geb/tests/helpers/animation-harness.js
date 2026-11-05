// Minimal deterministic SVG/RAF host: records all visible attribute/style writes.
export function animationHarness(startAnimation) {
  const saved = new Map();
  const install = (name, value) => {
    saved.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
  };
  let datasetReads = 0, nextFrame = 1;
  const frames = new Map(), nodes = [];
  const element = (data = {}) => {
    const el = {
      attributes: {}, style: {}, children: [], listeners: {},
      dataset: new Proxy(data, { get(target, name) { datasetReads++; return target[name]; } }),
      setAttribute(name, value) { this.attributes[name] = value; },
      addEventListener(name, fn) { this.listeners[name] = fn; },
    };
    nodes.push(el);
    return el;
  };
  const rotor = element();
  const buckets = Array.from({ length: 4 }, () => {
    const el = element(); el.children = [element(), element()]; return el;
  });
  const thread = element({ speed: '22', period: '74' });
  thread.getTotalLength = () => 300;
  thread.getPointAtLength = x => ({ x, y: x * .2 + Math.sin(x / 40) });
  const ripple = element({ phase: '.17', speed: '21.8' });
  const lane = { querySelector: () => thread, querySelectorAll: () => [ripple] };
  const current = element({ currentDirection: '-1' });
  current.querySelectorAll = () => [lane];
  const selectors = {
    '#escher-wheel-buckets .wheel-moving-bucket': buckets,
    '.channel-current': [current],
    '.fall-streak': [element(), element()],
    '.splash-drop': [element(), element(), element()],
    '.splash-mist': [element(), element()],
    '.pond-ripple ellipse': [element(), element()],
  };
  const button = element(), panel = { hidden: false };
  const root = {
    dataset: {}, after() {}, closest: () => panel,
    querySelector: () => rotor, querySelectorAll: selector => selectors[selector],
  };
  let intersection;
  const reduce = { matches: false, addEventListener() {}, removeEventListener() {} };
  install('document', { hidden: false, createElement: () => button, addEventListener() {}, removeEventListener() {} });
  install('window', { addEventListener() {} });
  install('matchMedia', () => reduce);
  install('requestAnimationFrame', fn => { const id = nextFrame++; frames.set(id, fn); return id; });
  install('cancelAnimationFrame', id => frames.delete(id));
  install('IntersectionObserver', class {
    constructor(fn) { intersection = fn; }
    observe() {} disconnect() {}
  });
  install('MutationObserver', class { observe() {} disconnect() {} });
  const restore = () => {
    for (const [name, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  };
  let destroy;
  try { destroy = startAnimation(root); intersection([{ isIntersecting: true }]); }
  catch (error) { restore(); throw error; }
  return {
    get datasetReads() { return datasetReads; },
    get state() { return root.dataset.motionState; },
    snapshot: () => nodes.filter(node => node !== button)
      .map(({ attributes, style }) => ({ attributes: { ...attributes }, style: { ...style } })),
    advance(now) {
      const callbacks = [...frames.values()]; frames.clear();
      callbacks.forEach(fn => fn(now));
    },
    toggle() { button.listeners.click(); },
    close() { try { destroy(); } finally { restore(); } },
  };
}
