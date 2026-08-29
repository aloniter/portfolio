/* ===== BREAK MODE: LOADER =====
   Everything a normal visitor pays for is in this file: one small button and
   the code to decide whether to show it. The simulation itself - physics,
   fragments, particles, the toolbar - lives in break-mode-engine.js and is
   fetched only when someone actually presses the button.

   The button is deliberately the only thing that touches the page at load.
   If the engine fails to fetch, the button reports it and the portfolio is
   untouched. */
(function () {
    'use strict';

    var VERSION = '20260829-1';

    /* No opted-in surfaces on this page means nothing to break. Pages other
       than the homepage never load the engine, and never show the button. */
    if (!document.querySelector('[data-break]')) return;

    /* clip-path polygons cut the fragments, and dynamic import fetches the
       engine. Without either there is no Break Mode worth offering, so the
       button never appears rather than appearing and disappointing. */
    var supported = (function () {
        if (!window.CSS || !CSS.supports || !CSS.supports('clip-path', 'polygon(0 0, 1px 0, 0 1px)')) return false;
        try { new Function('return import("data:text/javascript,")'); } catch (err) { return false; }
        return true;
    })();
    if (!supported) return;

    /* ===== ENTRY BUTTON =====
       Bottom-left, out of the way of the toolbar, the hero and the two places
       a visitor expects a chat widget. It stays hidden until the hero has been
       scrolled past, so the first screen is exactly what it was. */
    var style = document.createElement('style');
    style.textContent = [
        '.bm-entry{position:fixed;left:clamp(0.75rem,2vw,1.5rem);bottom:clamp(0.75rem,2vw,1.5rem);',
        'z-index:1200;display:inline-flex;align-items:center;gap:0.5rem;',
        'min-height:44px;padding:0.55rem 0.95rem;border:1px solid rgba(10,13,20,0.12);',
        'border-radius:999px;background:rgba(255,255,255,0.72);',
        '-webkit-backdrop-filter:blur(14px) saturate(1.6);backdrop-filter:blur(14px) saturate(1.6);',
        'box-shadow:0 1px 2px rgba(10,13,20,0.05),0 8px 24px rgba(10,13,20,0.08);',
        'font-family:var(--font-mono,ui-monospace,Menlo,monospace);font-size:0.7rem;',
        'letter-spacing:0.08em;text-transform:uppercase;color:var(--color-text-secondary,#596373);',
        'cursor:pointer;opacity:0;transform:translateY(8px);pointer-events:none;',
        'transition:opacity .4s ease,transform .4s ease,color .2s ease,border-color .2s ease}',
        '.bm-entry.is-ready{opacity:0.66;transform:none;pointer-events:auto}',
        '.bm-entry.is-ready:hover,.bm-entry.is-ready:focus-visible{opacity:1;color:var(--color-text,#0a0d14);',
        'border-color:rgba(10,13,20,0.24)}',
        '.bm-entry:focus-visible{outline:2px solid var(--color-primary,#0d7a6b);outline-offset:3px}',
        '.bm-entry[aria-busy="true"]{opacity:1;color:var(--color-primary,#0d7a6b)}',
        '.bm-entry svg{width:14px;height:14px;flex:none}',
        '.bm-entry.is-gone{opacity:0;pointer-events:none;transform:translateY(8px)}',
        '@media (prefers-reduced-motion:reduce){.bm-entry{transition:opacity .2s ease}',
        '.bm-entry,.bm-entry.is-ready{transform:none}}'
    ].join('');
    document.head.appendChild(style);

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'bm-entry';
    button.setAttribute('aria-label', 'Break mode: make this page breakable');
    button.innerHTML =
        '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">' +
        '<path d="M2.4 13.6 8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
        '<path d="M7 5.2 10.8 1.4a1 1 0 0 1 1.4 0l2.4 2.4a1 1 0 0 1 0 1.4L10.8 9 7 5.2Z"' +
        ' stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' +
        '</svg><span>Break mode</span>';
    document.body.appendChild(button);

    /* Reveal once the hero is behind us. IntersectionObserver where available,
       a scroll threshold otherwise; either way the button ends up visible. */
    (function () {
        var hero = document.querySelector('.pg-hero') || document.querySelector('header');
        var show = function () { button.classList.add('is-ready'); };

        if (!hero || !('IntersectionObserver' in window)) { show(); return; }

        var io = new IntersectionObserver(function (entries) {
            if (!entries[0].isIntersecting) { show(); io.disconnect(); }
        }, { threshold: 0 });
        io.observe(hero);
    })();

    /* ===== LAZY ACTIVATION ===== */
    var engine = null;
    var loading = false;

    function loadStylesheet(href) {
        return new Promise(function (resolve) {
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            /* Resolve either way: a missing stylesheet should not strand the
               visitor on a spinner. The engine degrades to unstyled fragments,
               and Exit still works. */
            link.onload = link.onerror = function () { resolve(); };
            document.head.appendChild(link);
        });
    }

    button.addEventListener('click', function () {
        if (loading) return;

        if (engine) { start(); return; }

        loading = true;
        button.setAttribute('aria-busy', 'true');

        Promise.all([
            import('./break-mode-engine.js?v=' + VERSION),
            loadStylesheet('break-mode.css?v=' + VERSION)
        ]).then(function (results) {
            engine = results[0];
            loading = false;
            button.removeAttribute('aria-busy');
            start();
        }).catch(function () {
            loading = false;
            button.removeAttribute('aria-busy');
            button.querySelector('span').textContent = 'Unavailable';
            /* One failure is enough; do not let it retry-loop on every click. */
            button.disabled = true;
        });
    });

    function start() {
        button.classList.add('is-gone');
        engine.enter({
            onExit: function () {
                button.classList.remove('is-gone');
                button.focus();
            }
        });
    }
})();
