# Portfolio Audit

Audited: 2026-03-14
Site: https://aloniter.github.io/portfolio/

---

## Page-by-Page Audit

### Homepage (index.html)

**First impression:** Clean, professional, clear role positioning. The hero immediately communicates "Technical Operations Manager in mobile gaming." Good.

**Issues:**
- **P0 — SuperPlay missing from project grid.** Your current role at a real studio is your strongest hiring signal, but it does not appear in the homepage project grid. A recruiter scrolling through projects never sees it. It's only accessible via the about page or direct URL.
- **P0 — Content duplication.** "How I Work on Game Features" (4 steps: shape, design, coordinate, review) and "How I Add Value" (4 cards: requirement clarity, release readiness, cross-team communication, iteration discipline) say essentially the same things in different words. This makes the homepage feel padded.
- **P2 — Lucky Tower card has no thumbnail.** Uses a `<video>` element with no poster attribute. When the video doesn't load or is slow, the card appears blank while other cards have images.
- **P2 — Visual inconsistency in cards.** Some cards have static images (Merge Lab, Draft21, Inspector Pro, ICE Analytics), some have videos (Beat Runner), Lucky Tower has neither image nor poster. This creates uneven visual weight.
- **P2 — "More Projects" card.** Just links to GitHub with no preview content. Feels like an afterthought. Either curate what's there or remove it.
- **P3 — Grid layout on odd card count.** 8 cards (7 projects + More Projects) with `auto-fit minmax(310px, 1fr)` can create uneven last rows depending on viewport.

**What works well:**
- Hero copy is specific and non-generic
- Project card descriptions are action-oriented and concrete
- Tags on cards help with scanning
- Contact section clearly states target roles
- CTAs are clear (View Case Study → / Play Live Demo)

---

### About Page (about.html)

**First impression:** Thorough professional story. The sticky photo adds personality. Honest positioning builds trust.

**Issues:**
- **P1 — Too long.** 9 content sections create a wall of text. Recruiters typically spend 30-60 seconds on an about page. Sections like "Technical Stack" and "Selected Projects" could be trimmed or merged.
- **P1 — Content overlap with homepage.** "Where I Add Value" on the about page (Feature Definition & Handoff, LiveOps & Release Execution, Data & Iteration, Rapid Validation) repeats nearly the same content as "How I Add Value" on the homepage. This feels redundant for anyone who navigates between pages.
- **P3 — Education section is minimal.** Just degree + languages. Not necessarily bad, but could be removed if space is needed.

**What works well:**
- "Why Product Owner Roles Fit Me" is the strongest section — honest, specific, differentiating
- "How I Work" gives a clear 5-step process
- Professional Experience section is well-structured with concrete bullets
- Photo makes it personal and human

---

### Lucky Tower (lucky-tower.html)

**Strongest case study.** Clear product thinking with KPI plan, defined metrics, iteration story.

**Issues:**
- **P3 — Gallery images have large empty space.** The 4 screenshots in the gallery are small relative to their containers, creating visible padding.
- **P3 — "How I Worked with Engineering / QA" section feels thin** because this was solo work. The framing as "if it were preparing for implementation" is honest but could be stronger.

**What works well:**
- Product Goal → My Role → Problem → What I Defined → Metrics flow is excellent
- Concrete KPIs (D3-D7 retention, participation rate, coin spend)
- Iteration section shows real learning
- Live prototype CTA is compelling

---

### Merge Lab (merge-lab.html)

**Strong case study.** The framing of balancing as a workflow problem is smart and differentiated.

**Issues:**
- **P3 — Could use a "Metrics" section** like Lucky Tower to show concrete success criteria.

**What works well:**
- "84.9% win rate" — specific data point that proves the tool works
- Level editor + insights view shows systems thinking
- Live demo link adds credibility

---

### Beat Runner (beat-runner.html)

**Solid but less differentiated.** Good prototype work but doesn't stand out as strongly as Lucky Tower or Merge Lab.

**Issues:**
- **P3 — Less hiring-relevant** than the product-thinking case studies. A rhythm runner prototype is fun but doesn't directly demonstrate PO skills as clearly.

**What works well:**
- Difficulty tuning story shows iteration thinking
- Live demo is playable
- Copy is concrete about the design problem

---

