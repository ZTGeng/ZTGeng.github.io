# ZTGeng.github.io
Geng's web space

## Shared site UI

Pages using the shared header/footer must have YAML front matter and be served
from Jekyll's generated output (a plain static server does not expand includes).
Use `{% include header.html %}` and `{% include footer.html %}`. The homepage
intentionally includes only the footer. Independent apps can keep their own shell.

Navigation links and translations live in `_data/navigation.yml`. Header options
can be declared in front matter:

```yaml
---
nav_section: games
breadcrumb_en: Chess
breadcrumb_zh: 国际象棋
bilingual: true
callback_en: switchToEn
callback_zh: switchToZh
---
```

Set `bilingual: true` only when the page supports switching its content. Existing
include arguments (`active-tab`, `breadcrumb-page`, `breadcrumb-page-zh`,
`lang-enabled`, `callback-en`, `callback-zh`) remain supported. Wrap Vue template
content in Liquid `raw` blocks; keep Jekyll includes outside those blocks.

`shared/site-ui.js` exposes `SiteUI.getLanguage()` and `SiteUI.setLanguage(lang)`.
It remembers explicit choices in `site-language` local storage and falls back to
the browser language. It emits `site:languagechange` with `detail.language`.
Only bilingual headers update the document language; fixed-language pages retain
their own document language. The homepage listens to the event separately.
Pages with only a footer can load the script explicitly if they need this API.

When editing shared UI, check a catalog, a bilingual demo, a fixed-language tool,
a blog editor, and the homepage. Verify mobile collapse targets, unique IDs,
breadcrumbs, language persistence, unavailable storage, and basic navigation
without JavaScript. Run a Jekyll build before deployment.
