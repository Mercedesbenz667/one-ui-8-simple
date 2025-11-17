// One UI 8 Enhanced: TikTok Animations + Weather
document.addEventListener('DOMContentLoaded', () => {
    const homeScreen = document.getElementById('home-screen');
    const appScreens = document.querySelectorAll('.app-screen');
    const appIcons = document.querySelectorAll('.app-icon');
    const root = document.documentElement;

    // Load saved settings
    const savedSpeed = localStorage.getItem('anim-speed') || 1;
    const savedEasing = localStorage.getItem('anim-easing') || 'elastic';
    const savedOneUI8 = localStorage.getItem('oneui8-mode') !== 'false';
    root.style.setProperty('--anim-speed', savedSpeed);
    updateEasing(savedEasing);
    document.getElementById('oneui8-mode').checked = savedOneUI8;
    if (savedOneUI8) document.body.classList.add('oneui8-quick');

    // Open app (smooth, like video)
    appIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            const appId = icon.dataset.app;
            const targetApp = document.getElementById(`${appId}-app`);
            homeScreen.classList.remove('active');
            targetApp.classList.add('active');
        });
    });

    // Close app (bouncy close)
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const appId = btn.dataset.close;
            const targetApp = document.getElementById(`${appId}-app`);
            targetApp.classList.add('closing');
            setTimeout(() => {
                targetApp.classList.remove('active', 'closing');
                homeScreen.classList.add('active');
            }, (parseFloat(getComputedStyle(root).getPropertyValue('--anim-duration-close')) / parseFloat(getComputedStyle(root).getPropertyValue('--anim-speed'))) * 1000 + 50);
        });
    });

    // Scroll lock
    appScreens.forEach(screen => {
        screen.addEventListener('transitionstart', () => {
            if (screen.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
                document.body.style.position = 'fixed';
                document.body.style.width = '100%';
            }
        });
        screen.addEventListener('transitionend', () => {
            if (!screen.classList.contains('active')) {
                document.body.style.overflow = 'auto';
                document.body.style.position = 'static';
                document.body.style.width = 'auto';
            }
        });
    });

    // Tuning
    const speedSelect = document.getElementById('anim-speed');
    const easingSelect = document.getElementById('anim-easing');
    const oneui8Toggle = document.getElementById('oneui8-mode');
    const quickDemo = document.getElementById('quick-demo');

    speedSelect.value = savedSpeed;
    speedSelect.addEventListener('change', (e) => {
        root.style.setProperty('--anim-speed', e.target.value);
        localStorage.setItem('anim-speed', e.target.value);
    });

    easingSelect.value = savedEasing;
    easingSelect.addEventListener('change', (e) => {
        updateEasing(e.target.value);
        localStorage.setItem('anim-easing', e.target.value);
    });

    oneui8Toggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.body.classList.add('oneui8-quick');
            localStorage.setItem('oneui8-mode', 'true');
        } else {
            document.body.classList.remove('oneui8-quick');
            localStorage.setItem('oneui8-mode', 'false');
        }
    });

    // Quick Switch Demo (Rapid open/close like TikTok video)
    quickDemo.addEventListener('click', () => {
        const apps = ['camera', 'gallery', 'music'];
        let i = 0;
        const interval = setInterval(() => {
            const currentApp = document.querySelector('.app-screen.active');
            if (currentApp) currentApp.classList.add('closing');
            setTimeout(() => {
                if (currentApp) currentApp.classList.remove('active', 'closing');
                const nextAppId = apps[i % apps.length];
                const nextApp = document.getElementById(`${nextAppId}-app`);
                homeScreen.classList.remove('active');
                nextApp.classList.add('active');
                i++;
                if (i >= 6) { // 6 quick switches
                    clearInterval(interval);
                    setTimeout(() => {
                        nextApp.classList.add('closing');
                        setTimeout(() => {
                            nextApp.classList.remove('active', 'closing');
                            homeScreen.classList.add('active');
                        }, 250);
                    }, 500);
                }
            }, 250);
        }, 300); // ~0.3s per switch for smoothness
    });

    function updateEasing(style) {
        let openEasing, closeEasing;
        switch (style) {
            case 'standard': openEasing = 'cubic-bezier(0.25, 0.1, 0.25, 1)'; closeEasing = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'; break;
            case 'elastic': openEasing = 'cubic-bezier(0.4, 0, 0.2, 1)'; closeEasing = 'cubic-bezier(0.34, 1.56, 0.64, 1)'; break;
            case 'custom': openEasing = 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'; closeEasing = 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'; break;
        }
        root.style.setProperty('--anim-easing-open', openEasing);
        root.style.setProperty('--anim-easing-close', closeEasing);
    }

    // Orientation
    function handleOrientation() {
        document.body.classList.toggle('landscape', window.innerWidth > window.innerHeight);
    }
    window.addEventListener('resize', handleOrientation);
    handleOrientation();
});
