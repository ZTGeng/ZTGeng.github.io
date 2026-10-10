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

## Comments

Catalog child pages explicitly include `{% include comments.html id='page:/path.html' %}`
before the footer. Posts use the include in `_layouts/post.html`, with a permanent
`comments_id` in their front matter. Keep an existing ID when renaming or moving a
page or post; use a new, unique ID for new content. New posts without an explicit
ID fall back to `post:` plus their Jekyll URL. Place comments outside Vue mount
roots and Liquid `raw` blocks (see `tools/venn/venn.html`).

Public giscus configuration lives in `_data/giscus.yml`. The public repository
must enable Discussions, have the giscus GitHub App installed, and have a
`Comments` category using the Announcement format. Obtain the repository and
category IDs at <https://giscus.app>. Never put a GitHub token in site files.

The widget loads on page opening and uses a specific term with strict matching.
Readers can view comments without signing in; posting requires their own GitHub
account and giscus authorization. Discussions are created on the first comment
or reaction. Language follows `SiteUI`; theme follows the system color scheme.
Script/network failures show a fallback link to GitHub Discussions. Metadata
updates this link to the individual discussion once one exists.

The homepage, catalogs, blog lists/editors, legacy blog (`blog/index-v1.html`),
and `xiren/` do not include comments. Adding a new catalog entry requires adding
the comment include to its child page. Verify coverage and widget behavior with
`node --test test/comments.test.cjs`, then build with Jekyll and check the rendered
pages before deploying. A live smoke test should confirm GitHub sign-in, initial
thread creation, comment persistence after refresh, and isolation between pages.
