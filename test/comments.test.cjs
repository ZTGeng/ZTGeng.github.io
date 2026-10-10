const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const source = read('shared/comments.js');

// A small host DOM mock; the actual giscus UI is checked separately in a browser.
function host(overrides = {}, present = true) {
    const status = { hidden: false }, heading = {}, note = {}, link = {};
    const sent = [], scripts = [];
    const frame = { contentWindow: { postMessage: (...args) => sent.push(args) } };
    const container = { querySelector: () => frame };
    const section = {
        dataset: { repo: 'ZTGeng/ZTGeng.github.io', repoId: 'repo-id', category: 'Comments',
            categoryId: 'category-id', commentId: 'page:/games/gomoku.html', ...overrides },
        querySelector: selector => ({ '.giscus': container, 'h2': heading,
            '[data-comments-status]': status, '[data-comments-note]': note,
            '[data-comments-link]': link })[selector],
        appendChild: script => scripts.push(script)
    };
    const events = {}, windowEvents = {};
    let timeout;
    const context = vm.createContext({
        document: {
            getElementById: () => present ? section : null,
            addEventListener: (type, callback) => { events[type] = callback; },
            createElement: () => ({ dataset: {}, listeners: {},
                setAttribute(key, value) { this[key] = value; },
                addEventListener(type, callback) { this.listeners[type] = callback; } })
        },
        window: { SiteUI: { getLanguage: () => 'zh' },
            addEventListener: (type, callback) => { windowEvents[type] = callback; } },
        navigator: { language: 'zh-CN' }, URL,
        setTimeout: callback => { timeout = callback; return 1; }, clearTimeout: () => {}
    });
    vm.runInContext(source, context);
    return { status, heading, link, scripts, sent, context,
        timeout: () => timeout(),
        language: lang => events['site:languagechange']({ detail: { language: lang } }),
        message: (data, origin = 'https://giscus.app', sender = frame.contentWindow) =>
            windowEvents.message({ origin, source: sender, data: { giscus: data } }) };
}

test('catalog children and posts have unique permanent terms; excluded pages have no include', () => {
    const ids = new Set();
    let count = 0;
    for (const catalog of ['games/index.md', 'tools/index.md', 'math/index.md']) {
        for (const match of read(catalog).matchAll(/^\s+src: "([^"]+)"/gm)) {
            if (match[1] === '/xiren/') continue;
            const content = read(match[1].slice(1));
            const includes = [...content.matchAll(/{% include comments.html id='([^']+)' %}/g)];
            assert.equal(includes.length, 1, match[1]);
            assert.equal(includes[0][1], 'page:' + match[1]);
            assert.ok(!ids.has(includes[0][1])); ids.add(includes[0][1]); count++;
            // The include must not be swallowed by Liquid raw blocks.
            const prefix = content.slice(0, includes[0].index);
            assert.equal([...prefix.matchAll(/{% raw %}/g)].length,
                [...prefix.matchAll(/{% endraw %}/g)].length, match[1]);
        }
    }
    assert.equal(count, 24);
    for (const post of fs.readdirSync(path.join(root, '_posts'))) {
        const id = read('_posts/' + post).match(/^comments_id: "([^"]+)"$/m)?.[1];
        assert.ok(id && !ids.has(id), post); ids.add(id);
    }
    assert.match(read('_layouts/post.html'), /{% include comments.html %}/);
    for (const file of ['index.html', '_layouts/subindex.html', 'blog/index.html',
        'blog/index-v1.html', 'blog/editor.html', 'blog/editor-v1.html', 'xiren/index.html']) {
        assert.doesNotMatch(read(file), /include comments.html|shared\/comments.js/);
    }
});

test('loads eagerly with a fixed strict term and does not duplicate the widget', () => {
    const app = host(), script = app.scripts[0];
    assert.equal(script['data-term'], 'page:/games/gomoku.html');
    assert.equal(script['data-mapping'], 'specific');
    assert.equal(script['data-strict'], '1');
    assert.equal(script['data-loading'], 'eager');
    vm.runInContext(source, app.context);
    assert.equal(app.scripts.length, 1);
    assert.equal(host({}, false).scripts.length, 0);
});

test('empty threads are normal; untrusted frames cannot change state or links', () => {
    const app = host();
    app.message({ resizeHeight: 300 }, 'https://example.com');
    app.message({ resizeHeight: 300 }, 'https://giscus.app', {});
    assert.equal(app.status.hidden, false);
    app.message({ error: 'Discussion not found' });
    assert.equal(app.status.hidden, true);
    app.message({ discussion: { url: 'https://github.com/ZTGeng/ZTGeng.github.io/discussions/2' } });
    assert.match(app.link.href, /discussions\/2$/);
    app.message({ discussion: { url: 'https://example.com/phishing' } });
    assert.match(app.link.href, /discussions\/2$/);
});

test('language changes update the widget without changing its discussion', () => {
    const app = host(); app.language('en');
    assert.equal(app.heading.textContent, 'Comments');
    assert.equal(app.sent[0][0].giscus.setConfig.lang, 'en');
    assert.equal(app.sent[0][1], 'https://giscus.app');
    assert.equal(app.scripts[0]['data-term'], 'page:/games/gomoku.html');
});

test('configuration and network failures show a fallback; a slow widget can recover', () => {
    const missing = host({ categoryId: '' });
    assert.equal(missing.scripts.length, 0);
    assert.match(missing.status.textContent, /暂未配置/);
    const blocked = host(); blocked.scripts[0].listeners.error();
    assert.match(blocked.status.textContent, /加载失败/);
    const slow = host(); slow.timeout();
    assert.equal(slow.status.hidden, false);
    slow.message({ resizeHeight: 300 });
    assert.equal(slow.status.hidden, true);
    const invalid = host(); invalid.message({ error: 'Repository not found' });
    invalid.message({ resizeHeight: 300 });
    assert.equal(invalid.status.hidden, false);
});
