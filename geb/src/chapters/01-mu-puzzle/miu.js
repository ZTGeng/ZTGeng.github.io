import './miu.css';
import { INITIAL_STRING, MAX_LENGTH, applyRule, matchPositions, resultLength } from './miu-rules.js';

const root = document.getElementById('mu-puzzle');
const get = id => root.querySelector(`#miu-${id}`);
const tokenRow = get('string');
const history = get('history');
const historyTooltip = get('history-tooltip');
const reset = get('reset');
const ruleButtons = [...get('rules').querySelectorAll('[data-rule]')];
const labels = ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ'];
const storageKey = 'geb-miu-session-v1';
const initialNode = { value: INITIAL_STRING };
let nodes = [initialNode];
let current = 0;
let pending = null;

function renderString() {
  const { value } = nodes[current];
  const size = pending?.rule === 2 ? 3 : 2;
  const starts = new Set(pending?.positions);
  tokenRow.setAttribute('aria-label', `当前字符串 ${value}`);
  tokenRow.innerHTML = [...value].map((letter, index) => {
    const tile = `class="miu-token" data-letter="${letter}"`;
    if (!starts.has(index)) return `<span ${tile} aria-hidden="true">${letter}</span>`;
    const action = pending.rule === 2 ? '替换' : '删除';
    const label = `${action}第 ${index + 1} 至 ${index + size} 位的 ${letter.repeat(size)}`;
    return `<button type="button" ${tile} data-match="${index}" aria-label="${label}">${letter}</button>`;
  }).join('');
  get('length').textContent = `${value.length} / ${MAX_LENGTH} 字符`;
}

function highlightMatch(start = -1) {
  if (!pending) return;
  const size = pending.rule === 2 ? 3 : 2;
  [...tokenRow.children].forEach((tile, index) => {
    tile.classList.toggle('is-highlighted', start >= 0 && index >= start && index < start + size);
  });
}

function hideHistoryTooltip() {
  historyTooltip.hidden = true;
}

function showHistoryTooltip(button) {
  const code = button.firstElementChild;
  if (code.scrollWidth <= code.clientWidth) {
    hideHistoryTooltip();
    return;
  }

  historyTooltip.textContent = code.textContent;
  historyTooltip.hidden = false;
  const { width, height } = historyTooltip.getBoundingClientRect();
  const anchor = button.getBoundingClientRect();
  const gap = 8;
  const viewportWidth = document.documentElement.clientWidth;
  const left = Math.max(gap, Math.min(anchor.left, viewportWidth - width - gap));
  const above = anchor.top - height - gap;
  const top = above >= gap ? above : Math.min(anchor.bottom + gap, window.innerHeight - height - gap);
  historyTooltip.style.left = `${left}px`;
  historyTooltip.style.top = `${Math.max(gap, top)}px`;
}

function renderHistory() {
  reset.disabled = current === 0;
  const rendered = history.children.length;
  if (rendered < nodes.length) {
    const rows = nodes.slice(rendered).map(({ value }, offset) => {
      const id = rendered + offset;
      const badge = id === 0 ? '<span>起点</span>' : '';
      return `<li><button type="button" data-node="${id}"><code>${value}</code>${badge}</button></li>`;
    });
    history.insertAdjacentHTML('beforeend', rows.join(''));
  }

  history.querySelector('[aria-current="step"]')?.removeAttribute('aria-current');
  const selected = history.children[current].firstElementChild;
  selected.setAttribute('aria-current', 'step');
  const top = selected.offsetTop - 4;
  const bottom = selected.offsetTop + selected.offsetHeight + 4;
  if (top < history.scrollTop) history.scrollTop = top;
  else if (bottom > history.scrollTop + history.clientHeight) history.scrollTop = bottom - history.clientHeight;
  return selected;
}

function render() {
  renderString();
  const { value } = nodes[current];
  const blocked = [];
  ruleButtons.forEach((button, rule) => {
    const applicable = matchPositions(value, rule).length > 0;
    const exceedsLimit = applicable && resultLength(value, rule) > MAX_LENGTH;
    button.disabled = !applicable || exceedsLimit;
    button.dataset.pending = String(pending?.rule === rule);
    if (exceedsLimit) blocked.push(labels[rule]);
  });
  const notice = get('notice');
  notice.hidden = blocked.length === 0;
  notice.textContent = blocked.length ? `规则 ${blocked.join('、')} 会超出 ${MAX_LENGTH} 字符上限。` : '';
  get('rule-title').textContent = pending ? `点选 ${pending.rule === 2 ? 'III' : 'UU'} 的起始字块` : '应用规则';
}

function save() {
  const actions = nodes.slice(1).map(({ parent, rule, index }) => [parent, rule, index]);
  try {
    sessionStorage.setItem(storageKey, JSON.stringify({ actions, current }));
  } catch {
    // Keep the current session playable when storage is unavailable.
  }
}

