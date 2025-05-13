import { TwitchAuth } from './auth.js';
import { getFollowedChannels, getFollowedStreams } from '../api/twitch.js';
import { notificationManager } from '../utils/notifications.js';

// Initialisation de l'authentification
const auth = new TwitchAuth();

// État global pour le suivi des streams
const state = {
    activeStreams: new Map(), // Map des streams actuellement en ligne
    lastCheck: 0, // Timestamp de la dernière vérification
    checkInterval: 2 * 60 * 1000, // Intervalle de vérification (2 minutes)
    minCheckInterval: 1 * 60 * 1000, // Intervalle minimum (1 minute)
    maxCheckInterval: 5 * 60 * 1000, // Intervalle maximum (5 minutes)
    isPolling: false, // Flag pour éviter les vérifications simultanées
    timeoutId: null // ID du timeout pour le prochain check
};

// Fonction pour mettre à jour le badge
function updateBadge(count) {
    if (count > 0) {
        chrome.action.setBadgeText({ text: count.toString() });
        chrome.action.setBadgeBackgroundColor({ color: '#9146FF' });
    } else {
        chrome.action.setBadgeText({ text: '' });
    }
}

// Fonction pour vérifier les nouveaux streams
async function checkNewStreams() {
    try {
        // Éviter les vérifications simultanées
        if (state.isPolling) return;
        state.isPolling = true;

        // Vérifier l'authentification
        if (!auth.token || !(await auth.validateToken())) {
            console.log('Token invalide, arrêt de la surveillance');
            stopStreamChecking();
            return;
        }

        // Récupérer l'ID de l'utilisateur
        const user = await auth.getUserData();
        if (!user || !user.id) {
            console.error('Impossible de récupérer l\'ID utilisateur');
            return;
        }

        // Récupérer les streams actuels
        const { streams } = await getFollowedStreams(auth.token, user.id);
        const currentStreams = new Map(streams.map(stream => [stream.id, stream]));

        // Détecter les nouveaux streams et notifier via le notificationManager
        for (const [streamId, stream] of currentStreams) {
            if (!state.activeStreams.has(streamId)) {
                // Nouveau stream détecté, utiliser le notificationManager
                await notificationManager.createStreamNotification(stream);
            }
        }

        // Mettre à jour le badge avec le nombre total de streams
        updateBadge(currentStreams.size);

        // Mettre à jour l'état
        state.activeStreams = currentStreams;
        state.lastCheck = Date.now();

        // Ajuster dynamiquement l'intervalle de vérification
        const streamCountDiff = Math.abs(currentStreams.size - state.activeStreams.size);
        if (streamCountDiff > 0) {
            // Si des changements sont détectés, réduire l'intervalle
            state.checkInterval = Math.max(state.minCheckInterval, state.checkInterval * 0.8);
        } else {
            // Si aucun changement, augmenter progressivement l'intervalle
            state.checkInterval = Math.min(state.maxCheckInterval, state.checkInterval * 1.2);
        }

    } catch (error) {
        console.error('Erreur lors de la vérification des streams:', error);
    } finally {
        state.isPolling = false;
        scheduleNextCheck();
    }
}

// Planifier la prochaine vérification
function scheduleNextCheck() {
    if (state.timeoutId) {
        clearTimeout(state.timeoutId);
    }
    state.timeoutId = setTimeout(checkNewStreams, state.checkInterval);
}

// Démarrer la surveillance des streams
function startStreamChecking() {
    stopStreamChecking(); // Arrêter toute surveillance existante
    checkNewStreams(); // Vérifier immédiatement
}

// Arrêter la surveillance des streams
function stopStreamChecking() {
    if (state.timeoutId) {
        clearTimeout(state.timeoutId);
        state.timeoutId = null;
    }
    state.activeStreams.clear();
    state.lastCheck = 0;
    updateBadge(0);
}

// Gestion des messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const handleMessage = async () => {
        try {
            switch (message.type) {
                case 'INITIATE_AUTH':
                    return await auth.initiateAuth();

                case 'SAVE_TOKEN':
                    await auth.saveToken(message.token);
                    startStreamChecking(); // Démarrer la surveillance après l'authentification
                    return { success: true };

                case 'CHECK_AUTH':
                    const isValid = await auth.validateToken();
                    if (isValid && !state.timeoutId) {
                        startStreamChecking(); // Redémarrer la surveillance si nécessaire
                    }
                    return { isAuthenticated: isValid };

                case 'GET_USER_DATA':
                    const userData = await auth.getUserData();
                    return { success: true, userData };

                case 'GET_FOLLOWED_CHANNELS':
                    if (!auth.token) throw new Error('Non authentifié');
                    const user = await auth.getUserData();
                    if (!user || !user.id) throw new Error('Impossible de récupérer l\'ID utilisateur');
                    const channels = await getFollowedChannels(auth.token, user.id, message.first);
                    return { success: true, ...channels };

                case 'GET_FOLLOWED_STREAMS':
                    if (!auth.token) throw new Error('Non authentifié');
                    const streamUser = await auth.getUserData();
                    if (!streamUser || !streamUser.id) throw new Error('Impossible de récupérer l\'ID utilisateur');
                    const streams = await getFollowedStreams(auth.token, streamUser.id, message.first);
                    return { success: true, ...streams };

                case 'LOGOUT':
                    await auth.logout();
                    stopStreamChecking(); // Arrêter la surveillance lors de la déconnexion
                    return { success: true };

                default:
                    throw new Error('Type de message non reconnu');
            }
        } catch (error) {
            console.error('Erreur dans le background script:', error);
            return { success: false, error: error.message };
        }
    };

    // Gérer la réponse asynchrone
    handleMessage().then(sendResponse);
    return true; // Indique que la réponse sera envoyée de manière asynchrone
});

// Gestion des clics sur les notifications
chrome.notifications.onClicked.addListener((notificationId) => {
    if (notificationId.startsWith('stream-')) {
        const streamId = notificationId.replace('stream-', '');
        const stream = state.activeStreams.get(streamId);
        if (stream) {
            // Ouvrir le stream dans un nouvel onglet
            chrome.tabs.create({
                url: `https://twitch.tv/${stream.user_login}`
            });
        }
    }
});

// Initialiser le notificationManager au démarrage
notificationManager.initialize(); 