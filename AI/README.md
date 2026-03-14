# AI Working Layer — Portfolio

This folder contains structured docs, agents, rules, workflows, and templates for improving this portfolio using AI tools (Claude Code, Codex, ChatGPT, etc.).

## How to Use

### Before any task, provide these files to the AI:
1. `project_context.md` — who the portfolio is for and what it should achieve
2. `architecture.md` — how the site is structured
3. `design_system_notes.md` — exact design tokens and component patterns

### Then add the relevant context:
- Improving a page? Add the page's HTML + `content_strategy.md`
- Fixing a bug? Add `architecture.md` + the broken page's HTML
- Running an audit? Add `portfolio_audit.md` + `current_tasks.md`
- Adding a project? Add templates from `templates/`

## Directory Map

```
AI/
├── README.md                    ← You are here
├── project_context.md           ← Who, what, why
├── architecture.md              ← Tech stack and file structure
├── design_system_notes.md       ← Exact design tokens and patterns
├── current_tasks.md             ← Prioritized improvement list
├── portfolio_audit.md           ← Honest audit of all pages
├── content_strategy.md          ← Voice, tone, and copy rules
├── hiring_positioning.md        ← How to position for PO roles
├── decisions.md                 ← Design and architecture decisions
│
├── agents/                      ← Reusable agent instruction sets
│   ├── planner.md               ← Scope and plan improvements
│   ├── builder.md               ← Write HTML/CSS code
│   ├── reviewer.md              ← Review changes for quality
│   ├── debugger.md              ← Diagnose and fix issues
│   ├── product.md               ← Evaluate from product perspective
│   ├── ui_ux.md                 ← Evaluate visual design
│   ├── content_editor.md        ← Rewrite copy for clarity
│   └── portfolio_recruiter.md   ← Simulate hiring manager review
│
├── rules/                       ← Constraints and standards
│   ├── mvp_rules.md
│   ├── coding_rules.md
│   ├── project_decision_rules.md
│   ├── ux_rules.md
│   ├── content_rules.md
│   └── portfolio_rules.md
│
├── workflows/                   ← Step-by-step procedures
│   ├── start_feature.md
│   ├── build_feature.md
│   ├── review_feature.md
│   ├── fix_bug.md
│   ├── release_check.md
│   ├── improve_project_page.md
│   ├── improve_homepage.md
│   ├── improve_about_page.md
│   ├── add_new_project.md
│   └── full_portfolio_audit.md
│
└── templates/                   ← Fill-in-the-blank formats
    ├── feature_spec_template.md
    ├── bug_report_template.md
    ├── task_breakdown_template.md
    ├── screen_flow_template.md
    ├── project_case_study_template.md
    ├── project_card_template.md
    ├── page_review_template.md
    └── recruiter_feedback_template.md
```

## Typical Agent Sequence

**For improvements:**
`planner` → `builder` → `reviewer` → (optionally `content_editor` or `portfolio_recruiter`)

**For bug fixes:**
`debugger` → `builder` → `reviewer`

**For content work:**
`content_editor` → `portfolio_recruiter` → apply edits → `reviewer`

**For audits:**
`portfolio_recruiter` + `product` + `ui_ux` → update `portfolio_audit.md` → update `current_tasks.md`

## When to Use Specific Agents

| Task | Agent(s) |
|------|----------|
| "Improve the homepage" | `product` + `content_editor` → `builder` → `reviewer` |
| "Rewrite this project page" | `content_editor` → `builder` → `portfolio_recruiter` |
| "Audit mobile issues" | `ui_ux` + `debugger` |
| "Add a new project" | `planner` → `builder` → `content_editor` → `reviewer` |
| "Make this feel more premium" | `ui_ux` → `builder` → `reviewer` |
| "Fix broken layout" | `debugger` → `builder` → `reviewer` |

## Suggested First Improvements

Based on the initial portfolio audit, these are the 5 highest-impact next improvements:

### 1. Add SuperPlay/Dice Dreams to homepage project grid
**Why:** Your current role at a real studio is your strongest hiring signal, but it's invisible on the homepage. A recruiter scanning your project grid never sees it.
**Impact:** Immediate credibility boost. This is your most relevant professional experience.

### 2. Deduplicate homepage sections
**Why:** "How I Work on Game Features" and "How I Add Value" say essentially the same things. This makes the homepage feel padded and repetitive. Merge into one stronger section.
**Impact:** Sharper first impression, faster scan, more professional feel.

### 3. Flesh out ICE Analytics case study
**Why:** It's the thinnest page — no screenshots, no meta grid, brief paragraphs. Compared to Lucky Tower or Merge Lab, it looks rushed. Either strengthen it or consider removing it.
**Impact:** Eliminates the weakest link. Portfolio consistency matters.

### 4. Add meta description and OG tags to all pages
**Why:** When someone shares your portfolio link on LinkedIn/Slack, it shows no preview. This is a missed opportunity and looks unprofessional.
**Impact:** Better social sharing, improved SEO, polished impression.

### 5. Fix footer year inconsistency
**Why:** ice-analytics.html and house-party-vr.html say "© 2025" while all other pages say "© 2026". Small but signals inattention to detail.
**Impact:** Quick fix, eliminates a credibility crack.
