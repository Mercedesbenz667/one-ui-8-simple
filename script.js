// One UI 8 Smooth App Open/Close + Tuning
document.addEventListener('DOMContentLoaded', () => {
    const homeScreen = document.getElementById('home-screen');
    const appScreens = document.querySelectorAll('.app-screen');
    const appIcons = document.querySelectorAll('.app-icon');
    const root = document.documentElement;

    // Load saved tuning
    const savedSpeed = localStorage.getItem('anim-speed') || 1;
    const savedEasing = localStorage.getItem('anim-easing') || 'elastic';
    root.style.setProperty('--anim-speed', savedSpeed);
    updateEasing(savedEasing);

    // Open app
    appIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            const appId = icon.dataset.app;
            const targetApp = document.getElementById(`${appId}-app`);
            homeScreen.classList.remove('active');
            targetApp.classList.add('active');
        });
    });

    // Close app
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const appId = btn.dataset.close;
            const targetApp = document.getElementById(`${appId}-app`);
            targetApp.classList.add('closing');
            setTimeout(() => {
                targetApp.classList.remove('active', 'closing');
                homeScreen.classList.add('active');
            }, parseFloat(root.style.getPropertyValue('--anim-duration-close')) * 1000 * parseFloat(root.style.getPropertyValue('--anim-speed')) + 50);
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

    // Tuning Controls
    const speedSelect = document.getElementById('anim-speed');
    const easingSelect = document.getElementById('anim-easing');

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

    function updateEasing(style) {
        let openEasing, closeEasing;
        switch (style) {
            case 'standard': // One UI 7
                openEasing = 'cubic-bezier(0.25, 0.1, 0.25, 1)';
                closeEasing = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                break;
            case 'elastic': // One UI 8
                openEasing = 'cubic-bezier(0.4, 0, 0.2, 1)';
                closeEasing = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
                break;
            case 'custom':
                openEasing = 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'; // Bouncy
                closeEasing = 'cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                break;
        }
        root.style.setProperty('--anim-easing-open', openEasing);
        root.style.setProperty('--anim-easing-close', closeEasing);
    }

    // Orientation
    function handleOrientation() {
        if (window.innerWidth > window.innerHeight) {
            document.body.classList.add('landscape');
        } else {
            document.body.classList.remove('landscape');
        }
    }
    window.addEventListener('resize', handleOrientation);
    handleOrientation();
});
