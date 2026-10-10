(() => {
    'use strict';
    document.querySelectorAll('.catalog-section').forEach(section => {
        const track = section.querySelector('.catalog-track');
        const controls = section.querySelector('.catalog-scroll-controls');
        const previous = controls.querySelector('[data-scroll-direction="-1"]');
        const next = controls.querySelector('[data-scroll-direction="1"]');

        function update() {
            const max = track.scrollWidth - track.clientWidth;
            controls.hidden = max <= 1;
            previous.disabled = track.scrollLeft <= 1;
            next.disabled = track.scrollLeft >= max - 1;
        }
        function labels() {
            const zh = window.SiteUI.getLanguage() === 'zh';
            previous.setAttribute('aria-label', zh ? '向左滚动' : 'Scroll left');
            next.setAttribute('aria-label', zh ? '向右滚动' : 'Scroll right');
        }
        function scroll(direction) {
            const card = track.querySelector('.catalog-card');
            if (!card) return;
            const step = card.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0);
            track.scrollBy({ left: direction * step, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
        }
        previous.addEventListener('click', () => scroll(-1));
        next.addEventListener('click', () => scroll(1));
        track.addEventListener('scroll', update, { passive: true });
        track.addEventListener('keydown', event => {
            // Links keep their native keyboard behavior; the track itself is navigable.
            if (event.target !== track) return;
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault();
                scroll(event.key === 'ArrowLeft' ? -1 : 1);
            }
        });
        if ('ResizeObserver' in window) new ResizeObserver(update).observe(track);
        else window.addEventListener('resize', update);
        document.addEventListener('site:languagechange', labels);
        update();
        labels();
    });
})();
