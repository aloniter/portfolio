# Workflow: Improve About Page

How to make the about page stronger, sharper, and more hiring-relevant.

## Steps

### 1. Audit current state
Read `about.html`. Check `AI/portfolio_audit.md` for known issues:
- Is it too long? (Currently 9 sections — aim for 6-7)
- Does "Where I Add Value" duplicate homepage content?
- Is the professional story clear and scannable?

### 2. Identify overlap with homepage
Compare about.html sections with index.html sections:
- "Where I Add Value" (about) vs "How I Add Value" (homepage) — these overlap heavily
- Remove or rewrite the duplicate section on the about page

### 3. Content priority check
The about page's unique value is the professional narrative. These sections are strongest:
- "Why Product Owner Roles Fit Me" — keep and protect
- "How I Work" — unique 5-step process
- Professional Experience — concrete role details
- "What I'm Looking For" — clear closing statement

These sections may be cuttable:
- "Where I Add Value" — duplicates homepage
- "Technical Stack" — recruiters skim this; could be shortened
- "Education and Languages" — could be one line, not a section
- "Selected Projects" — redundant with homepage grid

### 4. Run content editor
Provide `AI/agents/content_editor.md` with the page. Focus on:
- Tightening each section to essential content
- Ensuring unique value vs homepage
- Voice consistency

### 5. Recruiter check
Provide `AI/agents/portfolio_recruiter.md`. Ask:
- After reading the about page, am I more or less confident?
- What's the strongest section?
- What should be cut?

### 6. Build, review, ship
Follow: `build_feature.md` → `review_feature.md` → `release_check.md`
