// One UI 8 Smooth App Open/Close Logic
document.addEventListener('DOMContentLoaded', () => {
    const homeScreen = document.getElementById('home-screen');
    const appScreens = document.querySelectorAll('.app-screen');
    const appIcons = document.querySelectorAll('.app-icon');

    // Open app from icon click
    appIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            const appId = icon.dataset.app;
            const targetApp = document.getElementById(`${appId}-app`);

            // Hide home, show app with animation
            homeScreen.classList.remove('active');
            targetApp.classList.add('active');

            // Optional: Store icon position for more advanced "morph" animation (using getBoundingClientRect)
            const iconRect = icon.getBoundingClientRect();
            console.log(`Opening ${appId} from position:`, iconRect); // For future enhancements
        });
    });

    // Close app with back button
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const appId = btn.dataset.close;
            const targetApp = document.getElementById(`${appId}-app`);

            // Trigger close animation, then reset
            targetApp.classList.add('closing');
            setTimeout(() => {
                targetApp.classList.remove('active', 'closing');
                homeScreen.classList.add('active');
            }, 350); // Match close animation duration (0.35s)
        });
    });

    // Prevent body scroll on app open (mobile-friendly)
    appScreens.forEach(screen => {
        screen.addEventListener('transitionstart', () => {
            if (screen.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
                document.body.style.position = 'fixed'; // iOS anti-bounce
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

    // Phone Enhancements: Landscape Detection & Scroll Lock
    function handleOrientation() {
        if (window.innerWidth > window.innerHeight) {
            document.body.classList.add('landscape');
        } else {
            document.body.classList.remove('landscape');
        }
    }

    window.addEventListener('resize', handleOrientation);
    handleOrientation(); // Initial check
});
