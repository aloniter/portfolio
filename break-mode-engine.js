/* ===== BREAK MODE: ENGINE =====

   Architecture
   ------------
   The real page is never destroyed. Every breakable surface is marked in the
   markup with `data-break`, and all this module ever does to one is:

     - overlay an SVG crack sheet on top of it
     - nudge it with `translate` / `rotate` (composable, never `transform`)
     - set `visibility:hidden` once it shatters, which keeps its layout box

   Fragments are real DOM clones of the element, each cut to a polygon with
   `clip-path` and moved by a small rigid-body integrator. Because a clone
   starts life sitting exactly on top of the original at `transform:none`,
   REPAIR is not a reconstruction problem at all: every fragment simply
   transitions back to `none`, which is pixel-exact by construction.

   Fracture geometry is generated once per element on the first hit, and both
   the cracks and the fragments are cut from it. So the cracks a visitor draws
   with the hammer are the exact seams the element later breaks along.

   Why not a library: this is a static, dependency-free site with no build
   step. Three.js plus Rapier would add ~1.5MB to solve the easy half of the
   problem (integration) while leaving the hard half (getting the page into a
   texture with backdrop-filter, web fonts and cross-origin images intact)
   unsolved. Real DOM clones are pixel-perfect for free, and the integrator
   this needs - gravity, restitution, angular velocity - is about sixty lines.
   See BREAK-MODE.md for the full evaluation. */

/* ===== TUNING ===== */
var GRAVITY = 2700;      /* px/s^2 */
var RESTITUTION = 0.32;  /* bounce off the settle line */
var FLOOR_FRICTION = 0.68;
var AIR = 0.9975;
var SLEEP_V = 42;        /* px/s below which a grounded fragment parks */
var HITS_TO_SHATTER = 3;
var ACHIEVEMENT_AT = 4;  /* shattered surfaces before the payoff fires */

/* How far past its own box a fragment may travel. The host is inflated by this
   much and clips there, and the integrator keeps fragments inside it with side
   walls, so nothing is ever sliced off mid-flight. The root cannot be relied on
   to clip instead: `overflow-x: clip` with a visible y-axis computes back to
   `auto` and simply grows the document.

   `bottom` must exceed the deepest floor `floorFor` returns; `top` only has to
   clear the upward pop at the moment of the strike. `x` is an upper bound -
   `place()` clamps it to the room the element actually has. */
var PAD = { x: 110, top: 90, bottom: 140 };
var WALL_BOUNCE = 0.42;

var coarse = window.matchMedia('(pointer: coarse)').matches;
var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Mobile gets a coarser fracture and far fewer particles. This is the single
   knob that keeps a mid-range phone at frame rate: fragment count is the cost
   driver, because each fragment is a cloned subtree the browser must paint. */
var RAYS = coarse ? 5 : 8;
var RINGS = coarse ? 3 : 4;
var MAX_PARTICLES = coarse ? 90 : 260;
var MAX_SHATTERED = coarse ? 3 : 4;

/* ===== MODULE STATE ===== */
var active = false;
var targets = [];        /* { el, damage, fracture, crack, restore } */
var fragments = [];      /* live rigid bodies */
var particles = [];
var shatteredOrder = []; /* for capping how much debris exists at once */
var tool = 'hammer';
var raf = null;
var lastT = 0;
var canvas = null;
var ctx = null;
var cursorEl = null;
var uiRoot = null;
var toastEl = null;
var toastTimer = null;
var liveEl = null;
var shake = { t: 0, mag: 0 };
var bombEl = null;
var bombTimer = null;
var stats = { hits: 0, shattered: 0, bombs: 0 };
var achievementShown = false;
var exitCallback = null;
var listeners = [];

/* ===== SMALL HELPERS ===== */
function on(target, type, fn, opts) {
    target.addEventListener(type, fn, opts);
    listeners.push([target, type, fn, opts]);
}

function offAll() {
    listeners.forEach(function (l) { l[0].removeEventListener(l[1], l[2], l[3]); });
    listeners = [];
}

function rand(a, b) { return a + Math.random() * (b - a); }

function emit(name, detail) {
    /* No analytics vendor is bundled with this site and Break Mode is not the
       reason to add one. These are plain DOM events: anything the portfolio
       later adopts can listen for them in one place. */
    try {
        document.dispatchEvent(new CustomEvent('breakmode', {
            detail: Object.assign({ event: name }, detail || {})
        }));
    } catch (err) { /* CustomEvent unavailable: instrumentation is optional */ }
}

function announce(text) {
    if (liveEl) liveEl.textContent = text;
}

/* ===== FRACTURE GEOMETRY =====
   A radial web centred on the impact: `RAYS` spokes at jittered angles, each
   crossing `RINGS` jittered radii. Cells between consecutive spokes and rings
   become both the crack lines and, later, the fragment polygons.

   The outermost ring is always pushed past the furthest corner, so the cells
   cover the whole box and `clip-path` never leaves a gap. */
function buildFracture(w, h, hx, hy) {
    var maxR = 0;
    [[0, 0], [w, 0], [0, h], [w, h]].forEach(function (c) {
        var d = Math.hypot(c[0] - hx, c[1] - hy);
        if (d > maxR) maxR = d;
    });

    var f = { hx: hx, hy: hy, maxR: maxR, rays: [] };
    var base = Math.random() * Math.PI * 2;
    var step = Math.PI * 2 / RAYS;

    for (var i = 0; i < RAYS; i++) {
        var a = base + step * i + (Math.random() - 0.5) * step * 0.5;
        var radii = [];
        for (var k = 1; k <= RINGS; k++) {
            /* The exponent decides how local the damage feels. Above 1 it packs
               the inner rings tight around the strike, so the first hit cracks a
               fist-sized patch rather than webbing a whole card, and each further
               hit visibly spreads. It also matches how the material breaks: fine
               debris at the impact, big slabs out at the edge. */
            radii.push(maxR * Math.pow(k / RINGS, 1.75) * rand(0.82, 1.12));
        }
        radii.sort(function (p, q) { return p - q; });
        radii[RINGS - 1] = maxR * rand(1.05, 1.16);
        f.rays.push({ a: a, r: radii });
    }
    return f;
}

