// Run with: node --test tests/site-language.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../shared/site-ui.js'), 'utf8');

function session({ browser = 'zh-TW', saved, blocked = false, bilingual = true } = {}) {
    const events = {};
    const values = new Map(saved ? [['site-language', saved]] : []);
    const localStorage = {
        getItem(key) { if (blocked) throw Error('Storage unavailable'); return values.get(key) ?? null; },
        setItem(key, value) { if (blocked) throw Error('Storage unavailable'); values.set(key, value); },
        removeItem(key) { if (blocked) throw Error('Storage unavailable'); values.delete(key); }
    };
    const root = { lang: 'zh-CN', dataset: { bilingual: String(bilingual) } };
    const nodes = {};
    const window = { localStorage, addEventListener: (name, fn) => { events[name] = fn; } };
    const document = {
        documentElement: root, readyState: 'complete', querySelectorAll: selector => nodes[selector] || [],
        getElementById: () => null, dispatchEvent: event => { events.lastEvent = event; }
    };
    const navigator = { language: browser };
    vm.runInNewContext(source, {
        window, document, navigator, localStorage,
        CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } }
    });
    return { ui: window.SiteUI, events, values, navigator, root, localStorage, nodes };
}

test('automatic language uses browser language; saved choices survive navigation', () => {
    assert.equal(session().ui.getLanguage(), 'zh');
    assert.equal(session({ browser: 'fr-FR' }).ui.getLanguage(), 'en');
    assert.equal(session({ saved: 'invalid' }).ui.getLanguagePreference(), 'auto');
    const first = session();
    first.ui.setLanguage('en');
    assert.equal(session({ saved: first.values.get('site-language') }).ui.getLanguage(), 'en');
    first.ui.setLanguage('auto');
    assert.equal(first.values.has('site-language'), false);
    assert.equal(first.ui.getLanguage(), 'zh');
});

test('browser changes only apply in auto mode; explicit choices sync between tabs', () => {
    const s = session();
    let calls = 0;
    const unsubscribe = s.ui.onLanguageChange(() => calls++);
    assert.equal(calls, 1);
    s.ui.setLanguage('en');
    s.navigator.language = 'zh-CN';
    s.events.languagechange();
    assert.equal(calls, 2);
    s.events.storage({ key: 'site-language', newValue: 'zh', storageArea: s.localStorage });
    assert.equal(s.ui.getLanguage(), 'zh');
    s.events.storage({ key: 'site-language', newValue: null, storageArea: s.localStorage });
    assert.equal(s.ui.getLanguagePreference(), 'auto');
    s.navigator.language = 'en-US';
    s.events.languagechange();
    assert.equal(s.ui.getLanguage(), 'en');
    const before = calls;
    s.events.storage({ key: 'unrelated', newValue: 'zh' });
    assert.equal(calls, before);
    unsubscribe();
    s.ui.setLanguage('zh');
    assert.equal(calls, before);
});

test('storage failures keep manual preference in memory and fixed Chinese content retains lang', () => {
    const s = session({ blocked: true, bilingual: false });
    s.ui.setLanguage('en');
    assert.equal(s.ui.getLanguage(), 'en');
    assert.equal(s.ui.getLanguagePreference(), 'en');
    assert.equal(s.root.lang, 'zh-CN');
    assert.equal(s.events.lastEvent.detail.language, 'en');
    s.ui.setLanguage('auto');
    assert.equal(s.ui.getLanguage(), 'zh');
});

test('clearing local storage restores automatic preference and bilingual document language', () => {
    const s = session({ saved: 'en' });
    assert.equal(s.root.lang, 'en');
    s.events.storage({ key: null, newValue: null, storageArea: s.localStorage });
    assert.equal(s.root.lang, 'zh-CN');
    assert.equal(s.ui.getLanguagePreference(), 'auto');
});

test('dynamic messages keep parameters when translated; reset clears the old result', () => {
    const s = session();
    const output = { textContent: '' };
    s.nodes['#result'] = [output];
    const setMessage = s.ui.createMessage('#result', {
        won: { zh: ({ steps }) => `用了 ${steps} 步获胜`, en: ({ steps }) => `Won in ${steps} steps` }
    });
    setMessage('won', { steps: 12 });
    assert.equal(output.textContent, '用了 12 步获胜');
    s.ui.setLanguage('en');
    assert.equal(output.textContent, 'Won in 12 steps');
    setMessage(null);
    s.ui.setLanguage('zh');
    assert.equal(output.textContent, '');
});
