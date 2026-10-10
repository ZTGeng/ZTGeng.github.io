(() => {
    'use strict';
    if (window.SiteUI) return;
    const storageKey = 'site-language';
    function getLanguage() {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved === 'en' || saved === 'zh') return saved;
        } catch (_) { /* Navigation works when storage is unavailable. */ }
        return (navigator.language || 'en').toLowerCase().startsWith('zh') ? 'zh' : 'en';
    }
    function setLanguage(language, persist = true) {
        const lang = language === 'zh' ? 'zh' : 'en';
        if (persist) {
            try { localStorage.setItem(storageKey, lang); } catch (_) { /* Optional preference. */ }
        }
        const header = document.getElementById('site-header');
        if (header) {
            header.lang = lang === 'zh' ? 'zh-CN' : 'en';
            header.querySelectorAll('[data-ui-en]').forEach(element => {
                element.textContent = element.dataset[lang === 'zh' ? 'uiZh' : 'uiEn'];
            });
            header.querySelectorAll('[data-site-language]').forEach(button => {
                const selected = button.dataset.siteLanguage === lang;
                button.disabled = selected;
                button.setAttribute('aria-pressed', String(selected));
            });
            if (header.dataset.bilingual === 'true') {
                document.documentElement.lang = header.lang;
                const callback = header.dataset[lang === 'zh' ? 'callbackZh' : 'callbackEn'];
                if (callback && typeof window[callback] === 'function') window[callback]();
            }
        }
        document.dispatchEvent(new CustomEvent('site:languagechange', { detail: { language: lang } }));
    }
    window.SiteUI = { getLanguage, setLanguage };
    function initialize() {
        document.querySelectorAll('[data-site-language]').forEach(button => {
            button.hidden = false;
            button.addEventListener('click', () => setLanguage(button.dataset.siteLanguage));
        });
        setLanguage(getLanguage(), false);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
    else initialize();
})();
