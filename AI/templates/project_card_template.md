# Project Card Template

For adding a project to the homepage grid in `index.html`.

## Card with Image
```html
<div class="project-card">
    <div class="project-card-image">
        <img src="assets/{project-name}-cover.png"
             alt="{PROJECT_NAME} {brief description}"
             loading="lazy">
        <span class="project-badge">{BADGE_TEXT}</span>
    </div>
    <div class="project-card-content">
        <h3 class="project-card-title">{PROJECT_NAME}</h3>
        <p class="project-card-meta">{TYPE} • {CONTEXT}</p>
        <p class="project-card-description">
            {1-2 sentence description. Start with action verb. Include concrete detail.}
        </p>
        <div class="project-card-tags">
            <span class="tag">{Tag 1}</span>
            <span class="tag">{Tag 2}</span>
            <span class="tag">{Tag 3}</span>
        </div>
        <div class="project-card-links">
            <a href="{project-name}.html" class="project-link">View Case Study →</a>
            <a href="{DEMO_URL}" class="project-link secondary" target="_blank" rel="noreferrer">{DEMO_CTA}</a>
        </div>
    </div>
</div>
```

## Card with Video
```html
<div class="project-card">
    <div class="project-card-image">
        <video autoplay muted loop playsinline
               poster="images/{project-name}/poster.png">
            <source src="images/{project-name}/demo.mp4" type="video/mp4">
        </video>
        <span class="project-badge">{BADGE_TEXT}</span>
    </div>
    <!-- Same content section as above -->
</div>
```

## Badge Naming Conventions
Use concise, descriptive badges that match existing ones:
- `LiveOps Feature` — for game event/feature concepts
- `Balancing Tooling` — for editor/tool projects
- `Gameplay Prototype` — for playable game prototypes
- `Draft System` — for specific system types
- `Shipped MVP` — for real products in use
- `KPI Dashboard` — for analytics/data tools
- `Unity Prototype` — for Unity-based prototypes
- `Current Role` — for SuperPlay/active work

## Tag Guidelines
- Maximum 3 tags per card
- Tags should describe WHAT the project demonstrates, not the tech used
- Keep tags to 1-2 words each
- Examples: `Feature Concept`, `Reward Logic`, `KPI Planning`, `Level Editor`, `Fairness Logic`

## Positioning in Grid
- Most hiring-relevant projects first
- Current role (SuperPlay) should be near the top
- Order by: current role → product thinking showcases → shipped products → prototypes