/* Ring 0 is the impact point itself, where every spoke meets. */
function fpt(f, i, k) {
    if (k === 0) return [f.hx, f.hy];
    var ray = f.rays[i % f.rays.length];
    return [f.hx + Math.cos(ray.a) * ray.r[k - 1], f.hy + Math.sin(ray.a) * ray.r[k - 1]];
}

function fractureCells(f) {
    var cells = [];
    for (var k = 0; k < RINGS; k++) {
        for (var i = 0; i < f.rays.length; i++) {
            cells.push(k === 0
                ? [fpt(f, i, 0), fpt(f, i, 1), fpt(f, i + 1, 1)]
                : [fpt(f, i, k), fpt(f, i + 1, k), fpt(f, i + 1, k + 1), fpt(f, i, k + 1)]);
        }
    }
    return cells;
}

/* A dead-straight crack reads as a graphic. Breaking each span into segments
   with small perpendicular offsets is what makes it read as a crack. */
function jitterPath(x1, y1, x2, y2, segs, amp) {
    var dx = x2 - x1, dy = y2 - y1;
    var len = Math.hypot(dx, dy) || 1;
    var nx = -dy / len, ny = dx / len;
    var d = 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1);
    for (var s = 1; s < segs; s++) {
        var t = s / segs;
        var j = (Math.random() - 0.5) * amp;
        d += 'L' + (x1 + dx * t + nx * j).toFixed(1) + ' ' + (y1 + dy * t + ny * j).toFixed(1);
    }
    return d + 'L' + x2.toFixed(1) + ' ' + y2.toFixed(1);
}

/* Fractures do not travel as bare lines: they shed short offshoots that die
   out. These carry no structural meaning - no fragment is cut along them -
   but without them the damage reads as a diagram of a crack. */
function branchPath(x1, y1, x2, y2) {
    var dx = x2 - x1, dy = y2 - y1;
    var len = Math.hypot(dx, dy) || 1;
    var t = rand(0.3, 0.75);
    var bx = x1 + dx * t, by = y1 + dy * t;
    var a = Math.atan2(dy, dx) + (Math.random() < 0.5 ? -1 : 1) * rand(0.5, 1.05);
    var bl = len * rand(0.16, 0.4);
    return jitterPath(bx, by, bx + Math.cos(a) * bl, by + Math.sin(a) * bl, 2, bl * 0.16);
}

/* ===== CRACK SHEET =====
   One inline SVG per damaged element, absolutely positioned over it inside a
   wrapper that sits next to the element in the DOM, so it inherits nothing it
   should not and clips to the element's own rounded corners. */
function ensureCrack(t) {
    if (t.crack) return t.crack;

    var rect = t.el.getBoundingClientRect();
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'bm-cracks');
    svg.setAttribute('viewBox', '0 0 ' + rect.width + ' ' + rect.height);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');

    var host = document.createElement('div');
    host.className = 'bm-crackhost';
    host.setAttribute('aria-hidden', 'true');
    host.style.borderRadius = getComputedStyle(t.el).borderRadius;
    host.appendChild(svg);

    place(host, t.el);
    t.crack = { host: host, svg: svg, drawn: 0 };
    return t.crack;
}

function drawCracks(t) {
    var c = ensureCrack(t);
    var f = t.fracture;
    var upto = Math.min(t.damage, RINGS);
    if (upto <= c.drawn) return;

    var frag = document.createDocumentFragment();

    /* Every crack is drawn three times: a soft dark spread that reads as depth,
       a light stroke offset a hair down-right that reads as the lit edge of the
       split, and the dark hairline itself on top. One stroke alone looks drawn;
       three look like the surface has actually parted. */
    function add(d, hair) {
        ['bm-crack bm-crack--deep', 'bm-crack bm-crack--lift', 'bm-crack'].forEach(function (cls) {
            var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            p.setAttribute('d', d);
            p.setAttribute('class', hair ? cls + ' bm-crack--hair' : cls);
            frag.appendChild(p);
        });
    }

    for (var k = c.drawn; k < upto; k++) {
        /* Spokes grow one ring further out with every hit. */
        for (var i = 0; i < f.rays.length; i++) {
            var a = fpt(f, i, k), b = fpt(f, i, k + 1);
            add(jitterPath(a[0], a[1], b[0], b[1], 5, Math.min(16, f.maxR * 0.075)));
            add(branchPath(a[0], a[1], b[0], b[1]), true);
            if (Math.random() < 0.5) add(branchPath(a[0], a[1], b[0], b[1]), true);
        }
        /* ...and the ring it just reached joins them up, except the outermost,
           which lies outside the box and would only draw along the border. */
        if (k + 1 < RINGS) {
            var ring = '';
            for (var j = 0; j <= f.rays.length; j++) {
                var p1 = fpt(f, j, k + 1), p2 = fpt(f, j + 1, k + 1);
                ring += jitterPath(p1[0], p1[1], p2[0], p2[1], 3, Math.min(12, f.maxR * 0.05));
            }
            add(ring);
        }
    }

    c.svg.appendChild(frag);
    c.drawn = upto;
}

/* ===== POSITIONING =====
   Overlays and fragment containers are inserted as siblings of the element
   they mirror. Keeping them inside the same parent means descendant selectors
   (`.duo-item h3`, `.pg-spec p`) and inherited typography still apply to the
   clones, which is most of why the fragments look identical to the original.

   Absolute offsets are measured against the nearest positioned ancestor, and
   one is created if there is none. Everything mutated here is recorded so
   teardown can put it back exactly. */
