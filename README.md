# Soumik Belel — Portfolio

An ultramodern personal portfolio with a live GitHub projects viewer and a downloadable resume. Pure static HTML/CSS/JS — no build step, no dependencies.

## Pages
- **`index.html`** — main portfolio: hero, what I do, an interactive Knowledge Graph, mental models, tech arsenal, and a dynamic terminal.
- **`projects.html`** — a clean projects viewer that pulls my public repositories live from the free GitHub REST API (with offline fallback + caching), plus a resume download and inline preview.

## Tech
- Vanilla HTML, CSS, and JavaScript
- Canvas animations (spiral, knowledge graph, orbits)
- GitHub public REST API (no key required) for the projects viewer

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
