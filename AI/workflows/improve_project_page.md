# Workflow: Improve Project Page

How to improve any existing project case study page.

## Steps

### 1. Audit the current page
Read the page HTML. Check against `AI/portfolio_audit.md` for known issues. Note:
- Does it follow the Lucky Tower structure (strongest pattern)?
- Does it have a meta grid (Role/Timeline/Platform/Focus)?
- Does it have screenshots or visual evidence?
- Does it have a Metrics/Success Criteria section?
- Is the copy specific and non-generic?
- Does the footer say 2026?

### 2. Run content editor
Provide `AI/agents/content_editor.md` instructions with the page HTML. Get:
- Rewritten headlines and descriptions
- Expanded or tightened sections
- Voice consistency check

### 3. Improve hierarchy
Provide `AI/agents/ui_ux.md` instructions. Check:
- Is the visual hierarchy clear?
- Does the page flow logically?
- Are sections properly spaced?
- Is the gallery effective?

### 4. Improve visuals
- Add screenshots if missing
- Ensure gallery images fill their containers
- Add poster attribute to videos if needed
- Check that images are reasonable file sizes

### 5. Mobile check
Test the page at 375px (mobile). Verify:
- Text is readable
- Images scale properly
- Buttons are tappable (44px minimum)
- No horizontal scroll
- Gallery works on small screens

### 6. Recruiter check
Provide `AI/agents/portfolio_recruiter.md` instructions. Ask:
- Does this case study answer the hiring manager's key questions?
- Is the product thinking visible?
- Would this strengthen or weaken the portfolio overall?

### 7. Review and ship
Follow `AI/workflows/review_feature.md` then `AI/workflows/release_check.md`.
