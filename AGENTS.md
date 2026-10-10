# Project Overview

This repository contains a personal website hosted on GitHub Pages. The custom
domain configured in `CNAME` is `ztgeng.com`. It combines Jekyll-generated pages
with standalone JavaScript games and browser tools.

## Technology Stack

- Jekyll, Liquid templates, and YAML front matter generate blog and catalog pages.
- Markdown uses Kramdown with GFM input and Rouge syntax highlighting.
- HTML, CSS, and vanilla JavaScript form the foundation; Bootstrap 5.3.2 provides
  most shared layout and UI components.
- Many games use jQuery; some pages also use jQuery UI.
- Individual applications use Vue 2 or Vue 3 loaded directly from CDNs.
- The repository has no unified npm build pipeline or main-site backend. No
  `package.json`, Gemfile, or custom GitHub Actions workflow was found during
  the initial review.

## Main Structure

- `index.html`: Personal homepage, featured projects, site highlights, and
  English/Chinese language switching.
- `games/`: Board games, minesweeper variants, cat-catching games, Tetris, and
  other standalone games.
- `tools/`: Text layout, simplified-to-traditional Chinese conversion, gradient
  text, Venn diagrams, and other browser utilities.
- `math/`: Equation-solving tools and coin-weighing puzzles.
- `_posts/`: Markdown articles for the current Jekyll blog.
- `blog/`: Blog listing, browser-based editors, and legacy blog implementation.
- `_layouts/`: Shared catalog (`subindex.html`) and article (`post.html`) templates.
- `_includes/`: Jekyll navigation, footer, and blog-list fragments.
- `_config.yml`: Jekyll configuration, including six posts per blog page.
- `shared/`: Shared scripts, styles, bundled libraries, and HTML fragments.
- `images/`, `fonts/`, `docs/`: Static assets, including a resume PDF.
- `cocgame/`, `gamejam/`, `useless_app/`: Independent or historical project pages.
- `cv.html`: Resume page.
- `xiren/`: Standalone React comedy-performer directory with local React runtime,
  editable JSON data, cross-season filters, and Baidu source-import scripts.

## Architectural Details

- Catalog entries and bilingual text are primarily defined in the YAML front
  matter of `games/index.md`, `tools/index.md`, and `math/index.md`, then rendered
  through `_layouts/subindex.html`.
- Catalog cards use native horizontal scrolling, with responsive sizing in
  `shared/catalog.css` and optional arrow/keyboard controls in
  `shared/catalog-scroll.js`; they do not use Bootstrap Carousel pagination.
- Shared headers and footers use Jekyll includes at build time. Navigation data
  lives in `_data/navigation.yml`; `shared/site-ui.js` manages navigation language,
  saved preferences, and bilingual page callbacks. Independent apps may retain
  their own page shell.
- Most games and tools are independent pages with their own scripts and styles.
  Dependencies and implementation patterns vary by project.
- The current blog uses Jekyll and `_posts/`. The legacy `blog/index-v1.html`
  loads a JSON index and Markdown articles from `blog/posts/` with Vue.
- `math/index.md` is the sole source for `/math/index.html`. The three legacy
  catalog URLs (`games/index-v1.html`, `tools/index-v1.html`, `math/index-v1.html`)
  are lightweight redirects to their current catalogs; they contain no catalog
  data or application scripts.
- `cocgame/coc-server.js` contains a standalone Node.js HTTP server; it is not
  the main site's backend.
- The React adventure game linked from the homepage is a separate project;
  React is not the framework for the main site. The independent `xiren/` page
  uses React with a checked-in browser bundle; its optional esbuild command and
  data refresh instructions are documented in `xiren/README.md`.

Keep this summary aligned with architectural changes. Current source code is
authoritative; this overview describes the local repository, not a verified
live deployment.
