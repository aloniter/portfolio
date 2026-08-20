(function () {
    'use strict';

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var hasIO = 'IntersectionObserver' in window;

    /* ===== SCROLL REVEAL ===== */
    (function () {
        var revealEls = document.querySelectorAll('.reveal');
        if (!revealEls.length) return;

        if (reduced || !hasIO) {
            Array.prototype.forEach.call(revealEls, function (el) { el.classList.add('is-visible'); });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08 });

        Array.prototype.forEach.call(revealEls, function (el) { observer.observe(el); });
    })();

    /* ===== NAV SCROLL STATE ===== */
    (function () {
        var nav = document.querySelector('.nav');
        if (!nav) return;
        var update = function () { nav.classList.toggle('nav--scrolled', window.scrollY > 16); };
        update();
        window.addEventListener('scroll', update, { passive: true });
    })();

    /* ===== IN-VIEW VIDEO =====
       A clip plays only while it is meaningfully on screen and pauses the moment
       it is not, so no more than one decode is ever running. Everything here
       degrades to the poster frame: no JS, no IntersectionObserver, a blocked
       autoplay promise and a failed decode all end up showing the still. */
    (function () {
        var videos = Array.prototype.slice.call(document.querySelectorAll('video[autoplay], video[data-autoplay]'));
        if (!videos.length) return;

        /* Autoplay is only permitted for muted inline video, and the attributes
           alone are not enough on iOS: the properties have to be set too. */
        videos.forEach(function (video) {
            video.muted = true;
            video.defaultMuted = true;
            video.playsInline = true;
            video.setAttribute('muted', '');
            video.setAttribute('playsinline', '');
            video.addEventListener('error', function () { fallback(video); });
            var sources = video.querySelectorAll('source');
            Array.prototype.forEach.call(sources, function (source) {
                source.addEventListener('error', function () { fallback(video); });
            });
        });

        /* Replace a video that cannot play with its own poster, so a broken or
           unsupported source never leaves a black rectangle in the layout. */
        function fallback(video) {
            if (video.dataset.failed === '1') return;
            video.dataset.failed = '1';
            var poster = video.getAttribute('poster');
            if (!poster || !video.parentNode) return;
            var img = document.createElement('img');
            img.src = poster;
            img.className = video.className;
            img.alt = video.getAttribute('aria-label') || '';
            video.parentNode.replaceChild(img, video);
            var i = videos.indexOf(video);
            if (i > -1) videos.splice(i, 1);
        }

        function safePlay(video) {
            if (video.dataset.failed === '1' || document.hidden) return;
            var promise;
            try {
                promise = video.play();
            } catch (err) {
                return; /* poster stays visible */
            }
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () { /* autoplay blocked: poster stays visible */ });
            }
        }

        function safePause(video) {
            if (video.dataset.failed === '1') return;
            try { video.pause(); } catch (err) { /* nothing useful to do */ }
        }

        if (reduced) {
            videos.forEach(function (video) {
                video.removeAttribute('autoplay');
                safePause(video);
            });
            return;
        }

        if (!hasIO) {
            videos.forEach(safePlay);
            return;
        }

        /* "Meaningfully in viewport" has to hold for a 300px clip on a desktop
           screen and for a clip taller than a phone screen, where the ratio of
           the element can never reach a high threshold. Either the element is
           mostly visible, or it is filling a good part of the viewport. */
        var RATIO = 0.4;
        var VIEWPORT_SHARE = 0.35;

        function isMeaningful(entry) {
            if (!entry.isIntersecting) return false;
            if (entry.intersectionRatio >= RATIO) return true;
            var rect = entry.intersectionRect;
            var viewport = (entry.rootBounds && entry.rootBounds.height) || window.innerHeight;
            return viewport > 0 && rect.height / viewport >= VIEWPORT_SHARE;
        }

        var thresholds = [];
        for (var i = 0; i <= 20; i++) { thresholds.push(i / 20); }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                var video = entry.target;
                if (isMeaningful(entry)) {
                    video.dataset.inview = '1';
                    safePlay(video);
                } else {
                    delete video.dataset.inview;
                    safePause(video);
                }
            });
        }, { threshold: thresholds });

        videos.forEach(function (video) { observer.observe(video); });

        /* Background tabs and bfcache restores: never leave a clip running out
           of sight, and pick the visible one back up on return. */
        function syncVisibility() {
            videos.forEach(function (video) {
                if (document.hidden) {
                    safePause(video);
                } else if (video.dataset.inview === '1') {
                    safePlay(video);
                }
            });
        }

        document.addEventListener('visibilitychange', syncVisibility);
        window.addEventListener('pageshow', syncVisibility);
    })();

    /* ===== PRODUCT GLASS =====
       Four behaviours for the redesigned sections, all progressive enhancement:
       the page is complete and readable without any of them.

         - scroll parallax on the hero pillars and the BlockQuest stage
         - toolbar tint while the dark stage passes behind the bar
         - hero pointer depth: two product planes answering the pointer
         - the Inspectley segmented control

       Parallax and pointer depth share one rAF-throttled loop and one offset
       per element, because they write the same `translate` property. `translate`
       is used rather than `transform` so it composes with the rotation each
       element already carries instead of overwriting it. */
    (function () {
        var bar = document.querySelector('[data-glassbar]');
        var stage = document.querySelector('[data-darkstage]');
        var parallax = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
        if (!bar && !stage && !parallax.length) return;

        var coarse = window.matchMedia('(pointer: coarse)').matches;
        var narrow = window.matchMedia('(max-width: 860px)');
        var canTranslate = typeof CSS !== 'undefined' && CSS.supports && CSS.supports('translate', '1px 1px');
        var canParallax = !reduced && canTranslate && parallax.length > 0;
        var raf = null;
        var wasDark = null;

        /* The mobile layout is art-directed with its own, gentler factors, and
           the two BlockQuest flankers do not move there at all. */
        function factorFor(el) {
            if (narrow.matches && el.hasAttribute('data-parallax-m')) {
                return parseFloat(el.getAttribute('data-parallax-m')) || 0;
            }
            return parseFloat(el.getAttribute('data-parallax')) || 0;
        }

        function tick() {
            raf = null;

            if (canParallax) {
                var vh = window.innerHeight;
                for (var i = 0; i < parallax.length; i++) {
                    var el = parallax[i];
                    var factor = factorFor(el);
                    var rect = el.getBoundingClientRect();
                    var fromCentre = rect.top + rect.height / 2 - vh / 2;
                    var offset = el.pgOffset || { x: 0, y: 0 };
                    el.style.translate = offset.x.toFixed(1) + 'px ' + (fromCentre * factor + offset.y).toFixed(1) + 'px';
                }
            }

            /* Dark while the stage covers the middle of the bar. Written only on
               the flip, so a scroll that changes nothing costs one comparison. */
            if (bar && stage) {
                var br = bar.getBoundingClientRect();
                var sr = stage.getBoundingClientRect();
                var isDark = sr.top < br.top + br.height * 0.45 && sr.bottom > br.top + br.height * 0.55;
                if (isDark !== wasDark) {
                    wasDark = isDark;
                    if (isDark) { bar.classList.add('is-dark'); } else { bar.classList.remove('is-dark'); }
                }
            }
        }

        function schedule() {
            if (!raf) raf = requestAnimationFrame(tick);
        }

        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule, { passive: true });
        tick();

        /* Signature hero interaction: the two pillars ride opposing depth planes
           while the type plane and both glass labels stay put, so each label's
           fill shifts as different artwork slides underneath it. */
        (function () {
            var hero = document.querySelector('.pg-hero');
            var a = document.querySelector('[data-pillar="a"]');
            var b = document.querySelector('[data-pillar="b"]');
            if (!hero || !a || !b || reduced || coarse || !canTranslate) return;

            a.style.transition = 'translate 0.6s cubic-bezier(0.22,0.61,0.36,1)';
            b.style.transition = 'translate 0.6s cubic-bezier(0.22,0.61,0.36,1)';

            hero.addEventListener('pointermove', function (event) {
                var rect = hero.getBoundingClientRect();
                if (!rect.width || !rect.height) return;
                var nx = (event.clientX - rect.left) / rect.width - 0.5;
                var ny = (event.clientY - rect.top) / rect.height - 0.5;
                a.pgOffset = { x: nx * -14, y: ny * -9 };
                b.pgOffset = { x: nx * 16, y: ny * 11 };
                schedule();
            }, { passive: true });

            hero.addEventListener('pointerleave', function () {
                a.pgOffset = { x: 0, y: 0 };
                b.pgOffset = { x: 0, y: 0 };
                schedule();
            }, { passive: true });
        })();

        /* Specular highlight follows the pointer across the toolbar cluster.
           Only the gradient's x-position changes, via a custom property. */
        (function () {
            var cluster = document.querySelector('[data-specbar]');
            var spec = document.querySelector('[data-spec]');
            if (!cluster || !spec || coarse) return;

            window.addEventListener('pointermove', function (event) {
                var rect = cluster.getBoundingClientRect();
                if (!rect.width) return;
                var x = ((event.clientX - rect.left) / rect.width) * 100;
                if (x < -20) x = -20;
                if (x > 120) x = 120;
                spec.style.setProperty('--pg-spec-x', x.toFixed(1) + '%');
            }, { passive: true });
        })();
    })();

    /* ===== INSPECTLEY SCREEN SWITCH =====
       Crossfade between three screens of the same app, with the caption reading
       off the same state. Without JS the default screen is the one already
       marked in the markup, so the section still shows a real product. */
    (function () {
        var segments = Array.prototype.slice.call(document.querySelectorAll('[data-seg]'));
        var shots = Array.prototype.slice.call(document.querySelectorAll('[data-shot]'));
        var caption = document.querySelector('[data-shotcaption]');
        if (!segments.length || !shots.length) return;

        var captions = {
            capture: 'Every photo attached to a finding',
            annotate: 'Real finding, circled on site',
            export: '108 findings, one pass'
        };

        function select(name) {
            shots.forEach(function (shot) {
                shot.classList.toggle('is-on', shot.getAttribute('data-shot') === name);
            });
            segments.forEach(function (button) {
                var on = button.getAttribute('data-seg') === name;
                button.classList.toggle('is-on', on);
                button.setAttribute('aria-pressed', on ? 'true' : 'false');
            });
            if (caption && captions[name]) caption.textContent = captions[name];
        }

        segments.forEach(function (button) {
            button.addEventListener('click', function () {
                var name = button.getAttribute('data-seg');
                var run = function () { select(name); };

                if (reduced || typeof document.startViewTransition !== 'function') {
                    run();
                    return;
                }

                /* A view transition that gets skipped before its update callback
                   runs - a second click mid-transition, the tab losing its
                   renderer - never calls the callback at all, which would drop
                   the switch on the floor. Re-run it if that happens, and
                   swallow the abort so it does not surface as an unhandled
                   rejection. select() is idempotent, so a double call is safe. */
                var transition;
                try {
                    transition = document.startViewTransition(run);
                } catch (err) {
                    run();
                    return;
                }
                if (transition.updateCallbackDone) {
                    transition.updateCallbackDone.catch(run);
                }
                if (transition.finished) {
                    transition.finished.catch(function () { /* skipped, nothing to do */ });
                }
            });
        });
    })();
})();
