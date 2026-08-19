# Soumik Belel — Portfolio

An ultramodern personal portfolio with a live GitHub projects viewer and a downloadable resume. Pure static HTML/CSS/JS — no build step, no dependencies.

## Pages
- **`index.html`** — main portfolio: hero, stats, the five-stage career path, experience timeline, an interactive skills constellation, selected projects, and contact.
- **`projects.html`** — a projects viewer that pulls my public repositories live from the free GitHub REST API (with offline fallback + caching), plus a resume download and inline preview.

## Tech
- Vanilla HTML, CSS, and JavaScript
- Canvas animations (hero spiral, skills constellation)
- GitHub public REST API (no key required) for the projects viewer

## Design system
Tokens live in one place — the `:root` block of `styles.css`. `projects.html`
aliases its own names onto those tokens rather than redeclaring the palette, so
a colour or type change is a one-file edit.

- **Type**: `--fs-3xs` … `--fs-3xl` plus two fluid display sizes. 12px is the
  floor for anything a reader has to read.
- **Text colour**: `--text-hi` / `--text-mid` / `--text-lo` are the three usable
  tiers, all passing WCAG AA against the lightest surface in the system.
  `--text-dim` is ornament only — never put it on text.
- **Spacing**: `--sp-1` … `--sp-9`. Section padding, card insets and gaps of
  12px or more come from the scale; smaller optical values stay raw.

## Run locally
Open `index.html` directly, or serve the folder:

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Deploy
Any static host works (GitHub Pages, Netlify, Vercel, Cloudflare Pages). Keep these files together:

```
index.html  projects.html  styles.css  script.js
profile pic.jpg  Soumik_resume.pdf  resume-preview-1.png
```
