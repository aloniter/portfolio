/* ===== SCROLL REVEAL ===== */
(function () {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Reveal elements on scroll
    const revealEls = document.querySelectorAll('.reveal');

    if (reduced) {
        revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        revealEls.forEach(function (el) { observer.observe(el); });
    }

    /* ===== NAV SCROLL STATE ===== */
    var nav = document.querySelector('.nav');
    if (nav) {
        function updateNav() {
            if (window.scrollY > 20) {
                nav.classList.add('nav--scrolled');
            } else {
                nav.classList.remove('nav--scrolled');
            }
        }
        updateNav();
        window.addEventListener('scroll', updateNav, { passive: true });
    }
})();
