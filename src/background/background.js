import { TwitchAuth } from './auth.js';
import { getFollowedChannels, getFollowedStreams } from '../api/twitch.js';
import { notificationManager } from '../utils/notifications.js';

// Initialisation de l'authentification
const auth = new TwitchAuth();

// Initialiser le gestionnaire de notifications
notificationManager.initialize();

// Créer une alarme pour vérifier les nouveaux streams
browser.alarms.create('checkNewStreams', {
    periodInMinutes: 1
});

// Écouter l'alarme
browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'checkNewStreams') {
        notificationManager.checkNewStreams();
    }
});

// Gérer les clics sur les notifications
browser.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
    if (notificationId.startsWith('stream_') && buttonIndex === 0) {
        const [, userId] = notificationId.split('_');
        browser.tabs.create({
            url: `https://twitch.tv/${userId}`
        });
    }
});

// Gestion des messages
browser.runtime.onMessage.addListener(async (message, sender) => {
    try {
        switch (message.type) {
            case 'INITIATE_AUTH':
                return await auth.initiateAuth();

            case 'SAVE_TOKEN':
                await auth.saveToken(message.token);
                return { success: true };

            case 'CHECK_AUTH':
                const isValid = await auth.validateToken();
                return { isAuthenticated: isValid };

            case 'GET_USER_DATA':
                const userData = await auth.getUserData();
                return { success: true, userData };

            case 'GET_FOLLOWED_CHANNELS':
                if (!auth.token) {
                    throw new Error('Non authentifié');
                }
                // On récupère d'abord les données de l'utilisateur pour avoir son ID
                const user = await auth.getUserData();
                if (!user || !user.id) {
                    throw new Error('Impossible de récupérer l\'ID utilisateur');
                }
                const channels = await getFollowedChannels(auth.token, user.id, message.first);
                return { success: true, ...channels };

            case 'GET_FOLLOWED_STREAMS':
                if (!auth.token) {
                    throw new Error('Non authentifié');
                }
                // On récupère d'abord les données de l'utilisateur pour avoir son ID
                const streamUser = await auth.getUserData();
                if (!streamUser || !streamUser.id) {
                    throw new Error('Impossible de récupérer l\'ID utilisateur');
                }
                const streams = await getFollowedStreams(auth.token, streamUser.id, message.first);
                return { success: true, ...streams };

            case 'LOGOUT':
                try {
                    // Supprimer le token d'accès et les données utilisateur
                    await browser.storage.local.remove(['accessToken', 'userData', 'refreshToken']);
                    // Nettoyer les autres données en cache si nécessaire
                    await browser.storage.local.remove(['followedChannels', 'streams']);
                    // Réinitialiser le token dans l'instance auth
                    auth.token = null;
                    
                    return { success: true };
                } catch (error) {
                    console.error('Logout error:', error);
                    return { success: false, error: error.message };
                }

            default:
                throw new Error('Type de message non reconnu');
        }
    } catch (error) {
        console.error('Erreur dans le background script:', error);
        return { success: false, error: error.message };
    }
}); 