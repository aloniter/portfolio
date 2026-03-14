# Workflow: Add New Project

How to properly add a new project to the portfolio.

## Steps

### 1. Plan the project
Use `AI/templates/feature_spec_template.md` to define:
- What is this project?
- Why does it belong in the portfolio?
- What hiring value does it add?
- What role positioning does it support?

If the project doesn't strengthen hiring positioning, consider not adding it.

### 2. Prepare assets
- Create `images/[project-name]/` folder (use hyphens, no spaces)
- Collect 3-5 screenshots or create a short video
- Create a cover image or thumbnail for the homepage card
- Ensure reasonable file sizes (compress images if large)

### 3. Create the case study page
Use `AI/templates/project_case_study_template.md` as the base. Copy `lucky-tower.html` as a structural reference. Must include:
- Hero with title, subtitle, and meta grid
- Screens/gallery with visual evidence
- Product Goal, My Role, Problem/Opportunity
- What I Defined, Engineering/QA collaboration
- Metrics or Success Criteria
- Iteration / What Changed
- CTA (live demo link or back to portfolio)
- Correct footer (© 2026)

### 4. Create the homepage card
Use `AI/templates/project_card_template.md`. Add to the project grid in `index.html`:
- Position based on hiring relevance (more relevant = earlier in grid)
- Include: image/video, badge, title, type, description, tags, CTA links
- Ensure visual consistency with existing cards

### 5. Write copy
Run `AI/agents/content_editor.md` on the new page:
- Card description: 1-2 sentences, action-verb start, concrete detail
- Case study sections: follow `AI/content_strategy.md` voice rules
- Avoid generic language

### 6. Update about page
If the project is a highlight, add it to the "Selected Projects" list in `about.html`.

### 7. Consistency check
- Navigation works to/from the new page
- Back link goes to index.html
- Footer matches other pages
- CSS classes match existing patterns
- Responsive at all breakpoints

### 8. Recruiter review
Run `AI/agents/portfolio_recruiter.md` on:
- The new case study page
- The updated homepage grid
Ask: Does this addition make the portfolio stronger?

### 9. Ship
Follow `AI/workflows/release_check.md`.