function restore() {
  let saved;
  try {
    saved = JSON.parse(sessionStorage.getItem(storageKey));
  } catch {
    return;
  }
  if (!Array.isArray(saved?.actions) || !Number.isInteger(saved.current)) return;
  const restored = [initialNode];
  const idByValue = new Map([[INITIAL_STRING, 0]]);
  // Older sessions can refer to any duplicate as the parent of a later move.
  const originalToUnique = [0];
  for (const action of saved.actions) {
    if (!Array.isArray(action)) return;
    const [originalParent, rule, index] = action;
    if (!Number.isInteger(originalParent)) return;
    const parent = originalToUnique[originalParent];
    if (parent === undefined) return;
    const value = applyRule(restored[parent].value, rule, index);
    if (value === null) return;
    let id = idByValue.get(value);
    if (id === undefined) {
      id = restored.length;
      restored.push({ value, parent, rule, index });
      idByValue.set(value, id);
    }
    originalToUnique.push(id);
  }
  const selected = originalToUnique[saved.current];
  if (selected === undefined) return;
  nodes = restored;
  current = selected;
  if (restored.length < originalToUnique.length) save();
}

function select(id, announcement, focus) {
  current = id;
  pending = null;
  render();
  const selected = renderHistory();
  get('status').textContent = `${announcement}。当前字符串 ${nodes[id].value}。`;
  save();
  if (focus === 'history') selected.focus({ preventScroll: true });
  if (typeof focus === 'number') {
    const button = ruleButtons[focus];
    const fallback = ruleButtons.find(candidate => !candidate.disabled);
    (button.disabled ? fallback : button)?.focus({ preventScroll: true });
  }
}

function apply(rule, index) {
  const value = applyRule(nodes[current].value, rule, index);
  if (value === null) return;
  let id = nodes.findIndex(node => node.value === value);
  if (id < 0) {
    id = nodes.length;
    nodes.push({ value, parent: current, rule, index });
  }
  select(id, `已应用规则 ${labels[rule]}`, rule);
}

get('rules').addEventListener('click', event => {
  const button = event.target.closest('[data-rule]');
  if (!button || button.disabled) return;
  const rule = Number(button.dataset.rule);
  if (pending?.rule === rule) {
    cancelPick();
    return;
  }
  const matches = matchPositions(nodes[current].value, rule);
  if (matches.length === 1) {
    apply(rule, matches[0]);
  } else if (matches.length > 1) {
    pending = { rule, positions: matches };
    render();
    if (event.detail === 0) {
      tokenRow.querySelector('[data-match]').focus();
      highlightMatch(matches[0]);
    }
  }
});

tokenRow.addEventListener('click', event => {
  const button = event.target.closest('[data-match]');
  if (button && pending) apply(pending.rule, Number(button.dataset.match));
});
const preview = event => {
  const button = event.target.closest('[data-match]');
  if (button) highlightMatch(Number(button.dataset.match));
};
tokenRow.addEventListener('pointerover', preview);
tokenRow.addEventListener('focusin', preview);
tokenRow.addEventListener('pointerout', event => {
  if (!event.target.closest('[data-match]')) return;
  const focused = tokenRow.querySelector('[data-match]:focus-visible');
  highlightMatch(focused ? Number(focused.dataset.match) : -1);
});
tokenRow.addEventListener('focusout', () => highlightMatch());

function cancelPick() {
  const { rule } = pending;
  pending = null;
  render();
  ruleButtons[rule].focus({ preventScroll: true });
}
history.addEventListener('click', event => {
  const button = event.target.closest('[data-node]');
  if (button) select(Number(button.dataset.node), '已选中历史状态', 'history');
});
reset.addEventListener('click', () => {
  hideHistoryTooltip();
  select(0, '已回到起点', 'history');
});
history.addEventListener('pointerover', event => {
  const button = event.target.closest('[data-node]');
  if (button && event.pointerType !== 'touch' && !button.contains(event.relatedTarget)) showHistoryTooltip(button);
});
history.addEventListener('pointerout', event => {
  const button = event.target.closest('[data-node]');
  if (button && !button.contains(event.relatedTarget)) hideHistoryTooltip();
});
history.addEventListener('focusin', event => {
  const button = event.target.closest('[data-node]:focus-visible');
  if (button) showHistoryTooltip(button);
});
history.addEventListener('focusout', hideHistoryTooltip);
window.addEventListener('scroll', hideHistoryTooltip, { capture: true, passive: true });
window.addEventListener('resize', hideHistoryTooltip);

const help = get('help');
const helpToggle = get('help-toggle');
helpToggle.addEventListener('click', () => {
  hideHistoryTooltip();
  help.showModal();
});
get('help-close').addEventListener('click', () => help.close());
help.addEventListener('click', event => {
  if (event.target !== help) return;
  const { left, right, top, bottom } = help.getBoundingClientRect();
  if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) help.close();
});
help.addEventListener('close', () => helpToggle.focus({ preventScroll: true }));
root.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  hideHistoryTooltip();
  if (!pending || help.open) return;
  event.preventDefault();
  cancelPick();
});

restore();
render();
renderHistory();
