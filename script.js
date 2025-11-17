// One UI 8: Theme + Wallpaper + Premium Anims
document.addEventListener('DOMContentLoaded', () => {
    const homeScreen = document.getElementById('home-screen');
    const appScreens = document.querySelectorAll('.app-screen');
    const appIcons = document.querySelectorAll('.app-icon');
    const root = document.documentElement;
    const wallpaperOptions = document.querySelectorAll('.wallpaper-option');

    // Load saved
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedSpeed = localStorage.getItem('anim-speed') || 1;
    const savedEasing = localStorage.getItem('anim-easing') || 'elastic';
    const savedOneUI8 = localStorage.getItem('oneui8-mode') !== 'false';
    const savedWallpaper = localStorage.getItem('wallpaper') || 'default';
    root.style.setProperty('--anim-speed', savedSpeed);
    updateEasing(savedEasing);
    document.body.classList.toggle('dark-theme', savedTheme === 'dark');
    document.body.classList.toggle('oneui8-quick', savedOneUI8);
    document.getElementById('theme-toggle').checked = savedTheme === 'dark';
    document.getElementById('oneui8-mode').checked = savedOneUI8;
    applyWallpaper(savedWallpaper);

    // Open app
    appIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            const appId = icon.dataset.app;
            const targetApp = document.getElementById(`${appId}-app`);
            homeScreen.classList.remove('active');
            targetApp.classList.add('active');
        });
    });

    // Close app (add stagger class for icons)
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const appId = btn.dataset.close;
            const targetApp = document.getElementById(`${appId}-app`);
            targetApp.classList.add('closing');
            setTimeout(() => {
                targetApp.classList.remove('active', 'closing');
                homeScreen.classList.add('active', 'home-return'); // Trigger stagger
                setTimeout(() => homeScreen.classList.remove('home-return'), 600); // Clear after anim
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

    // Theme Toggle
    document.getElementById('theme-toggle').addEventListener('change', (e) => {
        document.body.classList.toggle('dark-theme', e.target.checked);
        localStorage.setItem('theme', e.target.checked ? 'dark' : 'light');
    });

    // Wallpaper Changer (in Gallery)
    wallpaperOptions.forEach(option => {
        option.addEventListener('click', () => {
            const wp = option.dataset.wallpaper;
            applyWallpaper(wp);
            localStorage.setItem('wallpaper', wp);
            // Smooth fade to home
            const currentApp = document.querySelector('.app-screen.active');
            currentApp.classList.add('closing');
            setTimeout(() => {
                currentApp.classList.remove('active', 'closing');
                homeScreen.classList.add('active');
            }, 300);
        });
    });

    function applyWallpaper(wp) {
        const styles = {
            'default': 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            'sunset': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
            'ocean': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            'night': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        };
        document.body.style.background = styles[wp] || styles['default'];
        document.body.style.transition = 'background 0.8s ease'; // Smooth change
    }

    // Other Tuning (Speed, Easing, One UI 8 Mode)
    const speedSelect = document.getElementById('anim-speed');
    const easingSelect = document.getElementById('anim-easing');
    const oneui8Toggle = document.getElementById('oneui8-mode');
    const quickDemo = document.getElementById('quick-demo');

    speedSelect.value = savedSpeed;
    speedSelect.addEventListener('change', (e) => { root.style.setProperty('--anim-speed', e.target.value); localStorage.setItem('anim-speed', e.target.value); });

    easingSelect.value = savedEasing;
    easingSelect.addEventListener('change', (e) => { updateEasing(e.target.value); localStorage.setItem('anim-easing', e.target.value); });

    oneui8Toggle.addEventListener('change', (e) => {
        document.body.classList.toggle('oneui8-quick', e.target.checked);
        localStorage.setItem('oneui8-mode', e.target.checked);
    });

    // Quick Demo (Staggered switches)
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
                if (i >= 5) {
                    clearInterval(interval);
                    setTimeout(() => {
                        nextApp.classList.add('closing');
                        setTimeout(() => {
                            nextApp.classList.remove('active', 'closing');
                            homeScreen.classList.add('active', 'home-return');
                            setTimeout(() => homeScreen.classList.remove('home-return'), 600);
                        }, 200);
                    }, 400);
                }
            }, 200);
        }, 250);
    });

    function updateEasing(style) {
        const easings = {
            standard: { open: 'cubic-bezier(0.25, 0.1, 0.25, 1)', close: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' },
            elastic: { open: 'cubic-bezier(0.4, 0, 1, 1)', close: 'cubic-bezier(0.25, 0.46, 0.45, 1.2)' },
            custom: { open: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', close: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' }
        };
        const easing = easings[style];
        root.style.setProperty('--anim-easing-open', easing.open);
        root.style.setProperty('--anim-easing-close', easing.close);
    }

    // Orientation
    function handleOrientation() { document.body.classList.toggle('landscape', window.innerWidth > window.innerHeight); }
    window.addEventListener('resize', handleOrientation);
    handleOrientation();
});
