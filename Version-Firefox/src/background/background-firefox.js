// Background script pour Firefox - Version compatible sans modules ES6

// Configuration Twitch API
const TWITCH_API = {
    CLIENT_ID: 's5cljtoy5dr0udoy0jmvh62u5979kf',
    CLIENT_SECRET: 'p5fk7tvo2q7qkndjec04e0b3kx3wss',
    AUTH_URL: 'https://id.twitch.tv/oauth2/authorize',
    TOKEN_URL: 'https://id.twitch.tv/oauth2/token',
    VALIDATE_URL: 'https://id.twitch.tv/oauth2/validate',
    API_URL: 'https://api.twitch.tv/helix',
    REDIRECT_URI: 'https://twitch-preview.vercel.app/api/auth/callback',
    SCOPES: ['user:read:follows', 'user:read:email']
};

// Classe d'authentification Twitch
class TwitchAuth {
    constructor() {
        this.token = null;
        this.lastValidation = 0;
        this.validationCacheDuration = 5 * 60 * 60 * 1000; // 5 hours
        this.loadTokenFromStorage();
    }

    static POPUP_CONFIG = {
        width: 800,
        height: 600,
        type: 'popup'
    };

    async loadTokenFromStorage() {
        const data = await browser.storage.local.get(['twitchToken', 'lastTokenValidation']);
        this.token = data.twitchToken || null;
        this.lastValidation = data.lastTokenValidation || 0;
    }

    async saveToken(token) {
        this.token = token;
        await browser.storage.local.set({ twitchToken: token });
    }

    async clearToken() {
        this.token = null;
        this.lastValidation = 0;
        await browser.storage.local.remove(['twitchToken', 'lastTokenValidation']);
    }

    isAuthenticated() {
        return !!this.token;
    }

