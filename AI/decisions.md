# Decisions Log

## D001 — Static HTML over a framework
**Decision:** Build the portfolio as pure static HTML + CSS with no framework.
**Rationale:** Content changes infrequently. No dynamic data. GitHub Pages serves static files directly with zero build step. A framework would add complexity without value for a portfolio of this size.
**Trade-off:** No component reuse (nav and footer are copy-pasted across 9 files). Acceptable at this scale.

## D002 — No CMS
**Decision:** Hand-write all content directly in HTML.
**Rationale:** Full editorial control over positioning and copy. Number of pages is manageable (~9). AI tools can edit HTML directly, making a CMS unnecessary overhead.

## D003 — CSS custom properties for design tokens
**Decision:** Use CSS `var()` for all colors, spacing, shadows, and transitions.
**Rationale:** Consistency without a preprocessor. Easy to reference in AI agent docs. Single source of truth in `:root`.

## D004 — Separate CSS files per page type
**Decision:** `styles.css` (global), `project-page.css` (case studies), `about.css` (about page).
**Rationale:** Keeps file sizes manageable. Only loads CSS relevant to each page type.

## D005 — SuperPlay case study sanitized
**Decision:** Intentionally vague about specific features, metrics, and unreleased content.
**Rationale:** Confidentiality obligations to current employer. Focus on process and delivery habits rather than specifics. This is the right call — honesty about constraints builds trust.

## D006 — AI/ folder for structured agent collaboration
**Decision:** Create an `AI/` directory with docs, agents, rules, workflows, and templates.
**Rationale:** Enable consistent, context-aware AI assistance for ongoing portfolio improvements. Reusable across Claude Code, Codex, ChatGPT, and other tools.

## D007 — Lucky Tower pattern as canonical case study structure
**Decision:** Use the Lucky Tower / SuperPlay page structure (meta grid, product goal, my role, problem, what I defined, engineering/QA, metrics, iteration, next steps) as the standard.
**Rationale:** This structure shows the deepest product thinking. The older pattern (ICE Analytics style) is flatter and less compelling.

## Intentionally Deferred

- **Dark mode:** Not worth the complexity for hiring effectiveness
- **JavaScript interactions:** Static is fine; the portfolio sells thinking, not code tricks
- **Blog/writing section:** Only add if there's published content worth linking
- **Testimonials:** Would be valuable but requires external effort (asking people for quotes)
- **Analytics:** No tracking code currently. Could add a lightweight tracker later to understand visitor behavior, but privacy implications need consideration.