var patched = [];

function offsetParentFor(el) {
    var p = el.parentElement;
    while (p && p !== document.body) {
        var cs = getComputedStyle(p);
        if (cs.position !== 'static') return p;
        p = p.parentElement;
    }
    /* Nothing positioned on the way up: promote the immediate parent, and
       remember to undo it. `relative` with no offsets moves nothing. */
    var host = el.parentElement;
    if (host && host.dataset.bmPatched !== '1') {
        host.dataset.bmPatched = '1';
        patched.push({ el: host, position: host.style.position });
        host.style.position = 'relative';
    }
    return host;
}

/* Debris used to need its clipping ancestors opened so it was not sliced off
   mid-fall. It no longer does - the fragment host clips it instead, and the
   walls keep it inside - and opening them was actively harmful: this page hangs
   decorative atmosphere blobs (`.pg-atmo`, `.pg-stage__ambient`) outside their
   sections and relies on those ancestors to clip them. Setting `overflow:
   visible` released them and widened the document by ~114px. Nothing here
   touches ancestor overflow any more. */

/* `pad` grows the box beyond the element it mirrors. The fragment host uses it
   to give debris room to travel and then clips at its own edge, so flying
   pieces never add scrollable overflow to the document. Without that, a
   shattered card silently makes the page wider or taller mid-fall, which moves
   the scrollbars and can trip the browser's scroll anchoring.

   The horizontal pad is clamped to the room the element actually has inside
   its parent. On a phone a card already spans the full width, so any padding
   at all would hang off the viewport and create a horizontal scrollbar - the
   clamp collapses it to zero there and the walls close in to match. Returns
   the padding actually applied. */
function place(node, el, pad) {
    var parent = offsetParentFor(el);
    if (!parent) return { x: 0, top: 0 };

    pad = pad || {};
    var pr = parent.getBoundingClientRect();
    var cs = getComputedStyle(parent);
    var er = el.getBoundingClientRect();

    var bl = parseFloat(cs.borderLeftWidth);
    var bt = parseFloat(cs.borderTopWidth);
    var left = er.left - pr.left - bl;
    var top = er.top - pr.top - bt;

    /* Room is measured to the viewport edges, not to the offset parent's. What
       must not happen is the host widening the document; staying inside its
       parent is irrelevant, since parents do not clip by default and a parent
       that does clip only trims the host harmlessly. Measuring against the
       parent was far too conservative: the hero devices sit at the left edge of
       their own column with most of the page free beside them, and it collapsed
       their debris into a 12px-wide column. */
    var vw = document.documentElement.clientWidth;
    var px = Math.max(0, Math.min(pad.x || 0, er.left, vw - er.right));
    var pt = Math.min(pad.top || 0, Math.max(0, top));
    var pb = pad.bottom || 0;

    node.style.left = (left - px) + 'px';
    node.style.top = (top - pt) + 'px';
    node.style.width = (er.width + px * 2) + 'px';
    node.style.height = (er.height + pt + pb) + 'px';

    parent.insertBefore(node, el.nextSibling);
    return { x: px, top: pt };
}

function unpatchAll() {
    patched.forEach(function (p) {
        if ('position' in p) { p.el.style.position = p.position; delete p.el.dataset.bmPatched; }
        tidyStyle(p.el);
    });
    patched = [];
}

/* Clearing the last inline property leaves `style=""` behind. Harmless to
   render, but it means the markup Break Mode hands back is not the markup it
   was given, so it goes too. */
function tidyStyle(el) {
    if (el.getAttribute('style') === '') el.removeAttribute('style');
}

/* ===== HIT ===== */
function hit(t, cx, cy, power) {
    var rect = t.el.getBoundingClientRect();
    var hx = Math.max(0, Math.min(rect.width, cx - rect.left));
    var hy = Math.max(0, Math.min(rect.height, cy - rect.top));

    if (!t.fracture) t.fracture = buildFracture(rect.width, rect.height, hx, hy);

    t.damage += 1;
    stats.hits += 1;
    emit('break_tool_used', { tool: tool, damage: t.damage });

    flash(cx, cy, power);
    burst(cx, cy, power, coarse ? 8 : 16);
    if (navigator.vibrate && coarse) { try { navigator.vibrate(t.damage >= HITS_TO_SHATTER ? 28 : 11); } catch (e) { } }

    if (t.damage >= HITS_TO_SHATTER) {
        shatter(t, cx, cy, power);
        return;
    }

    drawCracks(t);
    recoil(t, hx, hy, rect, power);
    addShake(3.2 * power);

    if (stats.hits === 1) toast('Well… that was expensive.');
}

/* The element flinches away from the strike and springs most of the way back,
   keeping a small permanent offset so accumulated damage stays legible. */
function recoil(t, hx, hy, rect, power) {
    var dx = (hx - rect.width / 2) / (rect.width / 2 || 1);
    var dy = (hy - rect.height / 2) / (rect.height / 2 || 1);
    var kick = 9 * power;

    t.el.classList.add('bm-hurt');
    if (reduced) return;

    t.el.style.transition = 'translate 80ms cubic-bezier(.2,.8,.4,1), rotate 80ms ease-out, scale 80ms ease-out';
    t.el.style.translate = (dx * kick).toFixed(1) + 'px ' + (dy * kick + 3).toFixed(1) + 'px';
    t.el.style.rotate = (dx * 0.7 * power).toFixed(2) + 'deg';
    t.el.style.scale = '0.988';

    setTimeout(function () {
        if (!active || t.shattered) return;
        var settle = t.damage * 1.6;
        t.el.style.transition = 'translate 620ms cubic-bezier(.16,1.06,.3,1), rotate 620ms cubic-bezier(.16,1.06,.3,1), scale 400ms ease-out';
        t.el.style.translate = (dx * settle).toFixed(1) + 'px ' + settle.toFixed(1) + 'px';
        t.el.style.rotate = (dx * 0.35 * t.damage).toFixed(2) + 'deg';
        t.el.style.scale = '1';
    }, 85);
}

