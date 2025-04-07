import { notificationManager } from '../utils/notifications.js';

// Fonction pour afficher un message de confirmation avec animation
function showSaveMessage() {
    const message = document.createElement('div');
    message.className = 'save-message';
    message.textContent = 'Préférences sauvegardées';
    document.body.appendChild(message);

    // Animation d'entrée
    requestAnimationFrame(() => {
        message.style.transform = 'translateX(0)';
        message.style.opacity = '1';
    });

    // Animation de sortie
    setTimeout(() => {
        message.style.transform = 'translateX(100%)';
        message.style.opacity = '0';
        setTimeout(() => message.remove(), 300);
    }, 2000);
}

// Fonction pour ajouter une animation de transition aux éléments
function addTransitionEffect(element) {
    element.style.transition = 'all 0.2s ease';
}

// Fonction pour initialiser les tooltips
function initializeTooltips() {
    const tooltips = document.querySelectorAll('.tooltip');
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('mouseenter', () => {
            tooltip.querySelector('.tooltip-text').style.visibility = 'visible';
            tooltip.querySelector('.tooltip-text').style.opacity = '1';
        });

        tooltip.addEventListener('mouseleave', () => {
            tooltip.querySelector('.tooltip-text').style.visibility = 'hidden';
            tooltip.querySelector('.tooltip-text').style.opacity = '0';
        });
    });
}

async function initializeNotificationSettings() {
    const enableNotifications = document.getElementById('enableNotifications');
    const favoritesOnlyNotifications = document.getElementById('favoritesOnlyNotifications');

    // Ajouter des effets de transition
    addTransitionEffect(enableNotifications);
    addTransitionEffect(favoritesOnlyNotifications);

    // Charger les préférences
    const { notificationPreferences } = await browser.storage.local.get('notificationPreferences');

    if (notificationPreferences) {
        enableNotifications.checked = notificationPreferences.enabled;
        favoritesOnlyNotifications.checked = notificationPreferences.favoritesOnly;
    }

    // Gérer les changements avec animation
    enableNotifications.addEventListener('change', async (e) => {
        const checkbox = e.target;
        checkbox.style.transform = 'scale(0.95)';
        setTimeout(() => checkbox.style.transform = 'scale(1)', 100);

        await notificationManager.updatePreferences({
            enabled: checkbox.checked
        });
        showSaveMessage();
    });

    favoritesOnlyNotifications.addEventListener('change', async (e) => {
        const checkbox = e.target;
        checkbox.style.transform = 'scale(0.95)';
        setTimeout(() => checkbox.style.transform = 'scale(1)', 100);

        await notificationManager.updatePreferences({
            favoritesOnly: checkbox.checked
        });
        showSaveMessage();
    });
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initializeNotificationSettings();
    initializeTooltips();
}); 