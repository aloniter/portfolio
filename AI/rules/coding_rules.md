# Coding Rules

## HTML
- 4-space indentation
- Semantic elements: `<nav>`, `<section>`, `<article>`, `<footer>`, `<main>`
- One `<h1>` per page
- Heading hierarchy: h1 → h2 → h3 (never skip levels)
- All images: `alt` attribute required
- External links: `target="_blank" rel="noreferrer"`
- Attributes on new lines when element exceeds ~100 chars
- No inline styles — use CSS classes
- Follow existing patterns: nav, footer, back-link, project-meta, content-section

## CSS
- 4-space indentation
- **Always use `var()`** for colors, spacing, shadows, transitions, radii
- Never use raw hex colors, pixel values for spacing, or hardcoded font names
- Class naming: hyphen-separated, descriptive (`project-hero-title`, not `projectHeroTitle`)
- Section comments: `/* ===== SECTION NAME ===== */`
- Media queries: largest-to-smallest (desktop-first, matching existing pattern)
- No `!important` (none exist in the codebase — keep it that way)
- No new CSS files — add to `styles.css`, `project-page.css`, or `about.css`
- New component classes go in the file most relevant to their page type

## File Structure
- All HTML pages at root level (flat structure)
- New images in `images/[project-name]/` using hyphens, no spaces
- New assets in `assets/` using hyphens
- No new JavaScript files unless explicitly required

## General
- Preserve existing conventions — don't refactor broadly
- No premature abstractions — three similar lines is fine
- No build tools, preprocessors, or bundlers
- Test at all 5 breakpoints after any change: 1080, 880, 768, 600, 480px
- Commit messages: descriptive present-tense phrases, no conventional commit prefixes