/* ===== SHATTER =====
   The one moment that has to read as physical. The element's own fracture web
   becomes a set of polygons; each polygon gets a clipped clone of the element
   and a velocity pointing away from the impact. */
function shatter(t, cx, cy, power) {
    if (t.shattered) return;
    t.shattered = true;
    stats.shattered += 1;
    emit('break_tool_used', { tool: tool, shattered: true });

    var rect = t.el.getBoundingClientRect();
    var hx = Math.max(0, Math.min(rect.width, cx - rect.left));
    var hy = Math.max(0, Math.min(rect.height, cy - rect.top));
    if (!t.fracture) t.fracture = buildFracture(rect.width, rect.height, hx, hy);

    /* Reduced motion: no flying debris. The surface takes its cracks, drops
       its colour and settles. Still clearly "broken", nothing thrown. */
    if (reduced) {
        t.damage = RINGS;
        drawCracks(t);
        t.el.classList.add('bm-dead');
        afterShatter(t);
        return;
    }

    /* The host is inflated by the furthest a fragment can travel, and clips
       there. `place` may shrink the horizontal pad if the element has no room
       for it, so the walls are derived from what was actually applied. */
    var host = document.createElement('div');
    host.className = 'bm-frags';
    host.setAttribute('aria-hidden', 'true');
    var pad = place(host, t.el, PAD);
    var wall = Math.max(12, pad.x - 14);
    host.dataset.bmPadX = pad.x;
    host.dataset.bmPadTop = pad.top;

    var cells = fractureCells(t.fracture);
    var template = cleanClone(t.el, rect);

    cells.forEach(function (poly) {
        var el = document.createElement('div');
        el.className = 'bm-frag';
        el.style.left = pad.x + 'px';
        el.style.top = pad.top + 'px';
        el.style.width = rect.width + 'px';
        el.style.height = rect.height + 'px';
        el.style.clipPath = 'polygon(' + poly.map(function (p) {
            return p[0].toFixed(1) + 'px ' + p[1].toFixed(1) + 'px';
        }).join(',') + ')';

        el.appendChild(template.cloneNode(true));
        host.appendChild(el);

        /* Centroid drives both the rotation origin and the blast direction. */
        var gx = 0, gy = 0;
        poly.forEach(function (p) { gx += p[0]; gy += p[1]; });
        gx /= poly.length; gy /= poly.length;
        el.style.transformOrigin = gx.toFixed(1) + 'px ' + gy.toFixed(1) + 'px';

        /* A flat surface catches light differently once its pieces are no
           longer coplanar. One static brightness per fragment, set at birth,
           buys most of that for no per-frame cost. */
        el.style.setProperty('--bm-face', rand(0.9, 1.07).toFixed(3));

        var ang = Math.atan2(gy - hy, gx - hx);
        var dist = Math.hypot(gx - hx, gy - hy);
        var speed = (200 + 420 * power) / (1 + dist / 190) + rand(-30, 70);

        /* Sideways travel is deliberately damped well below the radial impulse.
           A struck card should read as collapsing into its own footprint, not
           exploding across the column beside it - debris that lands on the
           neighbouring project is just content being obscured. The bomb still
           throws wider, because its `power` runs higher. */
        fragments.push({
            el: el,
            host: host,
            target: t,
            gx: gx, gy: gy,
            x: 0, y: 0,
            vx: Math.cos(ang) * speed * 0.5,
            vy: Math.sin(ang) * speed * 0.9 - rand(150, 400) * power,
            rot: 0, vr: rand(-260, 260) * power,
            floor: floorFor(rect, gy),
            wall: wall,
            asleep: false
        });
    });

    t.el.classList.add('bm-void');
    if (t.crack) t.crack.host.style.display = 'none';

    addShake(9 * power);
    burst(cx, cy, power * 1.4, coarse ? 16 : 40);
    afterShatter(t);
}

/* Debris settles just under where the surface stood, not at the bottom of the
   screen: the pieces belong to the page, so they scroll with it and pile up in
   their own section instead of burying whatever is below.

   The floor is expressed as travel for this fragment's centroid, so a piece
   from the top of a card falls the height of the card and a piece from the
   bottom barely moves - which is what makes the pile read as the card having
   collapsed rather than a sheet of confetti being dropped. */
function floorFor(rect, gy) {
    return rect.height - gy + rand(20, 76);
}

/* Clones must not duplicate ids, steal focus, or start decoding media. */
function cleanClone(el, rect) {
    var clone = el.cloneNode(true);
    clone.removeAttribute('id');
    clone.removeAttribute('data-break');
    clone.classList.remove('bm-hurt', 'bm-void');
    clone.style.width = rect.width + 'px';
    clone.style.height = rect.height + 'px';
    clone.style.margin = '0';
    clone.style.translate = 'none';
    clone.style.rotate = 'none';
    clone.style.scale = 'none';
    clone.setAttribute('aria-hidden', 'true');
    clone.setAttribute('inert', '');

    clone.querySelectorAll('[id]').forEach(function (n) { n.removeAttribute('id'); });
    clone.querySelectorAll('video,iframe').forEach(function (n) {
        var still = document.createElement('img');
        still.src = n.getAttribute('poster') || '';
        still.className = n.className;
        if (n.parentNode) n.parentNode.replaceChild(still, n);
    });
    return clone;
}

