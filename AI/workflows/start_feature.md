# Workflow: Start Feature

How to begin any new improvement to this portfolio.

## Steps

### 1. Check current priorities
Read `AI/current_tasks.md`. Is this aligned with the top priority? If not, add it to backlog and do the top priority instead.

### 2. Understand current state
- Read the page(s) you're about to change
- Read `AI/architecture.md` for file structure
- Read `AI/design_system_notes.md` for available tokens and patterns
- Check `AI/portfolio_audit.md` for known issues on that page

### 3. Define the improvement
Use `AI/templates/feature_spec_template.md` to write:
- What's the problem?
- What's the hiring impact?
- What's the scope (which files)?
- What's out of scope?

### 4. Plan with the planner agent
Provide `AI/agents/planner.md` instructions to the AI along with:
- The feature spec
- The current page HTML
- `AI/architecture.md` and `AI/design_system_notes.md`

Get back: ordered build steps, files to modify, estimated effort.

### 5. Validate the plan
- Does this solve the actual problem?
- Is this the smallest change that works?
- Will this break anything on other pages?
- Does this improve hiring effectiveness?

### 6. Proceed to build
Follow `AI/workflows/build_feature.md`.
