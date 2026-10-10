(() => {
    'use strict';
    if (window.SiteUI) return;
    const storageKey = 'site-language';
    const subscribers = new Set();
    let preference = 'auto';
    try {
        const saved = localStorage.getItem(storageKey);
        if (saved === 'en' || saved === 'zh') preference = saved;
    } catch (_) { /* Storage is optional. */ }
    function getLanguage() {
        return preference === 'auto' ?
            ((navigator.language || 'en').toLowerCase().startsWith('zh') ? 'zh' : 'en') : preference;
    }
    function render() {
        const lang = getLanguage();
        document.querySelectorAll('[data-ui-en]').forEach(element => {
            element.textContent = element.dataset[lang === 'zh' ? 'uiZh' : 'uiEn'] || element.dataset.uiEn;
        });
        document.querySelectorAll('[data-ui-aria-en]').forEach(element => {
            element.setAttribute('aria-label', element.dataset[lang === 'zh' ? 'uiAriaZh' : 'uiAriaEn']);
        });
        document.querySelectorAll('[data-site-language]').forEach(button => {
            const selected = button.dataset.siteLanguage === preference;
            button.disabled = selected;
            button.setAttribute('aria-pressed', String(selected));
            button.parentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
        });
        const header = document.getElementById('site-header');
        if (header) {
            header.lang = lang === 'zh' ? 'zh-CN' : 'en';
            // Compatibility for older pages; new pages subscribe directly.
            if (header.dataset.bilingual === 'true') {
                const callback = header.dataset[lang === 'zh' ? 'callbackZh' : 'callbackEn'];
                if (callback && typeof window[callback] === 'function') window[callback]();
            }
        }
        if (document.documentElement.dataset.bilingual === 'true' ||
            (header && header.dataset.bilingual === 'true')) {
            document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
        }
    }
    function publish() {
        render();
        const language = getLanguage();
        subscribers.forEach(callback => callback(language));
        document.dispatchEvent(new CustomEvent('site:languagechange', {
            detail: { language, preference }
        }));
    }
    function setLanguage(language, persist = true) {
        preference = language === 'zh' || language === 'en' ? language : 'auto';
        if (persist) {
            try {
                if (preference === 'auto') localStorage.removeItem(storageKey);
                else localStorage.setItem(storageKey, preference);
            } catch (_) { /* Keep the in-memory preference. */ }
        }
        publish();
    }
    function onLanguageChange(callback) {
        subscribers.add(callback);
        callback(getLanguage());
        return () => subscribers.delete(callback);
    }
    // HTML entries must contain trusted author-written markup. Only translate
    // leaf elements, never containers holding inputs or live application state.
    function translate(entries, language) {
        entries.forEach(entry => {
            document.querySelectorAll(entry.selector).forEach(element => {
                const value = entry[language] ?? entry.en;
                if (entry.attribute) element.setAttribute(entry.attribute, value);
                else if (entry.html) element.innerHTML = value;
                else element.textContent = value;
            });
        });
    }
    // Keep a message's semantic state so a language change never resets the app.
    function createMessage(selector, messages) {
        let key = null;
        let parameters = {};
        function update(language) {
            const message = key === null ? '' : messages[key][language] ?? messages[key].en;
            const text = typeof message === 'function' ? message(parameters) : message;
            document.querySelectorAll(selector).forEach(element => { element.textContent = text; });
        }
        onLanguageChange(update);
        return (nextKey, nextParameters = {}) => {
            key = nextKey;
            parameters = nextParameters;
            update(getLanguage());
        };
    }
    window.SiteUI = {
        getLanguage, getLanguagePreference: () => preference,
        setLanguage, onLanguageChange, translate, createMessage
    };
    function initialize() {
        document.querySelectorAll('[data-site-language]').forEach(button => {
            button.hidden = false;
            button.addEventListener('click', () => setLanguage(button.dataset.siteLanguage));
        });
        publish();
    }
    window.addEventListener('languagechange', () => {
        if (preference === 'auto') publish();
    });
    window.addEventListener('storage', event => {
        if (event.key !== storageKey && event.key !== null) return;
        if (event.storageArea && event.storageArea !== window.localStorage) return;
        preference = event.newValue === 'en' || event.newValue === 'zh' ? event.newValue : 'auto';
        publish();
    });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
    else initialize();
})();
