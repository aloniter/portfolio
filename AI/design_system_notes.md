# Design System Notes

## Color Tokens
```css
--color-bg: #f5f8fb              /* Light blue background */
--color-bg-secondary: #eaf0f5    /* Slightly darker background */
--color-bg-card: #ffffff          /* White cards */
--color-text: #16233a             /* Dark navy body text */
--color-text-secondary: #4f6280  /* Muted blue-grey */
--color-primary: #0d786a          /* Teal — primary CTA */
--color-primary-strong: #0a5d53   /* Darker teal hover */
--color-secondary: #235fa4        /* Blue accent */
--color-accent: #c56c28           /* Orange (used sparingly) */
--color-border: #d3deea           /* Light border */
--color-primary-glow: rgba(13, 120, 106, 0.22)  /* Button glow */
--gradient-primary: linear-gradient(135deg, #0d786a 0%, #235fa4 100%)
--gradient-accent: linear-gradient(135deg, #ecf8f6 0%, #edf4fb 100%)
```

## Typography Tokens
```css
--font-heading: 'Sora', 'Avenir Next', 'Segoe UI', sans-serif
--font-body: 'Public Sans', 'Avenir Next', 'Segoe UI', sans-serif
--font-size-base: 16px
--line-height-base: 1.62
```
- Heading weights: 500, 600, 700, 800
- Body weights: 300, 400, 500, 600, 700
- Hero title: `clamp(3.1rem, 7vw, 5rem)`, letter-spacing: `-0.035em`
- Section titles: `clamp(1.85rem, 3.8vw, 2.6rem)`, letter-spacing: `-0.02em`
- All-caps labels: `0.75rem`, letter-spacing: `0.04em`–`0.08em`

## Spacing Scale
```css
--spacing-xs: 0.5rem     /* 8px */
--spacing-sm: 1rem       /* 16px */
--spacing-md: 1.5rem     /* 24px */
--spacing-lg: 2rem       /* 32px */
--spacing-xl: 3rem       /* 48px */
--spacing-2xl: 4.5rem    /* 72px */
```

## Border Radius
```css
--radius-sm: 0.4rem      /* Small buttons */
--radius-md: 0.7rem      /* Medium cards, buttons */
--radius-lg: 1rem        /* Project cards */
--radius-xl: 1.25rem     /* Hero content */
```

## Shadows
```css
--shadow-sm: 0 4px 12px rgba(17, 36, 64, 0.07)    /* Default card */
--shadow-md: 0 12px 30px rgba(17, 36, 64, 0.12)    /* Hover state */
```

## Transitions
```css
--transition-fast: 140ms ease    /* Micro interactions */
--transition-base: 220ms ease   /* Standard interactions */
--transition-slow: 320ms ease   /* Elaborate animations */
```

## Component Patterns

### Buttons
- `.btn` — base: 44px min-height, consistent padding, `--radius-md`
- `.btn-primary` — gradient background, glow shadow, hover lifts 2px
- `.btn-secondary` — white background, border, text color change on hover
- Hero CTAs: 54px min-height, wider padding

### Cards
- `.project-card` — `1px solid var(--color-border)`, `--radius-lg`, `--shadow-sm`
- Hover: lift 4px, border shifts to semi-transparent teal, `--shadow-md`
- `.project-badge` — absolute top-right pill, teal text, white background
- `.tag` — pill shape, light blue background (`#eef3f8`), blue border

### Sections
- All major sections: `padding: var(--spacing-2xl) 0` (72px vertical)
- Container: `width: min(1160px, 100% - 2.5rem)`
- Section titles: centered, section intros max-width `72ch`

### Galleries
- `.screens-gallery` — 2-column grid
- `.screens-gallery-tight` — tighter variant
- Image hover: `transform: scale(1.02)`, `0.2s ease`
- Aspect ratios: `4/3` landscape, `3/4` tall media

## Animations
- `@keyframes heroFadeUp` — fade in + slide up from 10px (0.58s ease-out)
- `@keyframes fadeIn` — fade in + slide up from 14px (for project cards)
- Staggered delays: 0.08s increments on cards
- `@media (prefers-reduced-motion: reduce)` disables all animations

## Rules for New Work
1. Always use `var()` for colors, spacing, shadows — never raw values
2. Follow existing class naming: hyphen-separated, descriptive (`project-hero-title`, not `projectHeroTitle`)
3. No inline styles
4. Test at all 5 breakpoints after any CSS change
5. Keep accessibility: `focus-visible` outlines, alt text, semantic HTML, 44px min touch targets
