# Workflow: Fix Bug

How to report and fix bugs consistently.

## Steps

### 1. Document the bug
Use `AI/templates/bug_report_template.md`:
- What's broken?
- What should happen?
- What actually happens?
- How to reproduce?

### 2. Diagnose with debugger agent
Provide `AI/agents/debugger.md` instructions along with:
- The bug report
- The affected page HTML
- `AI/architecture.md`
- `AI/design_system_notes.md`

### 3. Get the root cause
The debugger should identify:
- Root cause (not just symptoms)
- Which file(s) to modify
- Minimal fix
- Regression risks

### 4. Apply minimal fix
- Change only what's necessary
- Don't refactor surrounding code
- Don't add new features while fixing

### 5. Test the fix
- Verify the bug is fixed
- Test at all 5 responsive breakpoints
- Check for regressions on related pages
- If using Playwright: take before/after screenshots

### 6. Ship
Follow `AI/workflows/release_check.md` before pushing.
