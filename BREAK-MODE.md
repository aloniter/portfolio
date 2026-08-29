# Break Mode

An opt-in destruction layer over the homepage. The portfolio is unchanged by
default; a visitor who wants to can pick up a hammer and take the site apart,
then put it back.

- Entry: one button, bottom-left, revealed after the hero scrolls past.
- Tools: Hammer, Bomb, Repair, Exit.
- Nothing persists. A reload is always the normal portfolio.

---

## Architecture

**The real DOM is never destroyed.** Every breakable surface is opted in
explicitly in the markup with `data-break`. All Break Mode ever does to one is:

1. overlay an SVG crack sheet on top of it,
2. nudge it with `translate` / `rotate` (composable properties, never
   `transform`, matching `main.js`),
3. set `visibility: hidden` once it shatters — which keeps its layout box, so
   the page never reflows.

Fragments are **real DOM clones of the element**, each cut to a polygon with
`clip-path`, moved by a small rigid-body integrator.

```
[data-break] element
      │  first hit
      ▼
fracture web generated once  ──────────┐
      │                                │
      ├─ hits 1..2 → SVG crack sheet   │  same geometry
      │                                │
      └─ hit 3 / bomb → fragment cells ┘
                 │
                 ▼
       clones + clip-path + integrator
                 │
                 ▼
        REPAIR: transform → none
                 │
                 ▼
      original element, untouched
```

Two properties fall out of this that are worth stating plainly:

**Repair is exact by construction.** A fragment clone is born sitting precisely
on top of the original at `transform: none`. Reassembly is not a reconstruction
problem — every fragment just transitions back to `none`. There is no state to
diff and nothing to get wrong, which is why no `Flip`-style library is needed.

**The cracks predict the break.** The fracture web is generated once, on the
first hit, and both the crack lines and the fragment polygons are cut from it.
The seams a visitor draws with the hammer are the exact lines the surface later
comes apart along.

### Fracture geometry

A radial web centred on the impact: 8 spokes at jittered angles (5 on touch),
crossing 4 jittered radii (3 on touch). Radii follow `maxR · (k/RINGS)^1.75`.

That exponent is the single most important number in the file. Above 1 it packs
the inner rings tight around the strike, so the **first hit cracks a fist-sized
patch instead of webbing a whole card**, and each further hit visibly spreads.
It also matches how material actually breaks: fine debris at the impact, larger
slabs out at the edge.

### Containment

Fragments live in a host inserted as a **sibling of the element they mirror**.
Keeping them in the same parent means descendant selectors (`.duo-item h3`,
`.pg-spec p`) and inherited typography still apply to the clones — that is most
of why fragments look identical to the original rather than approximately like
it.

The host is inflated past the element and clips at its own edge (`overflow:
clip`), and the integrator holds fragments inside it with side walls. The root
cannot be relied on to clip instead: `overflow-x: clip` with a visible y-axis
computes back to `auto` and simply grows the document. The horizontal pad is
clamped to the room the element actually has, which is what keeps a full-width
card on a phone from producing a horizontal scrollbar.

Measured before / during / after a full shatter at 390, 834 and 1440px wide:
**document width and height are identical in all three states.**

---

## Research: what was evaluated, and why it was rejected

The constraint that decided this: **the site is static, vanilla, and has no
build step** — no `package.json`, no bundler, two CSS files and one IIFE. Any
dependency would have to be vendored into the repo or pulled from a CDN.

| Option | Verdict |
|---|---|
| **DOM clones + `clip-path`** | **Chosen.** Pixel-perfect for free: real fonts, real images, real `backdrop-filter`. Zero bytes of dependency. Cost is one cloned subtree per fragment, which is bounded by caps. |
| **Custom integrator** (~60 lines) | **Chosen.** Gravity, restitution, angular velocity, sleep. That is the whole requirement. |
| **Three.js + Rapier** | Rejected. ~1.5MB to solve the *easy* half (integration) while leaving the hard half untouched: getting the page into a texture. Also fails the repo's "no frameworks or libraries" rule. |
| **Matter.js** (~90KB) | Rejected. A 2D rigid-body engine is a lot of machinery for ~30 free-falling convex shards with no constraints or joints. The integrator above is cheaper than the dependency and fully tunable. |
| **GSAP + Flip** | Rejected. Flip solves "record state → animate between states". Repair here is `transform: none`, so there is no state to record. |
| **`html2canvas` / DOM→canvas** | Rejected, and this is the important one. Every rasterisation route has to re-implement CSS. This page leans hard on `backdrop-filter`, web fonts and gradients — exactly the features these libraries get wrong. `foreignObject`→canvas is closer but needs every font and image inlined and is unreliable in Safari. Rasterising is strictly *worse* fidelity than the real DOM, at a cost. |
| **CSS/SVG crack overlay alone** | Rejected as the whole answer, kept as one layer of it. The brief was explicit that a shake plus a crack PNG is not sufficient, and it is right — nothing detaches. |