### Draft21 (draft21.html)

**Strong case study.** A shipped product with real users. The problem statement is relatable and human.

**Issues:**
- **P3 — Hebrew UI note may confuse some recruiters.** The transparency is good but could be framed slightly better (e.g., "Built for my local football group" rather than drawing attention to language).

**What works well:**
- Real users, real problem, shipped product
- Core workflow cards are scannable
- Technical stack is clearly listed
- Live app link proves it works

---

### Inspector Pro (inspector-pro.html)

**Good real-world case study.** "Used in production by a family-run inspection company" is strong proof.

**Issues:**
- **P2 — Uses older HTML pattern** (simpler structure, fewer sections than Lucky Tower). Could be upgraded to the newer pattern.
- **P3 — No live demo** (appropriate for iOS, but could include app screenshots or a video walkthrough).

**What works well:**
- Real company usage = credibility
- MVP thinking is clearly articulated
- "The real pain isn't taking photos — it's organizing them into a report" shows product insight

---

### ICE Analytics (ice-analytics.html)

**Weakest case study.** Notably thin compared to all others.

**Issues:**
- **P1 — Missing meta grid** (no Role/Timeline/Platform/Focus block that all other case studies have)
- **P1 — No screenshots or images.** Every other case study has visuals. This one is text-only.
- **P1 — Brief paragraphs.** Content is surface-level — doesn't show the depth of thinking visible in other case studies.
- **P1 — Footer year says 2025** (should be 2026)
- **P2 — Uses older HTML pattern** with fewer structured sections

**What works well:**
- The problem statement (fragmented KPIs, reliance on manual reports) is relevant
- Internal tool work is valid portfolio content

**Recommendation:** Either significantly expand this case study with screenshots, a meta grid, and more detailed sections — or deprioritize/remove it from the main grid.

---

### House Party VR (house-party-vr.html)

**Interesting but unclear positioning.** Good technical work, but context is ambiguous.

**Issues:**
- **P2 — Professional vs personal?** The page doesn't clearly state if this was work, freelance, a school project, or personal exploration. "Solo designer + Unity prototyper" is vague about the setting.
- **P1 — Footer year says 2025** (should be 2026)
- **P3 — CTA mentions "player psychology"** which sounds academic for a portfolio targeting game studios

**What works well:**
- VR/MR prototyping shows technical range
- Audio-reactive visuals detail shows craft
- Iteration story is specific ("I tuned lighting decay to snap strictly to beat transients")

---

### SuperPlay / Dice Dreams (superplay-dice-dreams.html)

**Well-handled sanitized case study.** Explicit confidentiality note is appropriate and professional.

**Issues:**
- **P0 — Not in homepage project grid.** This is the most critical issue across the entire portfolio. Your current role at a real studio should be the first thing a recruiter sees.
- **P3 — No visuals.** Understandable given confidentiality, but even a generic workflow diagram or process illustration would help.

**What works well:**
- Sanitization is handled transparently and professionally
- Execution Snapshot cards give a clear process overview
- "My Role" bullets are concrete and action-oriented
- The emphasis on systems and reliability (not just feature lists) is smart positioning

---

## Cross-Site Issues

| Issue | Severity | Details |
|-------|----------|---------|
| No `<meta description>` on any page | P1 | Bad for SEO and social sharing previews |
| No Open Graph tags | P1 | LinkedIn/Slack shares show no preview |
| Footer year inconsistency | P1 | 2025 on ice-analytics + house-party-vr, 2026 on all others |
| No favicon | P3 | Uses `data:,` empty favicon hack |
| No 404 page | P3 | Broken URLs show default GitHub Pages 404 |
| No sitemap.xml or robots.txt | P3 | Minor SEO gap |
| Folder names with spaces | P3 | `images/Merge lab/`, `images/beats runner/` — works but unusual |

---

## Summary

**Portfolio grade: B+**
Strong product thinking, honest positioning, real projects with live demos. Undercut by: SuperPlay being invisible on homepage, content duplication, and one notably weak case study (ICE Analytics).

**Top 3 actions for maximum hiring impact:**
1. Add SuperPlay/Dice Dreams to homepage project grid
2. Merge/deduplicate the two overlapping homepage sections
3. Fix or remove ICE Analytics as a case study
