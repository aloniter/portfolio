# Workflow: Improve Homepage

How to improve homepage clarity, first impression, and role positioning.

## Steps

### 1. Audit current state
Read `index.html`. Check `AI/portfolio_audit.md` for known homepage issues:
- Is SuperPlay in the project grid?
- Is there content duplication between sections?
- Are all project cards visually consistent?
- Does the hero communicate role clearly in 3 seconds?

### 2. First impression test
Run `AI/agents/product.md` on the homepage. Answer:
- What does a recruiter understand in 3 seconds?
- What's visible above the fold on desktop? On mobile?
- Is the strongest evidence (current role) visible?

### 3. Content review
Run `AI/agents/content_editor.md` on the homepage. Check:
- Hero copy: specific and clear?
- Section headings: scannable outline?
- Card descriptions: concrete, action-verb start?
- Contact section: target roles clear?

### 4. Deduplication check
Compare "How I Work on Game Features" and "How I Add Value" sections:
- What's unique to each?
- What overlaps?
- Can they be merged into one stronger section?

### 5. Project grid review
- Are projects ordered by hiring relevance?
- Does every card have a visual (image, video with poster, or thumbnail)?
- Is the "More Projects" card useful or should it be replaced?

### 6. Recruiter check
Run `AI/agents/portfolio_recruiter.md`. Get a 10-second impression assessment.

### 7. Build, review, ship
Follow: `build_feature.md` → `review_feature.md` → `release_check.md`