The short version: **the hard part of this problem is fidelity, not physics.**
Every library route solves physics and then loses fidelity. Using the real DOM
gives fidelity for free and leaves only the easy part to write.

---

## The three tools

### Hammer
Desktop gets a drawn tool that follows the pointer and swings on contact; touch
gets tap-to-smash and a haptic tick via `navigator.vibrate`. Each strike:
localized crack along the fracture web, a recoil that flinches away from the
impact and springs back to a small permanent offset, capped debris particles, a
short impact flash, and a screen shake scaled to the hit. Three hits shatter.

Hit-testing is by geometry, not `event.target` — the crack sheet sits above the
surface and a link inside a card would otherwise swallow the strike.

### Bomb
Placed rather than thrown. 900ms fuse with a lit spark, then a flash, an
expanding shockwave and one impulse pass over every on-screen surface within
the blast radius. Inside 28% falloff a surface shatters with the blast's power;
outside it takes a crack and a shove. Whole thing is under 1.5s.

### Repair
Physics stops; each fragment transitions back to `transform: none`, staggered
outward from the impact so a card knits itself together from the inside out.
Cracks fade, elements are restored, inline styles are removed. Verified: after
repair the element's `style` attribute is `null`, not `""` — the markup handed
back is the markup that was given.

---

## Performance

| | raw | gzip |
|---|---|---|
| `break-mode.js` (loader — the only initial cost) | 6.2 KB | **2.5 KB** |
| `break-mode-engine.js` (lazy) | 44.7 KB | 14.5 KB |
| `break-mode.css` (lazy) | 15.1 KB | 4.5 KB |
| **Lazy payload on activation** | | **19.0 KB** |

A visitor who never presses the button pays **2.5 KB gzipped and zero requests**
beyond it. The engine and its stylesheet are fetched in parallel on first
activation only, and cached for re-entry.

Runtime:
- One `rAF` loop for fragments, particles and shake. It **stops itself** when
  nothing is moving and is restarted on demand, so an idle Break Mode costs
  nothing.
- Grounded fragments park permanently once slow enough.
- Fragments only ever have `transform` written; `contain: layout paint style`
  and a per-fragment layer mean no layout or paint after creation.
- Caps: 32 fragments per surface (15 on touch), 4 shattered surfaces at once
  (3 on touch) with the oldest swept, 260 particles (90 on touch).
- Dust is one shared canvas with one draw call per frame, DPR-capped at 2.

Verified: **5 full enter → destroy → exit cycles produce a net DOM node delta of
0**, and no `rAF` survives exit.

---

## Mobile

Not a shrunken desktop build:

| | Desktop | Touch |
|---|---|---|
| Fragments per surface | 32 | 15 |
| Simultaneous shattered | 4 | 3 |
| Particles | 260 | 90 |
| Tool cursor | drawn, swings | none — tap to smash |
| Fragment drop-shadow | yes | off (`pointer: fine` only) |
| Haptics | — | `navigator.vibrate` |
| Toolbar | icons + labels | icons only for tools |

---

## Accessibility

- **`prefers-reduced-motion`**: Break Mode stays available, with the physics
  removed rather than the feature. Surfaces crack in place and grey out; nothing
  is thrown, no screen shake, no particle canvas is ever created. The live
  region says so on activation.
- Entry and all tools are real `<button>`s; the toolbar is `role="toolbar"` and
  tool selection is exposed with `aria-pressed`.
- **Focus is never trapped** — no focus management is imposed at all. Escape
  exits; `R` repairs. Focus returns to the entry button on exit.
- A `role="status"` live region narrates state changes.
- Fragment clones are `inert` + `aria-hidden` with their `id`s stripped, so
  cloned links are never focusable and no id is ever duplicated.
- Text stays readable until deliberately damaged. Navigation and the toolbar are
  never destructible.

---

## Safety

Break Mode cannot permanently affect the site:

- Nothing is persisted — no storage is touched, no URL is changed. **A reload is
  always the normal portfolio.**
- Navigation, links and the site toolbar are not in the destructible set.
- Every DOM mutation is recorded and reversed on exit, including the two
  containers temporarily given `position: relative`.
- Exiting mid-destruction restores everything; it does not require Repair first.
- Scrolling works during and after; `overflow-anchor: none` stops the page
  moving under a visitor mid-swing.

## Instrumentation

No analytics vendor is bundled with this site and Break Mode is not a reason to
add one. It dispatches plain DOM events on `document` instead:

```js
document.addEventListener('breakmode', e => e.detail.event);
// break_mode_entered | break_tool_used | break_mode_repaired
// break_mode_achievement | break_mode_exited
```

## Files

| File | |
|---|---|
| `break-mode.js` | Entry button + lazy loader. The only file the page loads. |
| `break-mode-engine.js` | ES module: fracture, fragments, physics, tools, UI. |
| `break-mode.css` | All Break Mode styling. Scoped under `.bm-on` or to its own elements. |
| `index.html` | `data-break` on 11 surfaces, one `<script>` tag. |

## Preview

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173/index.html>, scroll past the hero, and press
**Break mode** at the bottom-left.
