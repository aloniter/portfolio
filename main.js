/* ===== SCROLL REVEAL ===== */
(function () {
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var revealEls = document.querySelectorAll('.reveal');

    if (reduced || !('IntersectionObserver' in window)) {
        revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08 });

        revealEls.forEach(function (el) { observer.observe(el); });
    }

    /* ===== NAV SCROLL STATE ===== */
    var nav = document.querySelector('.nav');
    if (nav) {
        var updateNav = function () {
            nav.classList.toggle('nav--scrolled', window.scrollY > 16);
        };
        updateNav();
        window.addEventListener('scroll', updateNav, { passive: true });
    }

    /* ===== AUTOPLAY VIDEOS =====
       Play only while on screen, and resume on the way back. The old version
       called play() once at load, so a clip that scrolled out of view stayed
       frozen when you scrolled back to it. */
    var videos = document.querySelectorAll('video[autoplay]');
    if (!videos.length) return;

    var safePlay = function (video) {
        var p = video.play();
        if (p && typeof p.catch === 'function') { p.catch(function () {}); }
    };

    videos.forEach(function (video) {
        video.muted = true;
        video.playsInline = true;
    });

    if (reduced) {
        videos.forEach(function (video) { video.pause(); video.removeAttribute('autoplay'); });
        return;
    }

    if (!('IntersectionObserver' in window)) {
        videos.forEach(safePlay);
        return;
    }

    var videoObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                safePlay(entry.target);
            } else {
                entry.target.pause();
            }
        });
    }, { threshold: 0.2 });

    videos.forEach(function (video) { videoObserver.observe(video); });
})();