    async initiateAuth() {
        const extensionUrl = browser.runtime.getURL('');
        const extensionId = extensionUrl.split('/')[2];


        const csrf = (typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID()
            : Math.random().toString(36).substring(2);

        const state = btoa(JSON.stringify({ csrf, extensionId }));

        const params = new URLSearchParams({
            response_type: 'token',
            client_id: TWITCH_API.CLIENT_ID,
            redirect_uri: TWITCH_API.REDIRECT_URI,
            scope: TWITCH_API.SCOPES.join(' '),
            state,
            force_verify: 'true'
        });

        const authUrl = `${TWITCH_API.AUTH_URL}?${params.toString()}`;

        await browser.windows.create({
            url: authUrl,
            type: TwitchAuth.POPUP_CONFIG.type,
            width: TwitchAuth.POPUP_CONFIG.width,
            height: TwitchAuth.POPUP_CONFIG.height
        });
    }

    async validateToken(forceValidation = false) {
        if (!this.token) return false;

        // Cache de validation - évite les appels API trop fréquents
        const now = Date.now();
        if (!forceValidation && (now - this.lastValidation) < this.validationCacheDuration) {
            return true; // Token considéré comme valide si récemment validé
        }

        try {
            const response = await fetch(TWITCH_API.VALIDATE_URL, {
                headers: {
                    'Authorization': `OAuth ${this.token}`
                }
            });

            const isValid = response.ok;
            if (isValid) {
                this.lastValidation = now;
                // Sauvegarder le timestamp de validation
                await browser.storage.local.set({
                    lastTokenValidation: now
                });
            } else {
                // Token invalide - le supprimer
                await this.clearToken();
            }

            return isValid;
        } catch (error) {
            console.error('Erreur de validation du token:', error);
            return false;
        }
    }

    async getUserData() {
        if (!this.token) {
            throw new Error('Utilisateur non authentifié');
        }

        const response = await fetch(`${TWITCH_API.API_URL}/users`, {
            headers: {
                'Client-ID': TWITCH_API.CLIENT_ID,
                'Authorization': `Bearer ${this.token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des données utilisateur');
        }

        const data = await response.json();
        return data.data[0];
    }

    async logout() {
        if (this.token) {
            try {
                await fetch('https://id.twitch.tv/oauth2/revoke', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        client_id: TWITCH_API.CLIENT_ID,
                        token: this.token
                    })
                });
            } catch (error) {
                console.error('Erreur lors de la révocation du token:', error);
            }
        }

        await this.clearToken();
    }
}

// Fonctions API Twitch
async function twitchApiRequest(endpoint, method = 'GET', token) {
    try {
        if (!token) throw new Error('Pas de token valide');

        const response = await fetch(`${TWITCH_API.API_URL}${endpoint}`, {
            method: method,
            headers: {
                'Client-ID': TWITCH_API.CLIENT_ID,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Erreur API Twitch: ${errorData.message || response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Erreur lors de la requête API:', error);
        throw error;
    }
}

async function getUsers(token, userIds) {
    if (!userIds || userIds.length === 0) {
        throw new Error('Au moins un ID utilisateur est requis');
    }

    const params = new URLSearchParams();
    userIds.slice(0, 100).forEach(id => params.append('id', id));

    const data = await twitchApiRequest(`/users?${params}`, 'GET', token);
    return {
        users: data?.data?.map(user => ({
            id: user.id,
            login: user.login,
            display_name: user.display_name,
            profile_image_url: user.profile_image_url,
            offline_image_url: user.offline_image_url,
            broadcaster_type: user.broadcaster_type,
            description: user.description,
            created_at: user.created_at
        })) || []
    };
}

async function getFollowedChannels(token, userId, first = 100) {
    if (!userId) {
        throw new Error('ID utilisateur requis');
    }

    const params = new URLSearchParams({
        user_id: userId,
        first: first.toString()
    });

    const data = await twitchApiRequest(`/channels/followed?${params}`, 'GET', token);

    const broadcasterIds = data?.data?.map(channel => channel.broadcaster_id) || [];
    const broadcastersDetails = broadcasterIds.length > 0
        ? await getUsers(token, broadcasterIds)
        : { users: [] };

    const channels = data?.data?.map(channel => {
        const broadcasterDetails = broadcastersDetails.users.find(
            user => user.id === channel.broadcaster_id
        ) || {};

        return {
            broadcaster_id: channel.broadcaster_id,
            broadcaster_login: channel.broadcaster_login,
            broadcaster_name: channel.broadcaster_name,
            display_name: broadcasterDetails.display_name,
            profile_image_url: broadcasterDetails.profile_image_url,
            offline_image_url: broadcasterDetails.offline_image_url,
            broadcaster_type: broadcasterDetails.broadcaster_type,
            description: broadcasterDetails.description,
            followed_at: channel.followed_at
        };
    }) || [];

    return {
        total: data?.total || 0,
        channels: channels,
        pagination: data?.pagination || {}
    };
}

async function getFollowedStreams(token, userId, first = 100) {
    if (!userId) {
        throw new Error('ID utilisateur requis');
    }

    const params = new URLSearchParams({
        user_id: userId,
        first: first.toString()
    });

    const data = await twitchApiRequest(`/streams/followed?${params}`, 'GET', token);

    const streamerIds = data?.data?.map(stream => stream.user_id) || [];
    const streamersDetails = streamerIds.length > 0
        ? await getUsers(token, streamerIds)
        : { users: [] };

    const streams = data?.data?.map(stream => {
        const streamerDetails = streamersDetails.users.find(
            user => user.id === stream.user_id
        ) || {};

        return {
            id: stream.id,
            user_id: stream.user_id,
            user_login: stream.user_login,
            user_name: stream.user_name,
            display_name: streamerDetails.display_name,
            profile_image_url: streamerDetails.profile_image_url,
            offline_image_url: streamerDetails.offline_image_url,
            broadcaster_type: streamerDetails.broadcaster_type,
            description: streamerDetails.description,
            game_id: stream.game_id,
            game_name: stream.game_name,
            title: stream.title,
            viewer_count: stream.viewer_count,
            started_at: stream.started_at,
            language: stream.language,
            thumbnail_url: stream.thumbnail_url?.replace('{width}x{height}', '440x248'),
            tags: stream.tags || [],
            is_mature: stream.is_mature
        };
    }) || [];

    return { streams };
}

// Gestionnaire de notifications
class NotificationManager {
    constructor() {
        this.lastNotifiedStreams = new Set();
        this.notificationPreferences = {
            enabled: true,
            favoritesOnly: false
        };
    }

    async initialize() {
        const storage = await browser.storage.local.get(['notificationPreferences', 'lastNotifiedStreams']);
        this.notificationPreferences = storage.notificationPreferences || this.notificationPreferences;
        this.lastNotifiedStreams = new Set(storage.lastNotifiedStreams || []);
        this.cleanOldNotifications();
    }

    async shouldNotifyStream(stream) {
        // 1. Vérifier si les notifications sont activées
        if (!this.notificationPreferences.enabled) {
            return false;
        }

        // 2. Vérifier si on a déjà notifié ce stream récemment
        const streamKey = `${stream.user_id}_${stream.started_at}`;
        if (this.lastNotifiedStreams.has(streamKey)) {
            return false;
        }

        // 3. Si mode "favoris uniquement", vérifier les favoris
        if (this.notificationPreferences.favoritesOnly) {
            try {
                const storage = await browser.storage.local.get('favorites');
                const favorites = storage.favorites || [];
                return favorites.includes(stream.user_id);
            } catch (error) {
                console.error('Erreur lors de la vérification des favoris:', error);
                return true; // En cas d'erreur, notifier quand même
            }
        }

        return true; // Notifier par défaut
    }

    async createStreamNotification(stream) {
        const notificationId = `stream_${stream.user_id}_${Date.now()}`;
        const streamKey = `${stream.user_id}_${stream.started_at}`;

        // Marquer comme notifié
        this.lastNotifiedStreams.add(streamKey);

        // Sauvegarder la liste des streams notifiés
        await browser.storage.local.set({
            lastNotifiedStreams: Array.from(this.lastNotifiedStreams)
        });

        // Options de notification compatibles Firefox
        const notificationOptions = {
            type: 'basic',
            iconUrl: stream.profile_image_url,
            title: `${stream.user_name} est en live !`,
            message: `Joue à ${stream.game_name}\n${stream.title}\n\nCliquez pour ouvrir le stream`
        };

        // Firefox ne supporte pas les boutons dans les notifications
        // On utilise juste le clic sur la notification elle-même
        await browser.notifications.create(notificationId, notificationOptions);
    }

    cleanOldNotifications() {
        const sixHoursAgo = Date.now() - (6 * 60 * 60 * 1000);
        this.lastNotifiedStreams = new Set(
            Array.from(this.lastNotifiedStreams).filter(streamKey => {
                const [, startedAt] = streamKey.split('_');
                return new Date(startedAt).getTime() > sixHoursAgo;
            })
        );
    }
}

// Initialisation
const auth = new TwitchAuth();
const notificationManager = new NotificationManager();

// Initialisation asynchrone au démarrage
(async () => {
    await auth.loadTokenFromStorage();
    await notificationManager.initialize();

    // Démarrer la surveillance si déjà authentifié
    if (auth.token && await auth.validateToken()) {
        startStreamChecking();
    }
})();

// État global pour le suivi des streams
const state = {
    activeStreams: new Map(),
    lastCheck: 0,
    checkInterval: 2 * 60 * 1000, // 2 minutes
    minCheckInterval: 1 * 60 * 1000, // 1 minute
    maxCheckInterval: 5 * 60 * 1000, // 5 minutes
    isPolling: false,
    alarmName: 'streamCheckAlarm',
    keepAliveInterval: 20 * 1000, // 20 secondes pour maintenir l'activité
    lastKeepalive: 0 // Timestamp du dernier keep-alive
};

// Fonction pour mettre à jour le badge
function updateBadge(count) {
    if (count > 0) {
        browser.action.setBadgeText({ text: count.toString() });
        browser.action.setBadgeBackgroundColor({ color: '#9146FF' });
    } else {
        browser.action.setBadgeText({ text: '' });
    }
}

// Fonction pour vérifier les nouveaux streams
async function checkNewStreams() {
    try {
        if (state.isPolling) return;
        state.isPolling = true;

        if (!auth.token || !(await auth.validateToken())) {
            stopStreamChecking();
            return;
        }

        const user = await auth.getUserData();
        if (!user || !user.id) {
            console.error('Impossible de récupérer l\'ID utilisateur');
            return;
        }

        const { streams } = await getFollowedStreams(auth.token, user.id);
        const currentStreams = new Map(streams.map(stream => [stream.id, stream]));

        for (const [streamId, stream] of currentStreams) {
            if (!state.activeStreams.has(streamId)) {
                // Vérifier si on doit notifier ce stream
                if (await notificationManager.shouldNotifyStream(stream)) {
                    await notificationManager.createStreamNotification(stream);
                }
            }
        }

        updateBadge(currentStreams.size);
        state.activeStreams = currentStreams;
        state.lastCheck = Date.now();

        const streamCountDiff = Math.abs(currentStreams.size - state.activeStreams.size);
        if (streamCountDiff > 0) {
            state.checkInterval = Math.max(state.minCheckInterval, state.checkInterval * 0.8);
        } else {
            state.checkInterval = Math.min(state.maxCheckInterval, state.checkInterval * 1.2);
        }

    } catch (error) {
        console.error('Erreur lors de la vérification des streams:', error);
    } finally {
        state.isPolling = false;
        scheduleNextCheck();
    }
}

// Planifier la prochaine vérification avec les alarmes
function scheduleNextCheck() {
    const delayInMinutes = Math.max(1, Math.floor(state.checkInterval / (60 * 1000)));
    browser.alarms.create(state.alarmName, { delayInMinutes });
}

// Démarrer la surveillance des streams
function startStreamChecking() {
    stopStreamChecking(); // Arrêter toute surveillance existante
    checkNewStreams(); // Vérifier immédiatement
    startKeepAlive(); // Maintenir l'activité
}

// Arrêter la surveillance des streams
function stopStreamChecking() {
    browser.alarms.clear(state.alarmName);
    stopKeepAlive();
    state.activeStreams.clear();
    state.lastCheck = 0;
    updateBadge(0);
}

// Système Keep-Alive pour maintenir l'activité en Manifest V3
let keepAliveTimer = null;
let wakeLockPort = null;

function startKeepAlive() {
    stopKeepAlive();

    // Méthode 1: Keep-alive via alarms courtes
    browser.alarms.create('keepAlive', {
        delayInMinutes: 0.5, // 30 secondes
        periodInMinutes: 0.5
    });

    // Méthode 2: Port de communication maintenu ouvert
    try {
        wakeLockPort = browser.runtime.connect({ name: 'keepAlive' });
        wakeLockPort.onDisconnect.addListener(() => {
            wakeLockPort = null;
            setTimeout(startKeepAlive, 1000); // Reconnexion auto
        });
    } catch (error) {
        console.error('Erreur port keepAlive:', error);
    }

    // Méthode 3: Timer classique en backup
    keepAliveTimer = setInterval(() => {
        browser.runtime.getPlatformInfo().catch(() => { });
        // Force un petit calcul pour maintenir l'activité
        const now = Date.now();
        state.lastKeepalive = now;
    }, state.keepAliveInterval);
}

function stopKeepAlive() {
    browser.alarms.clear('keepAlive');

    if (wakeLockPort) {
        wakeLockPort.disconnect();
        wakeLockPort = null;
    }

    if (keepAliveTimer) {
        clearInterval(keepAliveTimer);
        keepAliveTimer = null;
    }
}

// Gestion des messages
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const handleMessage = async () => {
        try {
            switch (message.type) {
                case 'INITIATE_AUTH':
                    return await auth.initiateAuth();

                case 'SAVE_TOKEN':
                    await auth.saveToken(message.token);
                    startStreamChecking();
                    return { success: true };

                case 'CHECK_AUTH':
                    const isValid = await auth.validateToken();
                    if (isValid && !keepAliveTimer) {
                        startStreamChecking();
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
                    stopStreamChecking();
                    return { success: true };

                case 'GET_STATUS':
                    return {
                        success: true,
                        status: {
                            isAuthenticated: !!auth.token,
                            isMonitoring: !!keepAliveTimer,
                            activeStreamsCount: state.activeStreams.size,
                            lastCheck: state.lastCheck,
                            lastValidation: auth.lastValidation
                        }
                    };

                default:
                    throw new Error('Type de message non reconnu');
            }
        } catch (error) {
            console.error('Erreur dans le background script:', error);
            return { success: false, error: error.message };
        }
    };

    handleMessage().then(sendResponse);
    return true;
});

// Gestion des alarmes pour maintenir la surveillance
browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === state.alarmName) {
        checkNewStreams();
    } else if (alarm.name === 'keepAlive') {
        // Keep-alive ping - maintient le service worker actif
        const now = Date.now();
        state.lastKeepalive = now;

        // Vérifier si on doit redémarrer la surveillance
        if (auth.token && !keepAliveTimer) {
            startKeepAlive();
        }
    }
});

// Gestion des clics sur les notifications
browser.notifications.onClicked.addListener((notificationId) => {
    if (notificationId.startsWith('stream_')) {
        // Extraire l'ID utilisateur et timestamp du notificationId
        const parts = notificationId.replace('stream_', '').split('_');
        const userId = parts[0];

        // Trouver le stream correspondant dans les streams actifs
        let targetStream = null;
        for (const [streamId, stream] of state.activeStreams) {
            if (stream.user_id === userId) {
                targetStream = stream;
                break;
            }
        }

        if (targetStream) {
            // Ouvrir le stream sur Twitch
            browser.tabs.create({
                url: `https://twitch.tv/${targetStream.user_login}`
            });

            // Fermer la notification après clic
            browser.notifications.clear(notificationId);
        }
    }
});

