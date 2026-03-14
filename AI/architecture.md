# Architecture

## Tech Stack
- **Framework:** None — pure static HTML5
- **Styling:** Vanilla CSS with CSS custom properties (design tokens)
- **JavaScript:** None (videos use HTML autoplay attributes)
- **Fonts:** Google Fonts — Sora (headings) + Public Sans (body)
- **Deployment:** GitHub Pages from `main` branch, no build step
- **CV generation:** Python script (`scripts/generate_cv_pdf.py`) using ReportLab

## File Structure
```
/ (root — all pages are flat, no subdirectories for HTML)
├── index.html              # Homepage
├── about.html              # About page
├── lucky-tower.html        # Case study
├── merge-lab.html          # Case study
├── beat-runner.html        # Case study
├── draft21.html            # Case study
├── inspector-pro.html      # Case study
├── ice-analytics.html      # Case study (weak — needs work)
├── house-party-vr.html     # Case study
├── superplay-dice-dreams.html  # Case study (current role)
├── styles.css              # Global styles + design tokens (~944 lines)
├── project-page.css        # Case study page styles (~448 lines)
├── about.css               # About page styles (~176 lines)
├── images/                 # Project media (screenshots, videos)
│   ├── Alon photo.JPG
│   ├── lucky-tower/        # 7+ images + MP4
│   ├── Merge lab/          # 6+ PNGs + MP4 (note: space in folder name)
│   ├── beats runner/       # 3+ images + MP4 (note: space in folder name)
│   ├── house party vr/     # 2+ MP4s + PNG (note: space in folder name)
│   └── beatrunner-hero.png
├── assets/                 # SVGs, cover images, GIFs
│   ├── draft21-cover.png
│   ├── ice-analytics-cover.svg
│   ├── inspector-pro-cover.svg
│   └── merge-lab/          # demo.gif + PNGs
├── scripts/
│   └── generate_cv_pdf.py
├── Alon Iter - CV.pdf      # Downloadable CV
└── AI/                     # This AI working layer
```

## CSS Architecture
- `styles.css` — Design tokens (`:root` lines 1-42), reset, nav, hero, homepage sections (build, projects, role-fit, contact), footer, responsive breakpoints
- `project-page.css` — Project hero, meta grid, content sections, galleries, workflow boards, CTAs
- `about.css` — About hero, story layout, sticky photo, value cards, experience section

## Responsive Breakpoints (desktop-first)
1. `1080px` — Grid adjustments (4→2 columns)
2. `880px` — Major layout shifts (grids → single column)
3. `768px` — Tablet (hero adjustments, nav wrapping)
4. `600px` — Large phone (significant size reductions)
5. `480px` — Small phone (section title shrink)

## HTML Patterns (reuse these)
- **Nav:** `<nav class="nav"><div class="nav-container">` with `nav-logo` + `nav-links`
- **Footer:** `<footer class="footer"><div class="container">` with copyright
- **Back link:** `<a href="index.html" class="back-link">← Back to Projects</a>`
- **Project meta:** `<div class="project-meta">` with `meta-item` children (label + value)
- **Content section:** `<div class="content-section">` with `content-title` + `content-text`/`content-list`
- **Project card:** `<div class="project-card">` with image/video, badge, title, metadata, tags, links

## Known Inconsistencies
- Folder names with spaces: `images/Merge lab/`, `images/beats runner/`, `images/house party vr/`
- Two case study patterns: newer (Lucky Tower, SuperPlay) vs older (ICE Analytics, Inspector Pro)
- Footer year: 2026 on most pages, 2025 on ice-analytics.html and house-party-vr.html
- Some project cards have thumbnail images, some use video, Lucky Tower has neither poster nor image
