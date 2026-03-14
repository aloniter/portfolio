# Current Tasks

Last updated: 2026-03-14

---

## 1. Critical Now

### Add SuperPlay/Dice Dreams to homepage project grid
- **Files:** `index.html`
- **Why:** Current role at a real studio is invisible on the homepage. This is the single biggest hiring credibility gap.
- **Done when:** SuperPlay card appears in the project grid (ideally first or second position), links to `superplay-dice-dreams.html`, follows card pattern.
- **Notes:** Consider placing it first in the grid since it's the current role.

### Deduplicate "How I Work" and "How I Add Value" homepage sections
- **Files:** `index.html`, possibly `styles.css`
- **Why:** Both sections say essentially the same thing. Makes the homepage feel padded and repetitive.
- **Done when:** One strong section replaces two weaker ones. Homepage reads without redundancy.
- **Options:** Keep "How I Work on Game Features" (stronger, more specific) and remove "How I Add Value," or merge the best of both.

---

## 2. Next

### Flesh out ICE Analytics case study
- **Files:** `ice-analytics.html`, possibly new images in `assets/`
- **Why:** Thinnest case study — no screenshots, no meta grid, brief paragraphs. Hurts portfolio consistency.
- **Done when:** Page has meta grid (Role/Timeline/Platform/Focus), at least 2 screenshots or diagrams, expanded sections matching the Lucky Tower pattern, footer says 2026.
- **Alternative:** If there's not enough material to expand, consider removing from the main project grid and mentioning it briefly elsewhere.

### Add meta description and OG tags to all pages
- **Files:** All 9 HTML files
- **Why:** No social sharing preview when links are shared on LinkedIn/Slack. Missed opportunity.
- **Done when:** Each page has `<meta name="description">`, `og:title`, `og:description`, `og:image`, `og:url` in `<head>`.

### Fix footer year on ice-analytics.html and house-party-vr.html
- **Files:** `ice-analytics.html`, `house-party-vr.html`
- **Why:** Says "2025" while all other pages say "2026." Small but signals inattention.
- **Done when:** Both footers say "© 2026 Alon Iter. All rights reserved."

---

## 3. Later

### Add poster attribute to Lucky Tower video on homepage
- **Files:** `index.html`
- **Why:** When the video doesn't load, the Lucky Tower card appears blank.
- **Done when:** `<video>` element has a `poster` attribute pointing to a static screenshot.

### Reframe House Party VR project context
- **Files:** `house-party-vr.html`
- **Why:** Unclear if professional, academic, or personal project. Recruiter may be confused.
- **Done when:** Page clearly states the context (e.g., "Personal prototype built to explore MR interaction design").

### Upgrade Inspector Pro to newer case study pattern
- **Files:** `inspector-pro.html`
- **Why:** Uses older, simpler HTML structure compared to Lucky Tower/SuperPlay.
- **Done when:** Page follows the stronger structure: meta grid, structured content sections, clear CTA.

### Replace "More Projects" card with something useful
- **Files:** `index.html`
- **Why:** Just linking to GitHub feels incomplete. Either curate 2-3 specific GitHub repos or remove the card.
- **Done when:** Card either showcases specific repos or is replaced with a more useful element.

### Trim about page length
- **Files:** `about.html`
- **Why:** 9 sections is a lot. Overlap with homepage makes it feel repetitive.
- **Done when:** Page is shorter, unique from homepage, faster to scan. Target: reduce by ~30%.

### Add social proof or team context
- **Files:** Various
- **Why:** No testimonials, no "team of X" context, no company logos. Harder to gauge impact scale.
- **Done when:** At least one form of social proof is present (team context at SuperPlay, company mention, etc.).

---

## Backlog (ideas, not committed)
- Add a lightweight 404 page
- Add sitemap.xml for SEO
- Consider renaming image folders to remove spaces
- Add video captions for accessibility
- Consider a dark mode toggle
- Explore adding a "process" or "how I think" standalone page