function afterShatter(t) {
    shatteredOrder.push(t);
    /* Old debris is swept before it can accumulate into a frame-rate problem. */
    while (shatteredOrder.length > MAX_SHATTERED) {
        sweep(shatteredOrder.shift());
    }

    if (!achievementShown && stats.shattered >= ACHIEVEMENT_AT) {
        achievementShown = true;
        showAchievement();
    } else if (stats.shattered === 1) {
        toast('That one was load-bearing.');
    }
    kick();
}

/* Fade out and drop a shattered surface's debris, restoring the element so
   the layout is never left with a permanent hole. */
function sweep(t) {
    fragments.filter(function (f) { return f.target === t; }).forEach(function (f) {
        f.el.classList.add('bm-frag--fade');
    });
    setTimeout(function () {
        fragments = fragments.filter(function (f) {
            if (f.target !== t) return true;
            if (f.el.parentNode) f.el.parentNode.removeChild(f.el);
            return false;
        });
        restore(t);
    }, 420);
}

/* ===== BOMB =====
   Placed, not thrown. Short fuse, one flash, one shockwave, and every surface
   inside the blast radius takes an impulse scaled by distance. Under 1.5s end
   to end, because the second viewing has to be as good as the first. */
function placeBomb(cx, cy) {
    if (bombEl) return;

    stats.bombs += 1;
    emit('break_tool_used', { tool: 'bomb' });

    bombEl = document.createElement('div');
    bombEl.className = 'bm-bomb';
    bombEl.setAttribute('aria-hidden', 'true');
    bombEl.style.left = cx + 'px';
    bombEl.style.top = cy + 'px';
    bombEl.innerHTML = '<span class="bm-bomb__body"></span><span class="bm-bomb__fuse"></span><span class="bm-bomb__spark"></span>';
    uiRoot.appendChild(bombEl);
    announce('Bomb armed.');

    var fuse = reduced ? 420 : 900;
    bombTimer = setTimeout(function () { detonate(cx, cy); }, fuse);
}

function detonate(cx, cy) {
    bombTimer = null;
    if (bombEl && bombEl.parentNode) bombEl.parentNode.removeChild(bombEl);
    bombEl = null;
    if (!active) return;

    if (!reduced) {
        var wave = document.createElement('div');
        wave.className = 'bm-wave';
        wave.setAttribute('aria-hidden', 'true');
        wave.style.left = cx + 'px';
        wave.style.top = cy + 'px';
        uiRoot.appendChild(wave);
        setTimeout(function () { if (wave.parentNode) wave.parentNode.removeChild(wave); }, 620);
    }

    var radius = Math.min(window.innerWidth, window.innerHeight) * 0.62;
    addShake(reduced ? 0 : 20);
    burst(cx, cy, 2.2, coarse ? 30 : 90);
    if (navigator.vibrate && coarse) { try { navigator.vibrate([0, 34]); } catch (e) { } }

    /* Snapshot first: shatter() mutates `targets` state as it goes. */
    targets.filter(function (t) { return !t.shattered; }).forEach(function (t) {
        var r = t.el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > window.innerHeight + 200) return;

        var ex = Math.max(r.left, Math.min(r.right, cx));
        var ey = Math.max(r.top, Math.min(r.bottom, cy));
        var d = Math.hypot(ex - cx, ey - cy);
        if (d > radius) return;

        var power = 1 - d / radius;
        if (!t.fracture) {
            t.fracture = buildFracture(r.width, r.height,
                Math.max(0, Math.min(r.width, cx - r.left)),
                Math.max(0, Math.min(r.height, cy - r.top)));
        }
        if (power > 0.28) {
            t.damage = HITS_TO_SHATTER;
            shatter(t, cx, cy, 0.85 + power * 0.8);
        } else {
            t.damage = Math.min(RINGS, t.damage + 1);
            drawCracks(t);
            recoil(t, cx - r.left, cy - r.top, r, power * 1.5);
        }
    });

    toast('Blast radius: everything I shipped this quarter.');
    kick();
}

/* ===== REPAIR =====
   Physics stops, and every fragment transitions back to `transform:none` -
   which is where it was born, so the surface reassembles exactly. The stagger
   runs outward from the impact, so each card knits itself back together from
   the inside out. */
function repair() {
    if (bombTimer) { clearTimeout(bombTimer); bombTimer = null; }
    if (bombEl && bombEl.parentNode) { bombEl.parentNode.removeChild(bombEl); bombEl = null; }

    emit('break_mode_repaired', { hits: stats.hits, shattered: stats.shattered });

    var live = fragments.slice();
    fragments = [];
    particles = [];

    live.forEach(function (f) {
        /* A surface swept for being old is restored before its fragments finish
           fading, so by now its fracture may already be gone. Repair still has
           to move those pieces home; they just do it without the stagger. */
        var fr = f.target.fracture;
        var d = fr ? Math.hypot(f.gx - fr.hx, f.gy - fr.hy) : 0;
        var delay = reduced ? 0 : Math.min(220, d * 0.45);
        f.el.style.transition = reduced
            ? 'transform 200ms linear, opacity 200ms linear'
            : 'transform 700ms cubic-bezier(.16,1,.3,1) ' + delay.toFixed(0) + 'ms';
        f.el.style.transform = 'none';
    });

    targets.forEach(function (t) {
        if (t.crack) t.crack.host.classList.add('bm-crackhost--heal');
    });

    var wait = reduced ? 220 : 980;
    setTimeout(function () {
        live.forEach(function (f) { if (f.el.parentNode) f.el.parentNode.removeChild(f.el); });
        targets.forEach(restore);
        shatteredOrder = [];
        stats.hits = 0; stats.shattered = 0;
        achievementShown = false;
        hideAchievement();
        if (active) toast('Production restored.');
        announce('Page repaired.');
    }, wait);
}

