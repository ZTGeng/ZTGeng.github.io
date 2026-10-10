(() => {
    'use strict';
    const section = document.getElementById('site-comments');
    if (!section || section.dataset.initialized) return;
    section.dataset.initialized = 'true';

    const container = section.querySelector('.giscus');
    const status = section.querySelector('[data-comments-status]');
    const link = section.querySelector('[data-comments-link]');
    let language = window.SiteUI ? window.SiteUI.getLanguage() :
        ((navigator.language || 'en').startsWith('zh') ? 'zh' : 'en');
    let state = 'loading';
    let timer;
    let script;
    let widgetError = false;
    const copy = {
        zh: {
            heading: '评论', note: '登录自己的 GitHub 账号即可发表评论。',
            loading: '正在加载评论……', unavailable: '评论暂未配置完成，请稍后再试。',
            failed: '评论加载失败，请刷新页面重试，或前往 GitHub Discussions。',
            link: '在 GitHub Discussions 中查看'
        },
        en: {
            heading: 'Comments', note: 'Sign in with your GitHub account to comment.',
            loading: 'Loading comments…', unavailable: 'Comments are not configured yet. Please try again later.',
            failed: 'Comments could not load. Refresh to retry, or visit GitHub Discussions.',
            link: 'View on GitHub Discussions'
        }
    };

    function render() {
        const strings = copy[language];
        section.lang = language === 'zh' ? 'zh-CN' : 'en';
        section.querySelector('h2').textContent = strings.heading;
        section.querySelector('[data-comments-note]').textContent = strings.note;
        link.textContent = strings.link;
        status.hidden = state === 'ready';
        status.textContent = strings[state] || '';
    }

    function setState(next) {
        state = next;
        if (next !== 'loading') clearTimeout(timer);
        render();
    }

    function syncWidgetLanguage() {
        const frame = container.querySelector('iframe.giscus-frame');
        if (frame) frame.contentWindow.postMessage({ giscus: {
            setConfig: { lang: language === 'zh' ? 'zh-CN' : 'en' }
        } }, 'https://giscus.app');
    }

    document.addEventListener('site:languagechange', event => {
        language = event.detail.language === 'zh' ? 'zh' : 'en';
        render();
        syncWidgetLanguage();
        if (script) script.dataset.lang = language === 'zh' ? 'zh-CN' : 'en';
    });

    // Accept events only from this widget, not other frames on the page.
    window.addEventListener('message', event => {
        const frame = container.querySelector('iframe.giscus-frame');
        if (event.origin !== 'https://giscus.app' || !frame || event.source !== frame.contentWindow) return;
        const data = event.data && event.data.giscus;
        if (!data || typeof data !== 'object') return;
        if (typeof data.error === 'string') {
            // An empty thread is normal: giscus creates it on the first comment.
            if (data.error.includes('Discussion not found')) setState('ready');
            else if (!/Bad credentials|Invalid state value|State has expired/.test(data.error)) {
                widgetError = true;
                setState('failed');
            }
        } else if (data.discussion || data.resizeHeight) {
            if (!widgetError) setState('ready');
        }
        if (data.discussion && typeof data.discussion.url === 'string') {
            try {
                const url = new URL(data.discussion.url, 'https://github.com');
                if (url.origin === 'https://github.com' && url.pathname.startsWith('/' + section.dataset.repo + '/discussions/')) {
                    link.href = url.href;
                }
            } catch (_) { /* Keep the repository link if metadata is malformed. */ }
        }
    });

    render();
    const config = section.dataset;
    if (!config.repo || !config.repoId || !config.categoryId || !config.commentId) {
        setState('unavailable');
        return;
    }

    script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    const attributes = {
        repo: config.repo, 'repo-id': config.repoId,
        category: config.category, 'category-id': config.categoryId,
        mapping: 'specific', term: config.commentId, strict: '1',
        'reactions-enabled': '1', 'emit-metadata': '1', 'input-position': 'top',
        theme: config.theme || 'preferred_color_scheme',
        lang: language === 'zh' ? 'zh-CN' : 'en', loading: 'eager'
    };
    Object.entries(attributes).forEach(([key, value]) => script.setAttribute('data-' + key, value));
    script.addEventListener('error', () => setState('failed'));
    script.addEventListener('load', () => {
        const frame = container.querySelector('iframe.giscus-frame');
        // A language switch during iframe loading may arrive before its listener.
        if (frame) frame.addEventListener('load', syncWidgetLanguage);
    });
    timer = setTimeout(() => setState('failed'), 30000);
    section.appendChild(script);
})();
