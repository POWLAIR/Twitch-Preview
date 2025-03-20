import { notificationManager } from '../utils/notifications.js';

// ... existing code ...

async function initializeNotificationSettings() {
    const enableNotifications = document.getElementById('enableNotifications');
    const favoritesOnlyNotifications = document.getElementById('favoritesOnlyNotifications');

    // Charger les préférences
    const { notificationPreferences } = await browser.storage.local.get('notificationPreferences');
    
    if (notificationPreferences) {
        enableNotifications.checked = notificationPreferences.enabled;
        favoritesOnlyNotifications.checked = notificationPreferences.favoritesOnly;
    }

    // Gérer les changements
    enableNotifications.addEventListener('change', async (e) => {
        await notificationManager.updatePreferences({
            enabled: e.target.checked
        });
    });

    favoritesOnlyNotifications.addEventListener('change', async (e) => {
        await notificationManager.updatePreferences({
            favoritesOnly: e.target.checked
        });
    });
}

// Ajouter à l'initialisation
document.addEventListener('DOMContentLoaded', () => {
    // ... existing code ...
    initializeNotificationSettings();
}); 