/* ===== BREAK MODE: LOADER =====
   Everything a normal visitor pays for is in this file: it wires up the hero
   button and nothing else. The simulation itself - physics, fragments,
   particles, the toolbar - lives in break-mode-engine.js and is fetched only
   when someone actually presses it.

   The button is authored in index.html rather than injected here, so it is
   part of the hero's composition and never pops in after paint. This file's
   only jobs are to remove it where Break Mode cannot run, and to load the
   engine on demand. If the engine fails to fetch, the button says so and the
   portfolio is untouched. */
(function () {
    'use strict';

    var VERSION = '20260829-2';

    var button = document.querySelector('[data-break-entry]');
    if (!button) return;

    /* No opted-in surfaces means nothing to break. */
    if (!document.querySelector('[data-break]')) {
        button.remove();
        return;
    }

    /* clip-path polygons cut the fragments, and dynamic import fetches the
       engine. Without either there is no Break Mode worth offering, so the
       button goes rather than sitting there doing nothing. */
    var supported = (function () {
        if (!window.CSS || !CSS.supports || !CSS.supports('clip-path', 'polygon(0 0, 1px 0, 0 1px)')) return false;
        try { new Function('return import("data:text/javascript,")'); } catch (err) { return false; }
        return true;
    })();
    if (!supported) {
        button.remove();
        return;
    }

    /* ===== LAZY ACTIVATION ===== */
    var engine = null;
    var loading = false;
    var label = button.querySelector('.pg-break-cta__full');
    var labelText = label ? label.textContent : '';

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
            if (label) label.textContent = 'Unavailable';
            /* One failure is enough; do not let it retry-loop on every click. */
            button.disabled = true;
        });
    });

    function start() {
        /* The hero is a destructible surface now, and the button sits inside it.
           Hiding it keeps the toolbar as the single set of controls while the
           mode is running, and stops it being struck by its own hammer. */
        button.hidden = true;
        engine.enter({
            onExit: function () {
                button.hidden = false;
                if (label) label.textContent = labelText;
                button.focus();
            }
        });
    }
})();