/* Put one surface back exactly as it was found. */
function restore(t) {
    t.shattered = false;
    t.damage = 0;
    t.fracture = null;
    t.el.classList.remove('bm-hurt', 'bm-void', 'bm-dead');
    t.el.style.transition = '';
    t.el.style.translate = '';
    t.el.style.rotate = '';
    t.el.style.scale = '';
    tidyStyle(t.el);
    if (t.crack) {
        if (t.crack.host.parentNode) t.crack.host.parentNode.removeChild(t.crack.host);
        t.crack = null;
    }
    /* An emptied fragment host left behind would still occupy a slot in a grid. */
    var hosts = t.el.parentNode ? t.el.parentNode.querySelectorAll('.bm-frags') : [];
    Array.prototype.forEach.call(hosts, function (h) {
        if (!h.children.length && h.parentNode) h.parentNode.removeChild(h);
    });
}

/* ===== PARTICLES =====
   One shared canvas, one draw call per frame, hard cap on count. Dust is
   short-lived and lives in viewport space, which is correct: it is in the air,
   not attached to the page. */
function ensureCanvas() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.className = 'bm-dust';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    sizeCanvas();
}

function sizeCanvas() {
    if (!canvas) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function burst(x, y, power, count) {
    if (reduced) return;
    ensureCanvas();
    for (var i = 0; i < count; i++) {
        if (particles.length >= MAX_PARTICLES) break;
        var a = Math.random() * Math.PI * 2;
        var s = rand(60, 460) * power;
        particles.push({
            x: x, y: y,
            vx: Math.cos(a) * s, vy: Math.sin(a) * s - rand(40, 260) * power,
            life: 0, max: rand(0.35, 0.9),
            r: rand(1, 3.4),
            g: Math.random() < 0.35
        });
    }
    kick();
}

function flash(x, y, power) {
    if (reduced || !uiRoot) return;
    var el = document.createElement('span');
    el.className = 'bm-impact';
    el.setAttribute('aria-hidden', 'true');
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.setProperty('--bm-impact-size', (70 + 60 * power).toFixed(0) + 'px');
    uiRoot.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 420);
}

/* ===== SHAKE =====
   Applied to <html>. Because the root element is the containing block for the
   whole page anyway, translating it moves fixed elements with it, which is
   what a screen shake should do. Amplitude stays small enough never to expose
   an edge. */
function addShake(mag) {
    if (reduced) return;
    shake.mag = Math.min(9, Math.max(shake.mag, mag));
    shake.t = 0.34;
    kick();
}

/* ===== SIMULATION LOOP =====
   One rAF for fragments, particles and shake. It stops itself the moment
   there is nothing moving, and `kick()` restarts it - so an idle Break Mode
   costs nothing at all. */
function kick() {
    if (raf === null && active) {
        lastT = 0;
        raf = requestAnimationFrame(step);
    }
}

