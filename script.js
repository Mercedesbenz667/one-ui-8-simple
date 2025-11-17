// One UI 8: Lag-Free RAF + 120Hz + Advanced Swipes
document.addEventListener('DOMContentLoaded', () => {
    const homeScreen = document.getElementById('home-screen');
    const appScreens = document.querySelectorAll('.app-screen');
    const appIcons = document.querySelectorAll('.app-icon');
    const root = document.documentElement;
    const wallpaperOptions = document.querySelectorAll('.wallpaper-option');
    let currentAppIndex = 0; // For swipe cycling
    const apps = ['camera', 'gallery', 'music', 'settings', 'phone', 'messages']; // Cycle order

    // Detect Refresh Rate & Scale Anims (120Hz+ = faster)
    let refreshRate = 60;
    if (screen.availFrequency) refreshRate = screen.availFrequency; // Modern API
    else if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) refreshRate = 120; // Assume high
    const rateMultiplier = refreshRate / 60; // 2x for 120Hz
    root.style.setProperty('--anim-speed', Math.min(2, parseFloat(getComputedStyle(root).getPropertyValue('--anim-speed')) * rateMultiplier));

    // Load saved
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedSpeed = localStorage.getItem('anim-speed') || 1;
    const savedEasing = localStorage.getItem('anim-easing') || 'elastic';
    const savedOneUI8 = localStorage.getItem('oneui8-mode') !== 'false';
    const savedWallpaper = localStorage.getItem('wallpaper') || 'default';
    root.style.setProperty('--anim-speed', savedSpeed * rateMultiplier);
    updateEasing(savedEasing);
    document.body.classList.toggle('dark-theme', savedTheme === 'dark');
    document.body.classList.toggle('oneui8-quick', savedOneUI8);
    document.getElementById('theme-toggle').checked = savedTheme === 'dark';
    document.getElementById('oneui8-mode').checked = savedOneUI8;
    applyWallpaper(savedWallpaper);

    // RAF for Lag-Free Updates (No DOM thrash)
    function rafUpdate(fn) {
        if (!window.requestAnimationFrame) return fn();
        function loop() {
            const again = fn();
            if (again !== false) requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    }

    // Open app (optimized)
    appIcons.forEach((icon, idx) => {
        icon.addEventListener('click', () => {
            currentAppIndex = idx;
            const appId = icon.dataset.app;
            const targetApp = document.getElementById(`${appId}-app`);
            rafUpdate(() => {
                homeScreen.classList.remove('active');
                targetApp.classList.add('active');
                return false; // One-shot
            });
        });
    });

    // Close app (with stagger)
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const appId = btn.dataset.close;
            const targetApp = document.getElementById(`${appId}-app`);
            rafUpdate(() => {
                targetApp.classList.add('closing');
                return true; // Continue to timeout
            });
            setTimeout(() => {
                rafUpdate(() => {
                    targetApp.classList.remove('active', 'closing');
                    homeScreen.classList.add('active', 'home-return');
                    return false;
                });
                setTimeout(() => rafUpdate(() => { homeScreen.classList.remove('home-return'); return false; }), 600);
            }, (parseFloat(getComputedStyle(root).getPropertyValue('--anim-duration-close')) / parseFloat(getComputedStyle(root).getPropertyValue('--anim-speed'))) * 1000 + 50);
        });
    });

    // Scroll lock (RAF-optimized)
    appScreens.forEach(screen => {
        screen.addEventListener('transitionstart', () => {
            if (screen.classList.contains('active')) {
                rafUpdate(() => {
                    document.body.style.overflow = 'hidden';
                    document.body.style.position = 'fixed';
                    document.body.style.width = '100%';
                    return false;
                });
            }
        });
        screen.addEventListener('transitionend', () => {
            if (!screen.classList.contains('active')) {
                rafUpdate(() => {
                    document.body.style.overflow = 'auto';
                    document.body.style.position = 'static';
                    document.body.style.width = 'auto';
                    return false;
                });
            }
        });
    });

    // Swipe Gestures (Better: Momentum + Thresholds)
    let startX, startY, currentX, currentY, isSwiping = false, swipeDir = '';
    const minSwipe = 50; // Threshold

    function handleTouchStart(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isSwiping = true;
        document.body.classList.add('swiping');
        rafUpdate(() => { root.style.setProperty('--swipe-delta', '0px'); return true; });
    }

    function handleTouchMove(e) {
        if (!isSwiping) return;
        currentX = e.touches[0].clientX;
        currentY = e.touches[0].clientY;
        const deltaX = currentX - startX;
        const deltaY = currentY - startY;
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (absX > absY && absX > minSwipe) { // Horizontal swipe (app switch)
            swipeDir = deltaX > 0 ? 'right' : 'left';
            document.body.classList.add('swiping');
            document.body.classList.remove('swiping-down');
            root.style.setProperty('--swipe-delta', `${deltaX}px`);
            root.style.setProperty('--swipe-opacity', Math.max(0.5, 1 - absX / window.innerWidth));
        } else if (absY > absX && absY > minSwipe && currentY < 100) { // Vertical down from top (close)
            swipeDir = 'down';
            document.body.classList.add('swiping-down');
            document.body.classList.remove('swiping');
            root.style.setProperty('--swipe-delta-y', `${deltaY}px`);
            root.style.setProperty('--swipe-opacity', Math.max(0.3, 1 - absY / 300));
        }
    }

    function handleTouchEnd() {
        if (!isSwiping) return;
        isSwiping = false;
        document.body.classList.remove('swiping', 'swiping-down');

        const deltaX = currentX - startX;
        const deltaY = currentY - startY;
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        rafUpdate(() => {
            root.style.setProperty('--swipe-delta', '0px');
            root.style.setProperty('--swipe-delta-y', '0px');
            root.style.setProperty('--swipe-opacity', '1');
            return true;
        });

        if (swipeDir === 'left' && absX > minSwipe) { // Swipe left: Next app
            currentAppIndex = (currentAppIndex + 1) % apps.length;
            switchApp(apps[currentAppIndex]);
        } else if (swipeDir === 'right' && absX > minSwipe) { // Swipe right: Prev app
            currentAppIndex = (currentAppIndex - 1 + apps.length) % apps.length;
            switchApp(apps[currentAppIndex]);
        } else if (swipeDir === 'down' && absY > minSwipe) { // Swipe down: Close to home
            const activeApp = document.querySelector('.app-screen.active');
            if (activeApp) {
                activeApp.classList.add('closing');
                setTimeout(() => {
                    activeApp.classList.remove('active', 'closing');
                    homeScreen.classList.add('active', 'home-return');
                    setTimeout(() => homeScreen.classList.remove('home-return'), 600);
                }, 200);
            }
        }
        swipeDir = '';
    }

    function switchApp(appId) {
        const targetApp = document.getElementById(`${appId}-app`);
        const activeApp = document.querySelector('.app-screen.active');
        rafUpdate(() => {
            if (activeApp) activeApp.classList.remove('active');
            homeScreen.classList.remove('active');
            targetApp.classList.add('active');
            return false;
        });
    }

    // Attach Gestures to Screens
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false }); // Prevent scroll during swipe
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Theme Toggle
    document.getElementById('theme-toggle').addEventListener('change', (e) => {
        document.body.classList.toggle('dark-theme', e.target.checked);
        localStorage.setItem('theme', e.target.checked ? 'dark' : 'light');
    });

    // Wallpaper Changer
    wallpaperOptions.forEach(option => {
        option.addEventListener('click', () => {
            const wp = option.dataset.wallpaper;
            applyWallpaper(wp);
            localStorage.setItem('wallpaper', wp);
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
        rafUpdate(() => {
            document.body.style.background = styles[wp] || styles['default'];
            return false;
        });
    }

    // Other Tuning
    const speedSelect = document.getElementById('anim-speed');
    const easingSelect = document.getElementById('anim-easing');
    const oneui8Toggle = document.getElementById('oneui8-mode');
    const quickDemo = document.getElementById('quick-demo');

    speedSelect.value = savedSpeed;
    speedSelect.addEventListener('change', (e) => { 
        root.style.setProperty('--anim-speed', parseFloat(e.target.value) * rateMultiplier); 
        localStorage.setItem('anim-speed', e.target.value); 
    });

    easingSelect.value = savedEasing;
    easingSelect.addEventListener('change', (e) => { updateEasing(e.target.value); localStorage.setItem('anim-easing', e.target.value); });

    oneui8Toggle.addEventListener('change', (e) => {
        document.body.classList.toggle('oneui8-quick', e.target.checked);
        localStorage.setItem('oneui8-mode', e.target.checked);
    });

    quickDemo.addEventListener('click', () => {
        const demoApps = ['camera', 'gallery', 'music'];
        let i = 0;
        const interval = setInterval(() => {
            const currentApp = document.querySelector('.app-screen.active');
            if (currentApp) currentApp.classList.add('closing');
            setTimeout(() => {
                if (currentApp) currentApp.classList.remove('active', 'closing');
                const nextAppId = demoApps[i % demoApps.length];
                switchApp(nextAppId);
                i++;
                if (i >= 5) {
                    clearInterval(interval);
                    setTimeout(() => {
                        const lastApp = document.getElementById(`${demoApps[(i-1) % demoApps.length]}-app`);
                        lastApp.classList.add('closing');
                        setTimeout(() => {
                            lastApp.classList.remove('active', 'closing');
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
