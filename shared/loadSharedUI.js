const currentScript = document.currentScript;
document.addEventListener('DOMContentLoaded', function () {
    let footer = document.getElementById('footer');
    if (footer) {
        fetch('/shared/footer.html').then(response => {
            return response.text();
        }).then(data => {
            footer.innerHTML = data;
        });
    }
    
    let header = document.getElementById('header');
    if (header) {
        fetch('/shared/header.html').then(response => {
            return response.text();
        }).then(data => {
            header.innerHTML = data;
        }).then(() => {
            const activeTab = currentScript.getAttribute('data-active-tab');
            if (activeTab) {
                const tabs = document.getElementsByClassName('nav-' + activeTab);
                for (let i = 0; i < tabs.length; i++) {
                    tabs[i].classList.add('active');
                }

                const breadcrumbCatalogs = header.getElementsByClassName('breadcrumb-' + activeTab);
                for (let i = 0; i < breadcrumbCatalogs.length; i++) {
                    breadcrumbCatalogs[i].removeAttribute('hidden');
                }
            }

            const breadcrumbPageTitle = currentScript.getAttribute('data-breadcrumb-page');
            if (breadcrumbPageTitle) {
                // Always setup the En breadcrumb page with the default breadcrumb title
                const breadcrumbPageEn = document.getElementById('breadcrumb-page-en');
                if (breadcrumbPageEn) {
                    breadcrumbPageEn.textContent = breadcrumbPageTitle;
                    breadcrumbPageEn.removeAttribute('hidden');
                }
                // When the Zh breadcrumb title is available, setup the Zh breadcrumb page
                // Otherwise, use the default breadcrumb title for the Zh breadcrumb page
                const breadcrumbPageZh = document.getElementById('breadcrumb-page-zh');
                if (breadcrumbPageZh) {
                    const breadcrumbPageTitleZh = currentScript.getAttribute('data-breadcrumb-page-zh');
                    breadcrumbPageZh.textContent = breadcrumbPageTitleZh || breadcrumbPageTitle;
                    breadcrumbPageZh.removeAttribute('hidden');
                }
            } else {
                const breadcrumbCatalogs = header.getElementsByClassName('breadcrumb-' + activeTab);
                for (let i = 0; i < breadcrumbCatalogs.length; i++) {
                    // Remove the link
                    breadcrumbCatalogs[i].textContent = breadcrumbCatalogs[i].textContent;
                    breadcrumbCatalogs[i].setAttribute('aria-current', 'page');
                    breadcrumbCatalogs[i].classList.add('active');
                }
            }

            const userLang = navigator.language || navigator.userLanguage;
            if (userLang.slice(0, 2) === 'zh') {
                document.getElementById('nav-zh').removeAttribute('hidden');
                document.getElementById('nav-en').setAttribute('hidden', '');
            }

            const isLangEnabled = currentScript.getAttribute('data-lang-enabled');
            if (isLangEnabled === 'true') {
                const langSwitchers = document.getElementsByClassName('lang-switcher');
                for (let i = 0; i < langSwitchers.length; i++) {
                    langSwitchers[i].removeAttribute('hidden');
                }
            }
        });
    }
});
function onEn() {
    const callback = currentScript.getAttribute('data-en-callback');
    if (callback) {
        window[callback]();
    }
}
function onZh() {
    const callback = currentScript.getAttribute('data-zh-callback');
    if (callback) {
        window[callback]();
    }
}