function step(now) {
    raf = null;
    if (!active) return;

    var dt = lastT ? Math.min((now - lastT) / 1000, 1 / 30) : 1 / 60;
    lastT = now;

    var awake = 0;

    /* --- fragments --- */
    for (var i = 0; i < fragments.length; i++) {
        var f = fragments[i];
        if (f.asleep) continue;

        f.vy += GRAVITY * dt;
        f.vx *= AIR; f.vy *= AIR;
        f.x += f.vx * dt;
        f.y += f.vy * dt;
        f.rot += f.vr * dt;

        /* Side walls at the host's clip edge. They keep the pile inside the
           column the surface occupied - debris that drifts onto the project
           beside it is just content being covered up - and guarantee no piece
           is ever cut off by the host's own clipping. */
        if (f.x < -f.wall) { f.x = -f.wall; f.vx = -f.vx * WALL_BOUNCE; f.vr *= 0.7; }
        else if (f.x > f.wall) { f.x = f.wall; f.vx = -f.vx * WALL_BOUNCE; f.vr *= 0.7; }

        if (f.y > f.floor) {
            f.y = f.floor;
            f.vy = -f.vy * RESTITUTION;
            f.vx *= FLOOR_FRICTION;
            f.vr *= FLOOR_FRICTION;
            if (Math.abs(f.vy) < SLEEP_V && Math.abs(f.vx) < SLEEP_V) {
                f.vy = 0; f.vx = 0; f.vr *= 0.5;
                if (Math.abs(f.vr) < 12) { f.vr = 0; f.asleep = true; }
            }
        }

        f.el.style.transform = 'translate3d(' + f.x.toFixed(1) + 'px,' + f.y.toFixed(1) + 'px,0) rotate(' + f.rot.toFixed(1) + 'deg)';
        if (!f.asleep) awake++;
    }

    /* --- particles --- */
    if (ctx) {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        for (var p = particles.length - 1; p >= 0; p--) {
            var q = particles[p];
            q.life += dt;
            if (q.life >= q.max) { particles.splice(p, 1); continue; }
            q.vy += GRAVITY * 0.55 * dt;
            q.x += q.vx * dt;
            q.y += q.vy * dt;
            var alpha = 1 - q.life / q.max;
            ctx.globalAlpha = alpha * 0.85;
            ctx.fillStyle = q.g ? 'rgba(13,122,107,1)' : 'rgba(24,30,42,1)';
            ctx.beginPath();
            ctx.arc(q.x, q.y, q.r * alpha, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        awake += particles.length;
    }

    /* --- shake --- */
    if (shake.t > 0) {
        shake.t -= dt;
        var k = Math.max(0, shake.t / 0.34);
        var m = shake.mag * k * k;
        document.documentElement.style.translate =
            (rand(-m, m)).toFixed(2) + 'px ' + (rand(-m, m)).toFixed(2) + 'px';
        awake++;
    } else if (shake.mag) {
        shake.mag = 0;
        document.documentElement.style.translate = '';
        tidyStyle(document.documentElement);
    }

    if (awake > 0) raf = requestAnimationFrame(step);
}

/* ===== UI ===== */
function buildUI() {
    uiRoot = document.createElement('div');
    uiRoot.className = 'bm-ui';

    liveEl = document.createElement('p');
    liveEl.className = 'bm-sr';
    liveEl.setAttribute('role', 'status');
    liveEl.setAttribute('aria-live', 'polite');
    uiRoot.appendChild(liveEl);

    toastEl = document.createElement('p');
    toastEl.className = 'bm-toast';
    toastEl.setAttribute('aria-hidden', 'true');
    uiRoot.appendChild(toastEl);

    var bar = document.createElement('div');
    bar.className = 'bm-bar';
    bar.setAttribute('role', 'toolbar');
    bar.setAttribute('aria-label', 'Break mode tools');

    var ICONS = {
        hammer: '<path d="M2.4 13.6 8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M7 5.2 10.8 1.4a1 1 0 0 1 1.4 0l2.4 2.4a1 1 0 0 1 0 1.4L10.8 9 7 5.2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
        bomb: '<circle cx="7" cy="10" r="4.6" stroke="currentColor" stroke-width="1.5"/><path d="M10.4 6.6 12 5m0 0V2.6M12 5h2.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
        repair: '<path d="M8 1.6 9.5 6l4.5 1.4L9.5 8.8 8 13.2 6.5 8.8 2 7.4 6.5 6 8 1.6Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>',
        exit: '<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'
    };

    function mkButton(name, label, kind) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'bm-btn' + (kind ? ' bm-btn--' + kind : '');
        b.dataset.bm = name;
        b.innerHTML = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">' + ICONS[name] + '</svg><span>' + label + '</span>';
        bar.appendChild(b);
        return b;
    }

    var hammerBtn = mkButton('hammer', 'Hammer', 'tool');
    var bombBtn = mkButton('bomb', 'Bomb', 'tool');
    mkButton('repair', 'Repair');
    var exitBtn = mkButton('exit', 'Exit');
    exitBtn.setAttribute('aria-label', 'Exit break mode');

    uiRoot.appendChild(bar);
    document.body.appendChild(uiRoot);

    function syncTool() {
        hammerBtn.setAttribute('aria-pressed', tool === 'hammer' ? 'true' : 'false');
        bombBtn.setAttribute('aria-pressed', tool === 'bomb' ? 'true' : 'false');
        document.documentElement.dataset.bmTool = tool;
    }
    syncTool();

    on(bar, 'click', function (e) {
        var btn = e.target.closest('.bm-btn');
        if (!btn) return;
        var name = btn.dataset.bm;
        if (name === 'exit') { exit(); return; }
        if (name === 'repair') { repair(); return; }
        tool = name;
        syncTool();
        announce(name === 'bomb' ? 'Bomb selected. Choose where to place it.' : 'Hammer selected.');
    });
}

function toast(text) {
    if (!toastEl) return;
    toastEl.textContent = text;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2600);
}

/* The payoff. A corner card, not a modal: nothing to dismiss, nothing
   blocking, and the emphasis is on the rebuild rather than the wreckage. */
function showAchievement() {
    var card = document.createElement('div');
    card.className = 'bm-ach';
    card.setAttribute('role', 'status');
    card.innerHTML =
        '<p class="bm-ach__eyebrow">Achievement unlocked</p>' +
        '<p class="bm-ach__title">You broke production</p>' +
        '<p class="bm-ach__note">Good thing I build things too.</p>' +
        '<button type="button" class="bm-ach__cta" data-bm="repair">Rebuild</button>';
    uiRoot.appendChild(card);
    requestAnimationFrame(function () { card.classList.add('is-on'); });
    on(card, 'click', function (e) { if (e.target.closest('[data-bm="repair"]')) repair(); });
    emit('break_mode_achievement');
}

function hideAchievement() {
    var card = uiRoot && uiRoot.querySelector('.bm-ach');
    if (!card) return;
    card.classList.remove('is-on');
    setTimeout(function () { if (card.parentNode) card.parentNode.removeChild(card); }, 320);
}

/* ===== CURSOR =====
   Pointer devices only. A real tool in the hand is most of why the hammer
   feels like a hammer rather than a click handler. */
function buildCursor() {
    if (coarse) return;
    cursorEl = document.createElement('div');
    cursorEl.className = 'bm-cursor';
    cursorEl.setAttribute('aria-hidden', 'true');
    cursorEl.innerHTML =
        '<svg viewBox="0 0 34 34" fill="none">' +
        '<path class="bm-cursor__hammer" d="M6 29 16.5 18.5" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>' +
        '<path class="bm-cursor__head" d="M14.5 12.5 22.5 4.5a2 2 0 0 1 2.8 0l4.2 4.2a2 2 0 0 1 0 2.8l-8 8-7-7Z" fill="currentColor"/>' +
        '<circle class="bm-cursor__bomb" cx="17" cy="19" r="8" stroke="currentColor" stroke-width="2.4"/>' +
        '<path class="bm-cursor__bomb" d="M22.6 13.4 25 11m0 0V7.6M25 11h3.4" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>' +
        '</svg>';
    document.body.appendChild(cursorEl);

    on(document, 'pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        cursorEl.style.transform = 'translate3d(' + e.clientX + 'px,' + e.clientY + 'px,0)';
        if (!cursorEl.classList.contains('is-on')) cursorEl.classList.add('is-on');
    }, { passive: true });

    on(document, 'pointerleave', function () { cursorEl.classList.remove('is-on'); });
}

function swingCursor() {
    if (!cursorEl) return;
    cursorEl.classList.remove('is-swing');
    /* Reading offsetWidth restarts the animation on a repeated hit. */
    void cursorEl.offsetWidth;
    cursorEl.classList.add('is-swing');
}

