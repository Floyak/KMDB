(() => {
    const panel = document.getElementById('homeHeroContent');
    const toggle = document.getElementById('homeHeroToggle');
    const hero = document.querySelector('.homeHero');
    const video = document.querySelector('.homeHeroVideo');

    if (!panel || !toggle) {
        return;
    }

    const storageKey = 'homeHeroPanelCollapsed';
    const collapseArrow = '\u2199';
    const expandArrow = '\u2197';

    const applyState = (collapsed) => {
        panel.classList.toggle('is-collapsed', collapsed);
        toggle.textContent = collapsed ? expandArrow : collapseArrow;
        toggle.setAttribute('aria-expanded', String(!collapsed));
        toggle.setAttribute(
            'aria-label',
            collapsed ? 'Відкрити інформаційний блок' : 'Сховати інформаційний блок'
        );
    };

    applyState(localStorage.getItem(storageKey) === 'true');

    toggle.addEventListener('click', () => {
        const nextState = !panel.classList.contains('is-collapsed');
        applyState(nextState);
        localStorage.setItem(storageKey, String(nextState));
    });

    if (hero && video) {
        const syncHeroRatio = () => {
            if (video.videoWidth && video.videoHeight) {
                hero.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
            }
        };

        if (video.readyState >= 1) {
            syncHeroRatio();
        } else {
            video.addEventListener('loadedmetadata', syncHeroRatio, { once: true });
        }
    }
})();
