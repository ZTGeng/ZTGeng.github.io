const currentScript = document.currentScript;
document.addEventListener('DOMContentLoaded', function () {
    let footer = document.getElementById('footer');
    if (footer) {
        fetch('/shared/footer.html').then(response => {
            return response.text();
        }).then(data => {
            document.getElementById('footer').innerHTML = data;
        });
    }
    
    let header = document.getElementById('header');
    if (header) {
        fetch('/shared/header.html').then(response => {
            return response.text();
        }).then(data => {
            document.getElementById('header').innerHTML = data;
        }).then(() => {
            const activeTab = currentScript.getAttribute('data-active-tab');
            if (activeTab) {
                let tabs = document.getElementsByClassName('nav-' + activeTab);
                for (let i = 0; i < tabs.length; i++) {
                    tabs[i].classList.add('active');
                }

                let breadcrumbCatalogs = document.getElementsByClassName('breadcrumb-' + activeTab);
                for (let i = 0; i < breadcrumbCatalogs.length; i++) {
                    breadcrumbCatalogs[i].removeAttribute('hidden');
                }
                const breadcrumbPageTitle = currentScript.getAttribute('data-breadcrumb-page');
                if (breadcrumbPageTitle) {
                    let breadcrumbPageEn = document.getElementById('breadcrumb-page-en');
                    breadcrumbPageEn.textContent = breadcrumbPageTitle;
                    breadcrumbPageEn.removeAttribute('hidden');
                    let breadcrumbPageZh = document.getElementById('breadcrumb-page-zh');
                    const breadcrumbPageTitleZh = currentScript.getAttribute('data-breadcrumb-page-zh');
                    breadcrumbPageZh.textContent = breadcrumbPageTitleZh || breadcrumbPageTitle;
                    breadcrumbPageZh.removeAttribute('hidden');
                } else {
                    for (let i = 0; i < breadcrumbCatalogs.length; i++) {
                        breadcrumbCatalogs[i].textContent = breadcrumbCatalogs[i].textContent;
                        breadcrumbCatalogs[i].setAttribute('aria-current', 'page');
                        breadcrumbCatalogs[i].classList.add('active');
                    }
                }
            }

            const userLang = navigator.language || navigator.userLanguage;
            if (userLang.slice(0, 2) === 'zh') {
                document.getElementById('nav-zh').removeAttribute('hidden');
                document.getElementById('nav-en').setAttribute('hidden', '');
            }

            const isLangEnabled = currentScript.getAttribute('data-lang-enabled');
            if (isLangEnabled === 'true') {
                let langSwitchers = document.getElementsByClassName('lang-switcher');
                for (let i = 0; i < langSwitchers.length; i++) {
                    langSwitchers[i].removeAttribute('hidden');
                }
            }
        });
    }
});
function onEn() {
    console.log('en');
    if (currentScript.hasAttribute('data-en-callback')) {
        const callback = currentScript.getAttribute('data-encallback');
        window[callback]();
    }
}
function onZh() {
    console.log('zh');
    if (currentScript.hasAttribute('data-zh-callback')) {
        const callback = currentScript.getAttribute('data-zhcallback');
        window[callback]();
    }
}