/* ===== INPUT ===== */
function onPointerDown(e) {
    if (!active || e.button > 0) return;
    /* Anything in the Break Mode UI, and any real control, keeps working. */
    if (e.target.closest('.bm-ui, .bm-entry')) return;

    var t = targetAt(e.clientX, e.clientY);

    if (tool === 'bomb') {
        e.preventDefault();
        placeBomb(e.clientX, e.clientY);
        return;
    }

    if (!t) return;
    e.preventDefault();
    swingCursor();
    hit(t, e.clientX, e.clientY, 1);
}

/* Hit test by geometry rather than event target: the crack overlay and the
   fragment hosts sit on top of the surfaces, and a link inside a card would
   otherwise swallow the strike. */
function targetAt(x, y) {
    for (var i = 0; i < targets.length; i++) {
        var t = targets[i];
        if (t.shattered) continue;
        var r = t.el.getBoundingClientRect();
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return t;
    }
    return null;
}

function onKey(e) {
    if (e.key === 'Escape') { exit(); return; }
    if (e.key === 'r' || e.key === 'R') {
        if (e.target.closest && e.target.closest('input,textarea')) return;
        repair();
    }
}

/* Layout moved under us. Overlays and fragment hosts are re-placed against
   their elements; live fragments keep their own local coordinates, so they
   stay correct relative to the host that just moved. */
var resizeTimer = null;
function onResize() {
    sizeCanvas();
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
        if (!active) return;
        targets.forEach(function (t) {
            if (t.crack) reposition(t.crack.host, t.el, 0, 0);
            var host = t.el.parentNode && t.el.parentNode.querySelector('.bm-frags');
            /* The pad applied at shatter time, not the nominal one: `place`
               may have clamped it, and the fragments inside are offset by
               whatever it actually used. */
            if (host) reposition(host, t.el, parseFloat(host.dataset.bmPadX) || 0, parseFloat(host.dataset.bmPadTop) || 0);
        });
    }, 120);
}

/* Only the host moves. Fragments hold their own coordinates relative to it,
   so a reflow carries a settled pile along with the box it fell from. */
function reposition(node, el, padX, padTop) {
    var parent = node.offsetParent || el.parentElement;
    if (!parent) return;
    var pr = parent.getBoundingClientRect();
    var cs = getComputedStyle(parent);
    var er = el.getBoundingClientRect();
    node.style.left = (er.left - pr.left - parseFloat(cs.borderLeftWidth) - padX) + 'px';
    node.style.top = (er.top - pr.top - parseFloat(cs.borderTopWidth) - padTop) + 'px';
}

/* ===== LIFECYCLE ===== */
export function enter(opts) {
    if (active) return;
    active = true;
    exitCallback = (opts && opts.onExit) || null;

    targets = Array.prototype.map.call(document.querySelectorAll('[data-break]'), function (el) {
        return { el: el, damage: 0, fracture: null, crack: null, shattered: false };
    });

    document.documentElement.classList.add('bm-on');
    if (coarse) document.documentElement.classList.add('bm-coarse');
    if (reduced) document.documentElement.classList.add('bm-reduced');

    buildUI();
    buildCursor();

    on(document, 'pointerdown', onPointerDown);
    on(document, 'keydown', onKey);
    on(window, 'resize', onResize, { passive: true });

    emit('break_mode_entered', { reduced: reduced, coarse: coarse });
    /* The visitor arrives here from a button in the hero, so the cue has to say
       what to do next, not just that something happened. One line, no modal,
       gone in under three seconds. */
    toast(coarse ? 'Break mode enabled \u2014 tap something.' : 'Break mode enabled \u2014 hit something.');
    announce(reduced
        ? 'Break mode enabled with reduced motion: surfaces crack in place, nothing is thrown. Press Escape to exit.'
        : 'Break mode enabled. Click a card to strike it. Press R to repair, Escape to exit.');
}

export function exit() {
    if (!active) return;
    active = false;

    emit('break_mode_exited', { hits: stats.hits, shattered: stats.shattered, bombs: stats.bombs });

    if (raf !== null) { cancelAnimationFrame(raf); raf = null; }
    if (bombTimer) { clearTimeout(bombTimer); bombTimer = null; }
    clearTimeout(toastTimer);
    clearTimeout(resizeTimer);
    offAll();

    fragments.forEach(function (f) { if (f.el.parentNode) f.el.parentNode.removeChild(f.el); });
    fragments = [];
    particles = [];
    shatteredOrder = [];

    targets.forEach(restore);
    /* Any fragment host that outlived its fragments. */
    document.querySelectorAll('.bm-frags, .bm-crackhost').forEach(function (n) {
        if (n.parentNode) n.parentNode.removeChild(n);
    });
    unpatchAll();

    if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
    canvas = null; ctx = null;
    if (cursorEl && cursorEl.parentNode) cursorEl.parentNode.removeChild(cursorEl);
    cursorEl = null;
    if (uiRoot && uiRoot.parentNode) uiRoot.parentNode.removeChild(uiRoot);
    uiRoot = null; toastEl = null; liveEl = null;
    if (bombEl && bombEl.parentNode) bombEl.parentNode.removeChild(bombEl);
    bombEl = null;

    document.documentElement.style.translate = '';
    tidyStyle(document.documentElement);
    document.documentElement.classList.remove('bm-on', 'bm-coarse', 'bm-reduced');
    delete document.documentElement.dataset.bmTool;

    shake = { t: 0, mag: 0 };
    stats = { hits: 0, shattered: 0, bombs: 0 };
    achievementShown = false;
    tool = 'hammer';
    targets = [];

    if (exitCallback) exitCallback();
    exitCallback = null;
}
