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
---
```

Set `bilingual: true` only when the page supports switching its content. Standalone
HTML pages can use `<html lang="en" data-bilingual="true">` instead. Fixed Chinese
pages retain `<html lang="zh-CN">`; posts default to `zh-CN` and can override it with
`content_lang`. All shared headers offer Auto / English / 中文, including fixed-language
pages: changing the preference translates shared UI, never untranslated content. Existing
include arguments (`active-tab`, `breadcrumb-page`, `breadcrumb-page-zh`,
`lang-enabled`, `callback-en`, `callback-zh`) remain supported. Wrap Vue template
content in Liquid `raw` blocks; keep Jekyll includes outside those blocks.

Load `/shared/site-ui.js` after the charset declaration and before application
scripts. The header also loads it as a fallback; repeated loading is guarded.
Independent apps can load it without using the header. The shared API is:

- `SiteUI.getLanguage()`: effective `zh` or `en`.
- `SiteUI.getLanguagePreference()`: `auto`, `zh`, or `en`.
- `SiteUI.setLanguage(preference)`: switches immediately; `auto` removes the saved
  choice. Existing saved `site-language` values remain compatible. Blocked storage
  keeps the choice in memory for the current page.
- `SiteUI.onLanguageChange(callback)`: immediately calls `callback(language)` and
  subscribes to updates; returns an unsubscribe function for Vue/React cleanup.
- `SiteUI.translate(entries, language)`: applies page-local `{selector, en, zh}`
  entries. Optional `attribute` translates attributes; `html: true` is only for
  trusted author-written markup without live inputs or state.
- `SiteUI.createMessage(selector, messages)`: returns a setter for a dynamic
  message key and optional parameters. Switching language renders that message
  again; passing `null` clears it. Entries have `en`/`zh` strings or parameter functions.

Auto mode uses `navigator.language` (`zh-*` maps to Simplified Chinese, all other
languages to English), and responds to browser `languagechange`. Explicit choices
override browser settings. Same-origin tabs synchronize via `storage` events.
The compatibility event `site:languagechange` contains `detail.language` and
`detail.preference`. Page code must use this service rather than browser language.

```js
const unsubscribe = SiteUI.onLanguageChange(language => {
    SiteUI.translate([
        { selector: '#reset', en: 'Reset', zh: '重新开始' }
    ], language);
});
```

Keep game state, numeric counters, user input, and article text outside translated
containers. Vue pages update reactive copy without remounting. Fixed Chinese tools
and the current blog editor keep their original content; blog article text is not
translated. The homepage, catalogs, existing bilingual games/math tools, Venn tool,
digital-number demo, legacy blog UI, shared navigation, and comments use this service.

When editing shared UI, check a catalog, a bilingual demo, a fixed-language tool,
a blog editor, and the homepage. Verify mobile collapse targets, unique IDs,
breadcrumbs, language persistence, unavailable storage, and basic navigation
without JavaScript. Run a Jekyll build before deployment.
Run the dependency-free language regression tests with
`node --test tests/site-language.test.cjs`.
Optional browser integration checks run with `node tests/site-language.browser.cjs`
when Playwright is installed (or set `PLAYWRIGHT_MODULE` to its package path).
Windows defaults to Edge; other platforms use Playwright Chromium. These tests use
lightweight include fixtures and sample catalog data, not a full Jekyll build.

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
