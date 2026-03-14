# Workflow: Build Feature

How to go from an approved plan to implementation.

## Steps

### 1. Set up context
Provide the AI with:
- `AI/agents/builder.md` — builder agent instructions
- `AI/design_system_notes.md` — design tokens
- `AI/rules/coding_rules.md` — coding standards
- The approved plan from the planner
- The current HTML/CSS file(s) to modify

### 2. Build the smallest working step first
- Don't try to do everything at once
- Get the core change working before adding details
- If modifying multiple files, do one at a time

### 3. Check design tokens
Before any CSS change:
- Are you using `var()` for all colors, spacing, shadows?
- Are you following the existing class naming convention?
- Are you adding to the correct CSS file?

### 4. Test responsive
After each change, test at:
- 1280px (desktop)
- 1080px (first breakpoint)
- 768px (tablet)
- 375px (mobile)

### 5. Check cross-page impact
- If you modified `styles.css`, check ALL pages
- If you modified `project-page.css`, check ALL case study pages
- If you modified nav or footer, check ALL pages

### 6. Proceed to review
Follow `AI/workflows/review_feature.md`.
