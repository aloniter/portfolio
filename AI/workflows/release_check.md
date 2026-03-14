# Workflow: Release Check

Pre-push checklist before shipping any change.

## Checklist

### Content
- [ ] All text is accurate and free of typos
- [ ] No placeholder or lorem ipsum text
- [ ] Footer says "© 2026 Alon Iter. All rights reserved." on all pages
- [ ] No broken or dead links (internal and external)
- [ ] External links open in new tab (`target="_blank" rel="noreferrer"`)

### Design
- [ ] All design tokens used via `var()` — no raw values
- [ ] No inline styles
- [ ] Responsive at: 1080, 880, 768, 600, 480px
- [ ] No horizontal scroll at any viewport
- [ ] Cards have consistent visual weight in the grid

### Accessibility
- [ ] All images have `alt` attributes
- [ ] Focus-visible styles work on interactive elements
- [ ] Heading hierarchy is correct (h1 → h2 → h3)
- [ ] Touch targets are at least 44px

### Technical
- [ ] No console errors in browser
- [ ] All media files load (images, videos)
- [ ] Video elements have `autoplay muted loop playsinline` if auto-playing
- [ ] Asset paths are correct (watch for spaces in folder names)
- [ ] PDF download link works

### Cross-Page
- [ ] Navigation links work from every page
- [ ] "Back to Projects" link works on all case study pages
- [ ] Any CSS changes tested on ALL pages that use that stylesheet

### Final
- [ ] Changes committed with descriptive message
- [ ] Push to `main` branch
- [ ] Verify live site at https://aloniter.github.io/portfolio/ after deploy
