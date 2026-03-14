# Project Case Study Template

Based on the Lucky Tower pattern (strongest structure in the portfolio).

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{PROJECT_NAME} - Alon Iter</title>
    <link rel="icon" href="data:,">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700&family=Sora:wght@500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="project-page.css">
</head>
<body>

    <nav class="nav">
        <div class="nav-container">
            <a href="index.html" class="nav-logo">Alon Iter</a>
            <div class="nav-links">
                <a href="index.html">Projects</a>
                <a href="about.html">About</a>
                <a href="index.html#contact">Contact</a>
            </div>
        </div>
    </nav>

    <section class="project-hero">
        <a href="index.html" class="back-link">← Back to Projects</a>
        <h1 class="project-hero-title">{PROJECT_NAME}</h1>
        <p class="project-hero-subtitle">{ONE_LINE_SUBTITLE}</p>

        <div class="project-meta">
            <div class="meta-item">
                <span class="meta-label">Role</span>
                <span class="meta-value">{ROLE}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Timeline</span>
                <span class="meta-value">{TIMELINE}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Platform</span>
                <span class="meta-value">{PLATFORM}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Focus</span>
                <span class="meta-value">{FOCUS}</span>
            </div>
        </div>

        <!-- Optional: Live demo CTA -->
        <a href="{DEMO_URL}" class="btn btn-primary" target="_blank" rel="noreferrer">
            {DEMO_CTA_TEXT}
        </a>
    </section>

    <section class="project-content">

        <div class="content-section">
            <h2 class="content-title">Screens</h2>
            <div class="screens-gallery">
                <img src="images/{project-name}/{image1}.png"
                     alt="{ALT_TEXT}" class="gallery-image">
                <img src="images/{project-name}/{image2}.png"
                     alt="{ALT_TEXT}" class="gallery-image">
            </div>
        </div>

        <div class="content-section">
            <h2 class="content-title">Product Goal</h2>
            <p class="content-text">{PRODUCT_GOAL_PARAGRAPH}</p>
        </div>

        <div class="content-section">
            <h2 class="content-title">My Role</h2>
            <ul class="content-list">
                <li>→ {ROLE_BULLET_1}</li>
                <li>→ {ROLE_BULLET_2}</li>
                <li>→ {ROLE_BULLET_3}</li>
            </ul>
        </div>

        <div class="content-section">
            <h2 class="content-title">Problem / Opportunity</h2>
            <p class="content-text">{PROBLEM_PARAGRAPH}</p>
        </div>

        <div class="content-section">
            <h2 class="content-title">What I Defined</h2>
            <ul class="content-list">
                <li>→ {DEFINED_1}</li>
                <li>→ {DEFINED_2}</li>
                <li>→ {DEFINED_3}</li>
                <li>→ {DEFINED_4}</li>
                <li>→ {DEFINED_5}</li>
            </ul>
        </div>

        <div class="content-section">
            <h2 class="content-title">How I Worked with Engineering / QA</h2>
            <p class="content-text">{ENGINEERING_QA_PARAGRAPH}</p>
        </div>

        <div class="content-section">
            <h2 class="content-title">Metrics or Success Criteria</h2>
            <ul class="content-list">
                <li>→ {METRIC_1}</li>
                <li>→ {METRIC_2}</li>
                <li>→ {METRIC_3}</li>
                <li>→ {METRIC_4}</li>
            </ul>
        </div>

        <div class="content-section">
            <h2 class="content-title">Iteration / What Changed</h2>
            <p class="content-text">{ITERATION_PARAGRAPH}</p>
        </div>

        <div class="content-section">
            <h2 class="content-title">Next Iterations</h2>
            <ul class="content-list">
                <li>→ {NEXT_1}</li>
                <li>→ {NEXT_2}</li>
                <li>→ {NEXT_3}</li>
            </ul>
        </div>

        <div class="content-cta">
            <h2 class="content-title">{CTA_HEADING}</h2>
            <p class="content-text">{CTA_DESCRIPTION}</p>
            <a href="{CTA_URL}" class="btn btn-primary" target="_blank" rel="noreferrer">
                {CTA_BUTTON_TEXT}
            </a>
        </div>

    </section>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2026 Alon Iter. All rights reserved.</p>
        </div>
    </footer>

</body>
</html>
```

## Notes
- Copy this template and replace all `{PLACEHOLDER}` values
- Use `lucky-tower.html` as the structural reference (strongest pattern)
- Sections can be added or removed based on project complexity
- Gallery can use `screens-gallery`, `screens-gallery-tight`, or `screens-gallery-enhanced`
- If no live demo, remove the hero CTA and the bottom CTA section
- All images go in `images/{project-name}/` using hyphens, no spaces
