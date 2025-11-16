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
            }, 300); // Match close animation duration
        });
    });

    // Prevent body scroll on app open (mobile-friendly)
    appScreens.forEach(screen => {
        screen.addEventListener('transitionstart', () => {
            if (screen.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            }
        });
        screen.addEventListener('transitionend', () => {
            if (!screen.classList.contains('active')) {
                document.body.style.overflow = 'auto';
            }
        });
    });
});