// Maintenir l'activité même en cas de suspension
browser.runtime.onSuspend.addListener(() => {
    // Sauvegarder l'état avant suspension
    browser.storage.local.set({
        isMonitoring: !!keepAliveTimer,
        lastActiveCheck: Date.now()
    });
});

// Reprendre l'activité après réveil
browser.runtime.onStartup.addListener(async () => {
    await restoreMonitoring();
});

browser.runtime.onInstalled.addListener(async () => {
    await restoreMonitoring();
});

// Gestionnaire de ports pour le keep-alive
browser.runtime.onConnect.addListener((port) => {
    if (port.name === 'keepAlive') {
        port.onDisconnect.addListener(() => {
            // Le port se déconnecte - on peut relancer le keep-alive si nécessaire
            setTimeout(() => {
                if (auth.token && keepAliveTimer) {
                    startKeepAlive();
                }
            }, 1000);
        });
    }
});

// Fonction pour restaurer la surveillance
async function restoreMonitoring() {
    try {
        const storage = await browser.storage.local.get(['isMonitoring', 'lastActiveCheck']);

        // Si l'extension surveillait avant et qu'on a un token valide
        if (storage.isMonitoring && auth.token) {
            const isValid = await auth.validateToken();
            if (isValid) {
                startStreamChecking();
            }
        }
    } catch (error) {
        console.error('Erreur lors de la restauration de la surveillance:', error);
    }
}

