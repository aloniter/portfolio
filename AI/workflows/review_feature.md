# Workflow: Review Feature

How to review a built improvement before shipping.

## Steps

### 1. Run the reviewer agent
Provide `AI/agents/reviewer.md` instructions along with:
- The changed files (before and after, or diff)
- `AI/design_system_notes.md`
- `AI/content_strategy.md`

### 2. Reviewer checklist
```
[ ] Design tokens: All values use var()
[ ] Responsive: Works at 1080, 880, 768, 600, 480px
[ ] Accessibility: Alt text, focus-visible, semantic headings, 44px touch targets
[ ] Content voice: No buzzwords, no passive voice, concrete and specific
[ ] Cross-page: Footer year, nav links, font imports consistent
[ ] Visual: Cards consistent, sections aligned, no broken media
[ ] HTML: Valid structure, no inline styles, proper heading hierarchy
[ ] Links: Internal links work, external links open in new tab
```

### 3. Content review (if copy changed)
Provide `AI/agents/content_editor.md` instructions. Check:
- Does the new copy match the portfolio's voice?
- Is it specific and non-generic?
- Does it avoid banned buzzwords?

### 4. Recruiter check (if visible to visitors)
Provide `AI/agents/portfolio_recruiter.md` instructions. Ask:
- Does this change make the portfolio more or less effective?
- Would a recruiter notice this improvement?
- Does anything now look worse than before?

### 5. Fix issues
Address any "Block" or "Should fix" items from the review.

### 6. Ship
Follow `AI/workflows/release_check.md` before pushing.
