# Noctis Architect — Portfolio

Static, bilingual (EN/FA) portfolio. No build step, no dependencies.

```
index.html  work.html  about.html  contact.html
projects/            one page per project (12)
assets/
  css/style.css      all styles (colours at the top, in :root)
  js/i18n.js         every string, in both languages
  js/app.js          language + theme switch, page transitions, reveals, filter
  js/scene.js        the WebGL wireframe (hand-written, no library)
  img/               homepage screenshots for the client projects
  favicon.svg
```

## Editing text

Every string in the HTML carries a `data-i="key"`. Change the English text in the
markup **and** the same key in both languages inside `assets/js/i18n.js`.

## Adding a project

1. Copy an existing file in `projects/` and change the title, `data-i` keys,
   tags, links and `data-slug`.
2. Add the matching keys (`pdN`) to both languages in `i18n.js`.
3. Add a row to `work.html` (and, if it belongs there, a card to `index.html`),
   pointing at `projects/<slug>.html` with `data-p="project"`.

Project pages keep an empty `.proj-body` section on purpose — that is where the
long-form write-up goes.

## Preferences

On a first visit the site follows the browser: the primary language (`fa*` → Persian,
everything else → English) and the OS colour scheme (`prefers-color-scheme`). Both are
applied from an inline script in `<head>`, before the first paint, so there is no flash
of the wrong language or theme.

Choosing a language or theme stores it in `localStorage` and that choice wins on later
visits. Until a theme is chosen manually, live OS theme changes are followed too.

## Publishing

Pushes to `main` publish automatically to GitHub Pages (branch source, root folder):

**https://noctis-architect.github.io/noctis-portfolio/**

The `.nojekyll` file disables Jekyll processing. The folder can also be uploaded as-is to
any other static host (cPanel, Netlify, Cloudflare Pages, ...). Fonts are self-hosted;
no external services are required at runtime.

## The 3D scene

One wireframe solid per page (home: icosphere, work: torus knot, about: cube,
contact: octahedron, project: torus knot). It sits behind the content and parks
against the screen edge as you scroll. During a page change the camera dives into
the wireframe and pulls back out of the next one.

Tunables at the top of `scene.js`:

- `PAGES` — geometry per page, which edge it parks against (`side`: 1 right, -1 left)
  and its idle spin
- `END` — final position, size and opacity of the solid once scrolled
